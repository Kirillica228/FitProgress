"""
VK-клавиатуры для бота FitProgress.
"""
import json

from vk_api.keyboard import VkKeyboard, VkKeyboardColor


def main_menu() -> str:
    """Главное меню: Тренировки / Питание / Замеры."""
    kb = VkKeyboard(one_time=False)
    kb.add_button("🏋️ Тренировки", color=VkKeyboardColor.PRIMARY)
    kb.add_button("🥗 Питание", color=VkKeyboardColor.PRIMARY)
    kb.add_line()
    kb.add_button("📏 Замеры", color=VkKeyboardColor.SECONDARY)
    return kb.get_keyboard()


def back_to_menu() -> str:
    """Одна кнопка «Главное меню»."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


# ── Тренировки ────────────────────────────────────────────────────────────────

def workout_search() -> str:
    """Клавиатура при поиске упражнений."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def workout_exercise_view() -> str:
    """Просмотр карточки упражнения: добавить / искать ещё / назад."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("➕ Добавить в тренировку", color=VkKeyboardColor.POSITIVE)
    kb.add_line()
    kb.add_button("🔍 Искать ещё", color=VkKeyboardColor.PRIMARY)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def workout_building() -> str:
    """Тренировка собирается: добавить ещё / завершить."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("🔍 Добавить ещё", color=VkKeyboardColor.PRIMARY)
    kb.add_button("✅ Завершить тренировку", color=VkKeyboardColor.POSITIVE)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


# ── Питание ───────────────────────────────────────────────────────────────────

def food_search() -> str:
    """Клавиатура при вводе продукта."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def food_confirm() -> str:
    """После добавления продукта: ещё / завершить."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("➕ Добавить ещё", color=VkKeyboardColor.PRIMARY)
    kb.add_button("✅ Завершить питание", color=VkKeyboardColor.POSITIVE)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def meal_type() -> str:
    """Выбор типа приёма пищи."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("🌅 Завтрак", color=VkKeyboardColor.PRIMARY)
    kb.add_button("☀️ Обед", color=VkKeyboardColor.PRIMARY)
    kb.add_line()
    kb.add_button("🌙 Ужин", color=VkKeyboardColor.SECONDARY)
    kb.add_button("🍎 Перекус", color=VkKeyboardColor.SECONDARY)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


# ── Замеры ────────────────────────────────────────────────────────────────────

def measurement_skip() -> str:
    """Клавиатура с кнопкой «Пропустить» для опциональных полей замера."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("⏭ Пропустить", color=VkKeyboardColor.SECONDARY)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


# ── Утилиты ───────────────────────────────────────────────────────────────────

def empty() -> str:
    """
    Пустая клавиатура (скрыть кнопки).

    VkKeyboard(one_time=True).get_keyboard() возвращает {"buttons":[[]],...}
    — пустой ряд внутри массива, что вызывает ошибку VK API [911].
    Правильный формат: {"buttons": [], "one_time": true, "inline": false}.
    """
    return json.dumps({"one_time": True, "inline": False, "buttons": []})
