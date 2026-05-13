"""
Замена api_client.py: вся логика работает напрямую через Django ORM,
без HTTP-запросов к бэкенду. Бот теперь является частью Django-проекта.
"""
import logging
import requests

from django.contrib.auth import authenticate

from main.models import (
    User,
    Workout,
    WorkoutSession,
    FoodEntry,
    BodyMeasurement,
)

log = logging.getLogger(__name__)


# ── Вспомогательные функции ───────────────────────────────────────────────────

def get_user_by_vk_id(vk_id: int) -> "User | None":
    """Возвращает пользователя по vk_id или None."""
    try:
        return User.objects.get(vk_id=vk_id)
    except User.DoesNotExist:
        return None


# Приватный алиас для внутреннего использования внутри модуля
_get_user_by_vk_id = get_user_by_vk_id


def _search_off(product_name: str) -> "dict | None":
    """
    Ищет продукт в Open Food Facts.
    Возвращает словарь с ккал/белки/жиры/углеводы на 100г или None.
    Логика идентична bot_views.BotFoodEntryView._search_off.
    """
    try:
        url = "https://world.openfoodfacts.org/cgi/search.pl"
        params = {
            "search_terms": product_name,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 5,
            "fields": "product_name,nutriments,id",
        }
        resp = requests.get(url, params=params, timeout=8)
        resp.raise_for_status()
        data = resp.json()

        products = data.get("products", [])
        if not products:
            return None

        # берём первый продукт с заполненными нутриентами
        for product in products:
            nutriments = product.get("nutriments", {})
            calories_100 = (
                nutriments.get("energy-kcal_100g")
                or nutriments.get("energy-kcal")
            )
            if calories_100 is None:
                continue
            return {
                "product_name": product.get("product_name", product_name),
                "off_product_id": product.get("id", ""),
                "calories_100g": float(calories_100),
                "protein_100g": float(nutriments.get("proteins_100g", 0)),
                "fats_100g": float(nutriments.get("fat_100g", 0)),
                "carbs_100g": float(nutriments.get("carbohydrates_100g", 0)),
            }
    except Exception as exc:
        log.warning("Open Food Facts error: %s", exc)
    return None


# ── Публичный API (аналог функций api_client.py) ──────────────────────────────

def login(username: str, password: str) -> "dict | None":
    """
    Аутентифицирует пользователя через Django auth.
    Возвращает {"user": <User>} при успехе или None.

    Вместо JWT-токенов возвращаем объект пользователя — бот работает
    внутри Django и не нуждается в токенах для собственных вызовов.
    """
    user = authenticate(username=username, password=password)
    if user is not None and user.is_active:
        return {"user": user}
    return None


def link_vk(user: "User", vk_id: int) -> bool:
    """
    Привязывает vk_id к пользователю.
    Возвращает True при успехе, False если vk_id занят другим аккаунтом.
    Логика идентична BotLinkVkView.post.
    """
    # Проверяем, не занят ли vk_id другим пользователем
    existing = User.objects.filter(vk_id=vk_id).exclude(pk=user.pk).first()
    if existing:
        log.warning(
            "vk_id=%s уже привязан к пользователю %s", vk_id, existing.username
        )
        return False

    user.vk_id = vk_id
    user.save(update_fields=["vk_id"])
    return True


def get_workouts(workout_type: str, difficulty: str) -> list:
    """
    Возвращает список тренировок по категории и сложности.
    Логика идентична BotWorkoutsView.get.
    """
    from main.serializers.workout_serializers import WorkoutSerializer

    qs = Workout.objects.prefetch_related("exercises__exercise")
    if workout_type:
        qs = qs.filter(type=workout_type)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    return list(WorkoutSerializer(qs, many=True).data)


def save_workout_session(vk_id: int, workout_id: int) -> bool:
    """
    Сохраняет факт выполнения тренировки.
    Логика идентична BotWorkoutSessionView.post.
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        log.error("save_workout_session: пользователь с vk_id=%s не найден", vk_id)
        return False

    workout = None
    if workout_id:
        try:
            workout = Workout.objects.get(pk=workout_id)
        except Workout.DoesNotExist:
            log.error("save_workout_session: тренировка id=%s не найдена", workout_id)
            return False

    WorkoutSession.objects.create(user=user, workout=workout)
    return True


def save_food_entry(
    vk_id: int,
    food_name: str,
    grams: float,
    meal_type: str = "snack",
) -> "dict | None":
    """
    Записывает приём пищи. Ищет продукт в Open Food Facts.
    Логика идентична BotFoodEntryView.post.
    Возвращает словарь с данными записи или None при ошибке.
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        log.error("save_food_entry: пользователь с vk_id=%s не найден", vk_id)
        return None

    off_data = _search_off(food_name)

    if off_data:
        ratio = grams / 100.0
        calories = round(off_data["calories_100g"] * ratio, 1)
        protein = round(off_data["protein_100g"] * ratio, 1)
        fats = round(off_data["fats_100g"] * ratio, 1)
        carbs = round(off_data["carbs_100g"] * ratio, 1)
        resolved_name = off_data["product_name"] or food_name
        off_product_id = off_data["off_product_id"]
    else:
        calories = protein = fats = carbs = 0.0
        resolved_name = food_name
        off_product_id = ""

    entry = FoodEntry.objects.create(
        user=user,
        food_name=resolved_name,
        off_product_id=off_product_id,
        grams=grams,
        calories=calories,
        protein=protein,
        fats=fats,
        carbs=carbs,
        meal_type=meal_type,
    )

    return {
        "entry_id": entry.pk,
        "food_name": resolved_name,
        "grams": grams,
        "calories": calories,
        "protein": protein,
        "fats": fats,
        "carbs": carbs,
        "found_in_off": off_data is not None,
    }


def save_measurement(
    vk_id: int,
    weight: float,
    chest: "float | None" = None,
    waist: "float | None" = None,
    hips: "float | None" = None,
) -> bool:
    """
    Записывает замер тела (вес обязателен, остальные поля опциональны).
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        log.error("save_measurement: пользователь с vk_id=%s не найден", vk_id)
        return False

    BodyMeasurement.objects.create(
        user=user,
        weight=weight,
        chest=chest,
        waist=waist,
        hips=hips,
    )
    return True
