import json
import sqlite3
from datetime import datetime

from bot.config import DB_PATH


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_date TEXT NOT NULL,
                training_type TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                exercises_json TEXT NOT NULL,
                completion_result TEXT NOT NULL,
                completed_exercises INTEGER NOT NULL,
                skipped_exercises INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


def save_workout_session(
    *,
    user_id: int,
    session_date: str,
    training_type: str,
    difficulty: str,
    exercises: list[dict[str, str]],
    completion_result: str,
    completed_exercises: int,
    skipped_exercises: int,
) -> None:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO workout_sessions (
                user_id,
                session_date,
                training_type,
                difficulty,
                exercises_json,
                completion_result,
                completed_exercises,
                skipped_exercises,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                session_date,
                training_type,
                difficulty,
                json.dumps(exercises, ensure_ascii=False),
                completion_result,
                completed_exercises,
                skipped_exercises,
                datetime.now().isoformat(timespec="seconds"),
            ),
        )


def get_user_progress(user_id: int, limit: int = 5) -> list[sqlite3.Row]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                session_date,
                training_type,
                difficulty,
                completion_result,
                completed_exercises,
                skipped_exercises
            FROM workout_sessions
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT ?
            """,
            (user_id, limit),
        ).fetchall()
    return rows
