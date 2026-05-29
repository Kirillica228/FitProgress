"""
ORM-клиент VK-бота FitProgress.
Работает напрямую через Django ORM + внешний API FoodData Central (USDA).
"""
import uuid
import logging
import requests

from django.conf import settings
from django.contrib.auth import authenticate

from users.models import User
from workouts.models import Exercise, WorkoutSession, WorkoutSessionExercise, Set as WorkoutSet
from nutrition.models import FoodEntry
from progress.models import BodyMeasurement

log = logging.getLogger(__name__)

# API-ключ FoodData Central (из .env → settings)
FDC_API_KEY = getattr(settings, "FDC_API_KEY", "DEMO_KEY")


# ══════════════════════════════════════════════════════════════════════════════
# Вспомогательные функции
# ══════════════════════════════════════════════════════════════════════════════

def get_user_by_vk_id(vk_id: int) -> "User | None":
    """Возвращает пользователя по vk_id или None."""
    try:
        return User.objects.get(vk_id=vk_id)
    except User.DoesNotExist:
        return None


_get_user = get_user_by_vk_id  # короткий алиас


# ══════════════════════════════════════════════════════════════════════════════
# Авторизация
# ══════════════════════════════════════════════════════════════════════════════

def login(username: str, password: str) -> "dict | None":
    """Аутентифицирует пользователя через Django auth."""
    user = authenticate(username=username, password=password)
    if user is not None and user.is_active:
        return {"user": user}
    return None


def link_vk(user: "User", vk_id: int) -> bool:
    """Привязывает vk_id к пользователю."""
    if User.objects.filter(vk_id=vk_id).exclude(pk=user.pk).exists():
        return False
    user.vk_id = vk_id
    user.save(update_fields=["vk_id"])
    return True


# ══════════════════════════════════════════════════════════════════════════════
# Тренировки — поиск упражнений
# ══════════════════════════════════════════════════════════════════════════════

def search_exercises(query: str, limit: int = 8) -> list[dict]:
    """
    Ищет упражнения в БД по названию (icontains).
    Возвращает список словарей с id и name.
    """
    qs = Exercise.objects.filter(name__icontains=query)[:limit]
    return [{"id": ex.pk, "name": ex.name} for ex in qs]


def get_exercise_by_id(exercise_id: int) -> "dict | None":
    """Возвращает полную карточку упражнения по ID."""
    try:
        ex = Exercise.objects.get(pk=exercise_id)
    except Exercise.DoesNotExist:
        return None
    return {
        "id": ex.pk,
        "name": ex.name,
        "part_body": ex.part_body,
        "equipment": ex.equipment or "—",
        "main_muscles": ex.main_muscles,
        "accessory_muscles": ex.accessory_muscles,
    }


# ══════════════════════════════════════════════════════════════════════════════
# Тренировки — сохранение пользовательской тренировки
# ══════════════════════════════════════════════════════════════════════════════

def save_custom_workout(vk_id: int, exercises: list[dict]) -> bool:
    """
    Сохраняет пользовательскую тренировку.

    exercises — список словарей:
        [
            {"exercise_id": 15, "weight": 80.0, "sets": 4, "duration": 0},
            ...
        ]

    Создаёт WorkoutSession (без привязки к каталожной Workout),
    WorkoutSessionExercise и Set для каждого упражнения.
    """
    user = _get_user(vk_id)
    if not user:
        return False

    if not exercises:
        return False

    try:
        session = WorkoutSession.objects.create(
            user=user,
            workout=None,  # пользовательская тренировка, не из каталога
            duration=None,
            comment="Собрана через VK-бота",
        )

        for order, ex_data in enumerate(exercises, start=1):
            exercise_id = ex_data.get("exercise_id")
            try:
                exercise = Exercise.objects.get(pk=exercise_id)
            except Exercise.DoesNotExist:
                continue

            session_exercise = WorkoutSessionExercise.objects.create(
                session=session,
                exercise=exercise,
                order=order,
            )

            sets_count = ex_data.get("sets", 1)
            weight = ex_data.get("weight")
            duration = ex_data.get("duration")

            for _ in range(sets_count):
                WorkoutSet.objects.create(
                    session_exercise=session_exercise,
                    reps=1,  # для пользовательских тренировок 1 повтор на подход
                    weight=weight if weight and weight > 0 else None,
                    duration=duration if duration and duration > 0 else None,
                )

        return True
    except Exception as exc:
        log.warning("save_custom_workout error: %s", exc)
        return False


# ══════════════════════════════════════════════════════════════════════════════
# Питание — FoodData Central API (USDA)
# ══════════════════════════════════════════════════════════════════════════════

def search_food_fdc(query: str, limit: int = 5) -> list[dict]:
    """
    Ищет продукты через FoodData Central API.

    Возвращает список:
    [
        {
            "fdc_id": 171077,
            "description": "Chicken, breast, raw",
            "calories_100g": 120.0,
            "protein_100g": 22.5,
            "fats_100g": 2.6,
            "carbs_100g": 0.0,
        },
        ...
    ]
    """
    try:
        url = "https://api.nal.usda.gov/fdc/v1/foods/search"
        params = {
            "api_key": FDC_API_KEY,
            "query": query,
            "pageSize": limit,
            "dataType": ["Survey (FNDDS)", "Foundation", "SR Legacy"],
        }
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        results = []
        for food in data.get("foods", []):
            nutrients = {n["nutrientName"]: n.get("value", 0) for n in food.get("foodNutrients", [])}

            calories = nutrients.get("Energy", 0)
            protein = nutrients.get("Protein", 0)
            fats = nutrients.get("Total lipid (fat)", 0)
            carbs = nutrients.get("Carbohydrate, by difference", 0)

            results.append({
                "fdc_id": food.get("fdcId"),
                "description": food.get("description", ""),
                "calories_100g": float(calories),
                "protein_100g": float(protein),
                "fats_100g": float(fats),
                "carbs_100g": float(carbs),
            })

        return results
    except Exception as exc:
        log.warning("FoodData Central API error: %s", exc)
        return []


def calculate_nutrients(food_data: dict, grams: float) -> dict:
    """
    Рассчитывает КБЖУ на указанное количество грамм.
    food_data — словарь из search_food_fdc (значения на 100г).
    """
    factor = grams / 100.0
    return {
        "calories": round(food_data["calories_100g"] * factor, 1),
        "protein": round(food_data["protein_100g"] * factor, 1),
        "fats": round(food_data["fats_100g"] * factor, 1),
        "carbs": round(food_data["carbs_100g"] * factor, 1),
    }


def save_food_entries(vk_id: int, items: list[dict], meal_type: str) -> bool:
    """
    Сохраняет список продуктов как один приём пищи.

    items — список словарей:
        [
            {
                "food_name": "Chicken breast",
                "fdc_id": 171077,
                "grams": 200,
                "calories": 240.0,
                "protein": 45.0,
                "fats": 5.2,
                "carbs": 0.0,
            },
            ...
        ]
    """
    user = _get_user(vk_id)
    if not user:
        return False

    if not items:
        return False

    try:
        group_id = uuid.uuid4()

        for item in items:
            FoodEntry.objects.create(
                user=user,
                food_name=item["food_name"],
                fdc_id=item.get("fdc_id"),
                grams=item.get("grams", 100),
                calories=item["calories"],
                protein=item.get("protein", 0),
                fats=item.get("fats", 0),
                carbs=item.get("carbs", 0),
                meal_type=meal_type,
                meal_group=group_id,
            )

        return True
    except Exception as exc:
        log.warning("save_food_entries error: %s", exc)
        return False


# ══════════════════════════════════════════════════════════════════════════════
# Замеры тела (без изменений)
# ══════════════════════════════════════════════════════════════════════════════

def save_measurement(vk_id: int, weight: float,
                     chest: float | None = None,
                     waist: float | None = None,
                     hips: float | None = None) -> bool:
    """Сохраняет замер тела."""
    user = _get_user(vk_id)
    if not user:
        return False
    try:
        BodyMeasurement.objects.create(
            user=user,
            weight=weight,
            chest=chest,
            waist=waist,
            hips=hips,
        )
        return True
    except Exception as exc:
        log.warning("save_measurement error: %s", exc)
        return False
