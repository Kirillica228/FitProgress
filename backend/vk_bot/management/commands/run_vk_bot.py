"""
Django management-команда для запуска VK-бота FitProgress.

Использование:
    python manage.py run_vk_bot

Бот работает напрямую через Django ORM — HTTP-запросы к бэкенду не нужны.
VK_TOKEN берётся из переменной окружения (settings.VK_TOKEN).
"""
import re
import logging

from django.core.management.base import BaseCommand
from django.conf import settings

import vk_api
from vk_api.longpoll import VkLongPoll, VkEventType

from vk_bot import orm_client as api
from vk_bot import keyboards as kb
from vk_bot.states import (
    State,
    get_state, set_state,
    get_data, set_data, clear_data,
)

log = logging.getLogger(__name__)

# ── Маппинги кнопок → внутренние значения ────────────────────────────────────

CATEGORY_MAP = {
    "💪 силовая": "strength",
    "🏃 кардио": "cardio",
    "🏠 домашняя": "home",
}

DIFFICULTY_MAP = {
    "🟢 новичок": "beginner",
    "🟡 средний": "intermediate",
    "🔴 опытный": "advanced",
}

DIFFICULTY_LABEL = {
    "beginner": "Новичок",
    "intermediate": "Средний",
    "advanced": "Опытный",
}

TYPE_LABEL = {
    "strength": "Силовая",
    "cardio": "Кардио",
    "home": "Домашняя",
}


# ── Отправка сообщений ────────────────────────────────────────────────────────

def send(vk, peer_id: int, text: str, keyboard: str | None = None) -> None:
    params = {
        "peer_id": peer_id,
        "message": text,
        "random_id": 0,
    }
    if keyboard is not None:
        params["keyboard"] = keyboard
    vk.messages.send(**params)


# ── Обработчик входящих сообщений ─────────────────────────────────────────────

def handle_message(vk, event) -> None:
    vk_id: int = event.user_id
    text: str = event.text.strip()
    text_lower = text.lower()
    state = get_state(vk_id)

    log.info("vk_id=%s state=%s text=%r", vk_id, state, text)

    # ── /start или «начать» ──────────────────────────────────────────────────
    if text_lower in ("/start", "начать", "start"):
        # Проверяем наличие пользователя с таким vk_id в БД
        if api.get_user_by_vk_id(vk_id):
            set_data(vk_id, "linked", True)
            send(vk, vk_id,
                 "С возвращением! Выбери действие:",
                 kb.main_menu())
            set_state(vk_id, State.IDLE)
        else:
            send(vk, vk_id,
                 "Привет! Для начала нужно войти в аккаунт FitProgress.\n"
                 "Введи свой username:")
            set_state(vk_id, State.WAIT_USERNAME)
        return

    # ── Авторизация ──────────────────────────────────────────────────────────
    if state == State.WAIT_USERNAME:
        set_data(vk_id, "username", text)
        send(vk, vk_id, "Теперь введи пароль:")
        set_state(vk_id, State.WAIT_PASSWORD)
        return

    if state == State.WAIT_PASSWORD:
        username = get_data(vk_id).get("username", "")
        password = text

        send(vk, vk_id, "⏳ Проверяю данные...")

        # Аутентификация через Django ORM (без HTTP)
        result = api.login(username, password)
        if not result:
            send(vk, vk_id,
                 "❌ Неверный username или пароль. Попробуй ещё раз.\n"
                 "Введи username:")
            set_state(vk_id, State.WAIT_USERNAME)
            return

        user = result["user"]

        # Привязываем vk_id к аккаунту
        api.link_vk(user, vk_id)

        set_data(vk_id, "linked", True)
        set_data(vk_id, "username", username)
        send(vk, vk_id,
             f"✅ Добро пожаловать, {username}!\n"
             "Выбери действие:",
             kb.main_menu())
        set_state(vk_id, State.IDLE)
        return

    # ── Проверка авторизации для всех остальных состояний ───────────────────
    # Сначала проверяем in-memory флаг, при промахе — смотрим в БД
    if not get_data(vk_id).get("linked"):
        if api.get_user_by_vk_id(vk_id):
            set_data(vk_id, "linked", True)
        else:
            send(vk, vk_id, "Сначала нужно войти. Напиши /start")
            return

    # ── Главное меню ─────────────────────────────────────────────────────────
    if text_lower in ("◀️ главное меню", "главное меню", "меню"):
        send(vk, vk_id, "Главное меню:", kb.main_menu())
        set_state(vk_id, State.IDLE)
        return

    if state == State.IDLE:
        if text_lower == "🏋️ тренировки":
            send(vk, vk_id, "Выбери категорию тренировки:", kb.workout_category())
            set_state(vk_id, State.WORKOUT_CATEGORY)
            return

        if text_lower == "🥗 питание":
            send(vk, vk_id,
                 "Напиши что съел и сколько граммов.\n"
                 "Например: гречка 200г  или  куриная грудка 150",
                 kb.empty())
            set_state(vk_id, State.FOOD_INPUT)
            return

        if text_lower == "📏 замеры":
            send(vk, vk_id,
                 "Введи свой текущий вес в кг (например: 78.5):",
                 kb.empty())
            set_state(vk_id, State.MEASUREMENT_WEIGHT)
            return

        send(vk, vk_id, "Выбери действие:", kb.main_menu())
        return

    # ── Ветка тренировок ─────────────────────────────────────────────────────
    if state == State.WORKOUT_CATEGORY:
        if text_lower == "◀️ назад":
            send(vk, vk_id, "Главное меню:", kb.main_menu())
            set_state(vk_id, State.IDLE)
            return

        category = CATEGORY_MAP.get(text_lower)
        if not category:
            send(vk, vk_id, "Выбери категорию из кнопок ниже:", kb.workout_category())
            return

        set_data(vk_id, "workout_category", category)
        send(vk, vk_id, "Выбери уровень сложности:", kb.workout_difficulty())
        set_state(vk_id, State.WORKOUT_DIFFICULTY)
        return

    if state == State.WORKOUT_DIFFICULTY:
        if text_lower == "◀️ назад":
            send(vk, vk_id, "Выбери категорию тренировки:", kb.workout_category())
            set_state(vk_id, State.WORKOUT_CATEGORY)
            return

        difficulty = DIFFICULTY_MAP.get(text_lower)
        if not difficulty:
            send(vk, vk_id, "Выбери сложность из кнопок ниже:", kb.workout_difficulty())
            return

        category = get_data(vk_id).get("workout_category", "strength")
        send(vk, vk_id, "⏳ Загружаю тренировку...")

        # Запрос через ORM (без HTTP)
        workouts = api.get_workouts(category, difficulty)
        if not workouts:
            send(vk, vk_id,
                 f"😔 Тренировок для категории «{TYPE_LABEL.get(category, category)}» "
                 f"/ сложности «{DIFFICULTY_LABEL.get(difficulty, difficulty)}» пока нет.\n"
                 "Попробуй другую комбинацию:",
                 kb.workout_difficulty())
            return

        # Берём первую подходящую тренировку
        workout = workouts[0]
        set_data(vk_id, "workout_id", workout["id"])

        lines = [
            f"🏋️ *{workout['name']}*",
            f"Категория: {TYPE_LABEL.get(workout['type'], workout['type'])}  |  "
            f"Сложность: {DIFFICULTY_LABEL.get(workout['difficulty'], workout['difficulty'])}",
            "",
            "📋 Упражнения:",
        ]

        exercises = workout.get("exercises", [])
        if exercises:
            for i, we in enumerate(exercises, start=1):
                ex = we.get("exercise", {})
                name = ex.get("name", "—")
                sets = we.get("sets", "?")
                reps = we.get("reps", "?")
                lines.append(f"{i}. {name} — {sets} подх. × {reps} повт.")
        else:
            lines.append("(упражнения не заданы)")

        lines += ["", "Когда закончишь — нажми «Завершить тренировку»."]

        send(vk, vk_id, "\n".join(lines), kb.workout_active())
        set_state(vk_id, State.WORKOUT_ACTIVE)
        return

    if state == State.WORKOUT_ACTIVE:
        if text_lower == "✅ завершить тренировку":
            workout_id: int = get_data(vk_id).get("workout_id", 0)
            ok = api.save_workout_session(vk_id, workout_id)
            if ok:
                send(vk, vk_id,
                     "🎉 Тренировка записана! Отличная работа!",
                     kb.main_menu())
            else:
                send(vk, vk_id,
                     "⚠️ Не удалось сохранить тренировку. Попробуй позже.",
                     kb.main_menu())
            set_state(vk_id, State.IDLE)
            return

        if text_lower == "◀️ главное меню":
            send(vk, vk_id, "Главное меню:", kb.main_menu())
            set_state(vk_id, State.IDLE)
            return

        send(vk, vk_id,
             "Нажми «Завершить тренировку» когда будешь готов.",
             kb.workout_active())
        return

    # ── Ветка питания ────────────────────────────────────────────────────────
    if state == State.FOOD_INPUT:
        # Парсим «продукт Xг» или «продукт X»
        match = re.match(
            r"^(.+?)\s+(\d+(?:[.,]\d+)?)\s*г?$",
            text.strip(),
            re.IGNORECASE,
        )
        if not match:
            send(vk, vk_id,
                 "Не понял формат. Напиши так:\n"
                 "гречка 200г  или  куриная грудка 150")
            return

        food_name = match.group(1).strip()
        grams = float(match.group(2).replace(",", "."))

        send(vk, vk_id, f"⏳ Ищу «{food_name}» в базе продуктов...")

        # Сохранение через ORM (без HTTP)
        result = api.save_food_entry(vk_id, food_name, grams)
        if result is None:
            send(vk, vk_id,
                 "⚠️ Не удалось сохранить запись. Попробуй позже.",
                 kb.main_menu())
            set_state(vk_id, State.IDLE)
            return

        found = result.get("found_in_off", False)
        name = result.get("food_name", food_name)
        cal = result.get("calories", 0)
        prot = result.get("protein", 0)
        fat = result.get("fats", 0)
        carb = result.get("carbs", 0)

        if found:
            msg = (
                f"✅ Записано: {name} — {grams:.0f}г\n"
                f"🔥 Калории: {cal:.0f} ккал\n"
                f"🥩 Белки: {prot:.1f}г  |  🧈 Жиры: {fat:.1f}г  |  🍞 Углеводы: {carb:.1f}г"
            )
        else:
            msg = (
                f"⚠️ Продукт «{food_name}» не найден в базе Open Food Facts.\n"
                "Запись сохранена с нулевыми значениями КБЖУ.\n"
                "Попробуй написать название по-английски."
            )

        send(vk, vk_id, msg, kb.main_menu())
        set_state(vk_id, State.IDLE)
        return

    # ── Ветка замеров тела ───────────────────────────────────────────────────
    if state == State.MEASUREMENT_WEIGHT:
        # Принимаем «78», «78.5», «78,5»
        match = re.match(r"^(\d+(?:[.,]\d+)?)$", text.strip())
        if not match:
            send(vk, vk_id, "Введи число, например: 78.5")
            return

        weight = float(match.group(1).replace(",", "."))
        set_data(vk_id, "m_weight", weight)

        send(vk, vk_id,
             "Введи обхват груди в см (например: 95)\n"
             "Или нажми «Пропустить»:",
             kb.measurement_skip())
        set_state(vk_id, State.MEASUREMENT_CHEST)
        return

    if state == State.MEASUREMENT_CHEST:
        if text_lower in ("⏭ пропустить", "пропустить"):
            set_data(vk_id, "m_chest", None)
        else:
            match = re.match(r"^(\d+(?:[.,]\d+)?)$", text.strip())
            if not match:
                send(vk, vk_id,
                     "Введи число в см или нажми «Пропустить»:",
                     kb.measurement_skip())
                return
            set_data(vk_id, "m_chest", float(match.group(1).replace(",", ".")))

        send(vk, vk_id,
             "Введи обхват талии в см (например: 75)\n"
             "Или нажми «Пропустить»:",
             kb.measurement_skip())
        set_state(vk_id, State.MEASUREMENT_WAIST)
        return

    if state == State.MEASUREMENT_WAIST:
        if text_lower in ("⏭ пропустить", "пропустить"):
            set_data(vk_id, "m_waist", None)
        else:
            match = re.match(r"^(\d+(?:[.,]\d+)?)$", text.strip())
            if not match:
                send(vk, vk_id,
                     "Введи число в см или нажми «Пропустить»:",
                     kb.measurement_skip())
                return
            set_data(vk_id, "m_waist", float(match.group(1).replace(",", ".")))

        send(vk, vk_id,
             "Введи обхват бёдер в см (например: 100)\n"
             "Или нажми «Пропустить»:",
             kb.measurement_skip())
        set_state(vk_id, State.MEASUREMENT_HIPS)
        return

    if state == State.MEASUREMENT_HIPS:
        if text_lower in ("⏭ пропустить", "пропустить"):
            set_data(vk_id, "m_hips", None)
        else:
            match = re.match(r"^(\d+(?:[.,]\d+)?)$", text.strip())
            if not match:
                send(vk, vk_id,
                     "Введи число в см или нажми «Пропустить»:",
                     kb.measurement_skip())
                return
            set_data(vk_id, "m_hips", float(match.group(1).replace(",", ".")))

        # Собираем все данные и сохраняем
        d = get_data(vk_id)
        weight = d.get("m_weight", 0.0)
        chest  = d.get("m_chest")
        waist  = d.get("m_waist")
        hips   = d.get("m_hips")

        ok = api.save_measurement(vk_id, weight, chest=chest, waist=waist, hips=hips)

        if ok:
            lines = [f"✅ Замеры записаны!", f"⚖️ Вес: {weight} кг"]
            if chest is not None:
                lines.append(f"👕 Грудь: {chest} см")
            if waist is not None:
                lines.append(f"📐 Талия: {waist} см")
            if hips is not None:
                lines.append(f"🩳 Бёдра: {hips} см")
            send(vk, vk_id, "\n".join(lines), kb.main_menu())
        else:
            send(vk, vk_id,
                 "⚠️ Не удалось сохранить замеры. Попробуй позже.",
                 kb.main_menu())

        set_state(vk_id, State.IDLE)
        return

    # ── Fallback ─────────────────────────────────────────────────────────────
    send(vk, vk_id, "Выбери действие:", kb.main_menu())
    set_state(vk_id, State.IDLE)


# ── Management-команда ────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Запускает VK Long Poll бота FitProgress."

    def handle(self, *args, **options):
        vk_token = getattr(settings, "VK_TOKEN", None)
        if not vk_token:
            self.stderr.write(
                self.style.ERROR(
                    "VK_TOKEN не задан. Добавь его в .env или settings.py."
                )
            )
            return

        vk_session = vk_api.VkApi(token=vk_token)
        vk = vk_session.get_api()
        longpoll = VkLongPoll(vk_session)

        self.stdout.write(self.style.SUCCESS("VK-бот запущен. Ожидаю сообщения..."))
        log.info("VK-бот запущен.")

        for event in longpoll.listen():
            if event.type == VkEventType.MESSAGE_NEW and event.to_me:
                try:
                    handle_message(vk, event)
                except Exception as exc:
                    log.exception(
                        "Ошибка при обработке сообщения от vk_id=%s: %s",
                        event.user_id,
                        exc,
                    )
