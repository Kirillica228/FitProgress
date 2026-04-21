from aiogram.types import KeyboardButton, ReplyKeyboardMarkup

from bot.data import FINAL_RESULTS, MAIN_MENU_CHOICES


def build_keyboard(buttons: list[str], placeholder: str) -> ReplyKeyboardMarkup:
    rows = [[KeyboardButton(text=button)] for button in buttons]
    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder=placeholder,
    )


def main_menu_keyboard() -> ReplyKeyboardMarkup:
    return build_keyboard(MAIN_MENU_CHOICES, "Выберите действие")


def options_keyboard(
    options: list[str],
    placeholder: str,
    with_menu_button: bool = True,
) -> ReplyKeyboardMarkup:
    rows = [[KeyboardButton(text=option)] for option in options]
    if with_menu_button:
        rows.append([KeyboardButton(text="В меню")])
    return ReplyKeyboardMarkup(
        keyboard=rows,
        resize_keyboard=True,
        input_field_placeholder=placeholder,
    )


def start_training_keyboard() -> ReplyKeyboardMarkup:
    return build_keyboard(["Начать тренировку", "В меню"], "Начните тренировку")


def exercise_keyboard() -> ReplyKeyboardMarkup:
    return build_keyboard(["Сделал", "Пропустить"], "Отметьте результат упражнения")


def final_result_keyboard() -> ReplyKeyboardMarkup:
    return options_keyboard(FINAL_RESULTS, "Как прошла тренировка?")
