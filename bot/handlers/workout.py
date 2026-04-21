from datetime import datetime

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import Message

from bot.data import DIFFICULTY_LEVELS, FINAL_RESULTS, TRAINING_TYPES
from bot.database import get_user_progress, save_workout_session
from bot.keyboards import (
    exercise_keyboard,
    final_result_keyboard,
    main_menu_keyboard,
    options_keyboard,
    start_training_keyboard,
)
from bot.services import (
    build_workout,
    format_exercise,
    format_progress,
    format_workout_preview,
)
from bot.states import WorkoutStates


router = Router()


@router.message(CommandStart())
async def command_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "Добро пожаловать в FitProgress.\nВыберите действие:",
        reply_markup=main_menu_keyboard(),
    )


@router.message(F.text == "В меню")
async def back_to_menu(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        "Главное меню:",
        reply_markup=main_menu_keyboard(),
    )


@router.message(F.text == "Выбрать тренировку")
async def choose_training(message: Message, state: FSMContext) -> None:
    await state.set_state(WorkoutStates.choosing_type)
    await message.answer(
        "Выберите тип тренировки:",
        reply_markup=options_keyboard(TRAINING_TYPES, "Выберите тип"),
    )


@router.message(F.text == "Посмотреть прогресс")
async def show_progress(message: Message) -> None:
    progress_rows = get_user_progress(message.from_user.id)
    await message.answer(
        format_progress(progress_rows),
        reply_markup=main_menu_keyboard(),
    )


@router.message(WorkoutStates.choosing_type, F.text.in_(TRAINING_TYPES))
async def choose_difficulty(message: Message, state: FSMContext) -> None:
    await state.update_data(training_type=message.text)
    await state.set_state(WorkoutStates.choosing_difficulty)
    await message.answer(
        "Выберите уровень сложности:",
        reply_markup=options_keyboard(DIFFICULTY_LEVELS, "Выберите сложность"),
    )


@router.message(WorkoutStates.choosing_difficulty, F.text.in_(DIFFICULTY_LEVELS))
async def preview_workout(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    training_type = data["training_type"]
    difficulty = message.text
    exercises = build_workout(training_type, difficulty)

    await state.update_data(
        difficulty=difficulty,
        exercises=exercises,
        exercise_index=0,
        completed_exercises=0,
        skipped_exercises=0,
    )
    await state.set_state(WorkoutStates.ready_to_start)

    await message.answer(
        format_workout_preview(training_type, difficulty, exercises),
        reply_markup=start_training_keyboard(),
    )


@router.message(WorkoutStates.ready_to_start, F.text == "Начать тренировку")
async def start_workout(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    exercises = data["exercises"]
    await state.set_state(WorkoutStates.in_progress)
    await message.answer(
        format_exercise(exercises[0], 1, len(exercises)),
        reply_markup=exercise_keyboard(),
    )


@router.message(WorkoutStates.in_progress, F.text.in_(["Сделал", "Пропустить"]))
async def process_exercise(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    exercises = data["exercises"]
    current_index = data["exercise_index"]
    completed_exercises = data["completed_exercises"]
    skipped_exercises = data["skipped_exercises"]

    if message.text == "Сделал":
        completed_exercises += 1
    else:
        skipped_exercises += 1

    next_index = current_index + 1
    await state.update_data(
        exercise_index=next_index,
        completed_exercises=completed_exercises,
        skipped_exercises=skipped_exercises,
    )

    if next_index < len(exercises):
        await message.answer(
            format_exercise(exercises[next_index], next_index + 1, len(exercises)),
            reply_markup=exercise_keyboard(),
        )
        return

    await state.set_state(WorkoutStates.waiting_result)
    await message.answer(
        "Тренировка завершена.\nКакой итоговый результат?",
        reply_markup=final_result_keyboard(),
    )


@router.message(WorkoutStates.waiting_result, F.text.in_(FINAL_RESULTS))
async def finish_workout(message: Message, state: FSMContext) -> None:
    data = await state.get_data()
    session_date = datetime.now().strftime("%Y-%m-%d %H:%M")

    save_workout_session(
        user_id=message.from_user.id,
        session_date=session_date,
        training_type=data["training_type"],
        difficulty=data["difficulty"],
        exercises=data["exercises"],
        completion_result=message.text,
        completed_exercises=data["completed_exercises"],
        skipped_exercises=data["skipped_exercises"],
    )

    await state.clear()
    await message.answer(
        "Результат сохранён.\nВы можете выбрать новую тренировку или посмотреть прогресс.",
        reply_markup=main_menu_keyboard(),
    )


@router.message()
async def fallback_handler(message: Message) -> None:
    await message.answer(
        "Используйте кнопки меню, чтобы продолжить.",
        reply_markup=main_menu_keyboard(),
    )
