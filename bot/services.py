from bot.data import TRAINING_LIBRARY


def build_workout(training_type: str, difficulty: str) -> list[dict[str, str]]:
    return [exercise.copy() for exercise in TRAINING_LIBRARY[training_type][difficulty]]


def format_workout_preview(
    training_type: str,
    difficulty: str,
    exercises: list[dict[str, str]],
) -> str:
    lines = [
        "Тренировка готова.",
        f"Тип: {training_type}",
        f"Сложность: {difficulty}",
        "",
        "Упражнения:",
    ]
    lines.extend(
        f"{index}. {exercise['name']} — {exercise['value']}"
        for index, exercise in enumerate(exercises, start=1)
    )
    return "\n".join(lines)


def format_exercise(exercise: dict[str, str], index: int, total: int) -> str:
    return (
        f"Упражнение {index}/{total}\n"
        f"{exercise['name']}\n"
        f"Нагрузка: {exercise['value']}"
    )


def format_progress(rows: list[dict]) -> str:
    if not rows:
        return (
            "Прогресс пока пуст.\n"
            "Начните первую тренировку, и я сохраню результат."
        )

    lines = ["Ваш последний прогресс:"]
    for row in rows:
        lines.append(
            f"{row['session_date']} | {row['training_type']} | "
            f"{row['difficulty']} | {row['completion_result']} | "
            f"сделано: {row['completed_exercises']} | пропущено: {row['skipped_exercises']}"
        )
    return "\n".join(lines)
