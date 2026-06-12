"""
FSM-состояния диалога VK-бота FitProgress.
Хранятся в памяти процесса: user_states[vk_id] = State.XXX
user_data[vk_id] = {...} — временные данные в рамках сессии.
"""


class State:
    # Начало / авторизация
    IDLE = "idle"
    WAIT_USERNAME = "wait_username"
    WAIT_PASSWORD = "wait_password"

    # ── Тренировки (пользователь собирает свою тренировку) ──
    WORKOUT_SEARCH = "workout_search"               # ждём название упражнения для поиска
    WORKOUT_SELECT = "workout_select"               # ждём выбор упражнения из списка (/ex_ID)
    WORKOUT_VIEW = "workout_view"                   # просмотр карточки упражнения
    WORKOUT_WEIGHT = "workout_weight"               # ввод веса (кг)
    WORKOUT_SETS = "workout_sets"                   # ввод кол-ва подходов
    WORKOUT_REPS = "workout_reps"                   # ввод кол-ва повторений в подходе
    WORKOUT_DURATION = "workout_duration"           # ввод продолжительности (сек)
    WORKOUT_BUILDING = "workout_building"           # тренировка собирается, ждём действие

    # ── Питание (поиск через FoodData Central) ──
    FOOD_INPUT = "food_input"                       # ждём название продукта + граммы
    FOOD_SELECT = "food_select"                     # ждём выбор продукта из списка (/fd_ID)
    FOOD_CONFIRM = "food_confirm"                   # подтверждение / добавить ещё
    FOOD_MEAL_TYPE = "food_meal_type"               # выбор типа приёма пищи

    # ── Замеры тела (без изменений) ──
    MEASUREMENT_WEIGHT = "measurement_weight"
    MEASUREMENT_CHEST = "measurement_chest"
    MEASUREMENT_WAIST = "measurement_waist"
    MEASUREMENT_HIPS = "measurement_hips"


# Глобальные словари состояний (живут в памяти процесса)
user_states: dict[int, str] = {}
user_data: dict[int, dict] = {}


def get_state(vk_id: int) -> str:
    return user_states.get(vk_id, State.IDLE)


def set_state(vk_id: int, state: str) -> None:
    user_states[vk_id] = state


def get_data(vk_id: int) -> dict:
    return user_data.setdefault(vk_id, {})


def set_data(vk_id: int, key: str, value) -> None:
    user_data.setdefault(vk_id, {})[key] = value


def clear_data(vk_id: int) -> None:
    user_data.pop(vk_id, None)
    user_states.pop(vk_id, None)
