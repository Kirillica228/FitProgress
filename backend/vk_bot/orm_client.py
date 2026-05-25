"""
Замена api_client.py: вся логика работает напрямую через Django ORM,
без HTTP-запросов к бэкенду. Бот теперь является частью Django-проекта.
"""
import logging
import requests

from django.contrib.auth import authenticate

from users.models import User
from workouts.models import Workout, WorkoutSession
from nutrition.models import FoodEntry
from progress.models import BodyMeasurement

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
    """
    user = authenticate(username=username, password=password)
    if user is not None and user.is_active:
        return {"user": user}
    return None


def link_vk(user: "User", vk_id: int) -> bool:
    """
    Привязывает vk_id к пользователю.
    Возвращает True при успехе, False если vk_id занят другим аккаунтом.
    """
    if User.objects.filter(vk_id=vk_id).exclude(pk=user.pk).exists():
        return False
    user.vk_id = vk_id
    user.save(update_fields=["vk_id"])
    return True


def get_workouts(workout_type: str = "", difficulty: str = "") -> list[dict]:
    """Возвращает список тренировок (каталог)."""
    qs = Workout.objects.prefetch_related("exercises__exercise").all()
    if workout_type:
        qs = qs.filter(type=workout_type)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)

    result = []
    for w in qs:
        exercises = []
        for we in w.exercises.all():
            exercises.append({
                "name": we.exercise.name,
                "sets": we.sets,
                "reps": we.reps,
            })
        result.append({
            "id": w.pk,
            "name": w.name,
            "type": w.type,
            "difficulty": w.difficulty,
            "exercises": exercises,
        })
    return result


def save_workout_session(vk_id: int, workout_id: int | None = None) -> bool:
    """
    Обёртка для вызова из бота: находит пользователя по vk_id
    и создаёт тренировочную сессию. Возвращает True при успехе.
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        return False
    try:
        create_workout_session(user, workout_id)
        return True
    except Exception as exc:
        log.warning("save_workout_session error: %s", exc)
        return False


def create_workout_session(user: "User", workout_id: int | None = None,
                           duration: int | None = None,
                           comment: str = "") -> dict:
    """Создаёт тренировочную сессию."""
    workout = None
    if workout_id:
        try:
            workout = Workout.objects.get(pk=workout_id)
        except Workout.DoesNotExist:
            pass

    session = WorkoutSession.objects.create(
        user=user,
        workout=workout,
        duration=duration,
        comment=comment,
    )
    return {
        "id": session.pk,
        "workout_name": workout.name if workout else "Свободная тренировка",
        "created_at": session.created_at.isoformat(),
    }


def add_food_entry(user: "User", food_name: str, calories: float,
                   meal_type: str = "snack") -> dict:
    """Добавляет запись питания."""
    entry = FoodEntry.objects.create(
        user=user,
        food_name=food_name,
        calories=calories,
        meal_type=meal_type,
    )
    return {
        "id": entry.pk,
        "food_name": entry.food_name,
        "calories": entry.calories,
        "meal_type": entry.meal_type,
    }


def search_food(product_name: str) -> "dict | None":
    """Ищет продукт в Open Food Facts и возвращает нутриенты."""
    return _search_off(product_name)


def add_measurement(user: "User", weight: float,
                    chest: float | None = None,
                    waist: float | None = None,
                    hips: float | None = None) -> dict:
    """Добавляет замер тела."""
    m = BodyMeasurement.objects.create(
        user=user,
        weight=weight,
        chest=chest,
        waist=waist,
        hips=hips,
    )
    return {
        "id": m.pk,
        "weight": m.weight,
        "chest": m.chest,
        "waist": m.waist,
        "hips": m.hips,
        "created_at": m.created_at.isoformat(),
    }


def save_food_entry(vk_id: int, food_name: str, calories: float,
                    meal_type: str = "snack") -> "dict | None":
    """
    Обёртка для вызова из бота: находит пользователя по vk_id
    и добавляет запись питания. Возвращает dict при успехе или None.
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        return None
    try:
        return add_food_entry(user, food_name, calories, meal_type)
    except Exception as exc:
        log.warning("save_food_entry error: %s", exc)
        return None


def save_measurement(vk_id: int, weight: float,
                     chest: float | None = None,
                     waist: float | None = None,
                     hips: float | None = None) -> bool:
    """
    Обёртка для вызова из бота: находит пользователя по vk_id
    и добавляет замер тела. Возвращает True при успехе.
    """
    user = _get_user_by_vk_id(vk_id)
    if not user:
        return False
    try:
        add_measurement(user, weight, chest=chest, waist=waist, hips=hips)
        return True
    except Exception as exc:
        log.warning("save_measurement error: %s", exc)
        return False
