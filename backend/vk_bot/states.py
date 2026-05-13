"""
FSM-состояния диалога VK-бота.
Хранятся в памяти процесса: user_states[vk_id] = State.XXX
user_data[vk_id] = {...} — временные данные в рамках сессии.
"""


class State:
    # Начало / авторизация
    IDLE = "idle"
    WAIT_USERNAME = "wait_username"
    WAIT_PASSWORD = "wait_password"

    # Тренировки
    WORKOUT_CATEGORY = "workout_category"
    WORKOUT_DIFFICULTY = "workout_difficulty"
    WORKOUT_ACTIVE = "workout_active"       # тренировка показана, ждём «Завершить»

    # Питание
    FOOD_INPUT = "food_input"               # ждём текст «продукт Xг»

    # Замеры тела (многошаговый диалог)
    MEASUREMENT_WEIGHT = "measurement_weight"   # ждём вес (обязательно)
    MEASUREMENT_CHEST  = "measurement_chest"    # ждём обхват груди (можно пропустить)
    MEASUREMENT_WAIST  = "measurement_waist"    # ждём обхват талии (можно пропустить)
    MEASUREMENT_HIPS   = "measurement_hips"     # ждём обхват бёдер (можно пропустить)


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
