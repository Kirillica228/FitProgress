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


def measurement_skip() -> str:
    """Клавиатура с кнопкой «Пропустить» для опциональных полей замера."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("⏭ Пропустить", color=VkKeyboardColor.SECONDARY)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def workout_category() -> str:
    """Выбор категории тренировки."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("💪 Силовая", color=VkKeyboardColor.PRIMARY)
    kb.add_button("🏃 Кардио", color=VkKeyboardColor.PRIMARY)
    kb.add_line()
    kb.add_button("🏠 Домашняя", color=VkKeyboardColor.SECONDARY)
    kb.add_line()
    kb.add_button("◀️ Назад", color=VkKeyboardColor.NEGATIVE)
    return kb.get_keyboard()


def workout_difficulty() -> str:
    """Выбор сложности тренировки."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("🟢 Новичок", color=VkKeyboardColor.POSITIVE)
    kb.add_button("🟡 Средний", color=VkKeyboardColor.PRIMARY)
    kb.add_line()
    kb.add_button("🔴 Опытный", color=VkKeyboardColor.NEGATIVE)
    kb.add_line()
    kb.add_button("◀️ Назад", color=VkKeyboardColor.SECONDARY)
    return kb.get_keyboard()


def workout_active() -> str:
    """Кнопка завершения тренировки."""
    kb = VkKeyboard(one_time=True)
    kb.add_button("✅ Завершить тренировку", color=VkKeyboardColor.POSITIVE)
    kb.add_line()
    kb.add_button("◀️ Главное меню", color=VkKeyboardColor.SECONDARY)
    return kb.get_keyboard()


def empty() -> str:
    """
    Пустая клавиатура (скрыть кнопки).

    VkKeyboard(one_time=True).get_keyboard() возвращает {"buttons":[[]],...}
    — пустой ряд внутри массива, что вызывает ошибку VK API [911].
    Правильный формат: {"buttons": [], "one_time": true, "inline": false}.
    """
    return json.dumps({"one_time": True, "inline": False, "buttons": []})
