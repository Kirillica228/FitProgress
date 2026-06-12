"""
Django management-команда для запуска VK-бота FitProgress.

Использование:
    python manage.py run_vk_bot

Бот работает напрямую через Django ORM + FoodData Central API (USDA).
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

MEAL_TYPE_MAP = {
    "🌅 завтрак": "breakfast",
    "☀️ обед": "lunch",
    "🌙 ужин": "dinner",
    "🍎 перекус": "snack",
}

MEAL_TYPE_LABEL = {
    "breakfast": "Завтрак",
    "lunch": "Обед",
    "dinner": "Ужин",
    "snack": "Перекус",
}

log = logging.getLogger(__name__)


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
            set_data(vk_id, "workout_exercises", [])
            send(vk, vk_id,
                 "🏋️ Введи название упражнения для поиска:",
                 kb.workout_search())
            set_state(vk_id, State.WORKOUT_SEARCH)
            return

        if text_lower == "🥗 питание":
            set_data(vk_id, "food_items", [])
            send(vk, vk_id,
                 "🥗 Введи название продукта и количество грамм.\n"
                 "Например: курица 200",
                 kb.food_search())
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

    # ── Ветка тренировок (поиск и сборка) ─────────────────────────────────────
    if state == State.WORKOUT_SEARCH:
        query = text.strip()
        if not query:
            send(vk, vk_id, "Введи название упражнения:", kb.workout_search())
            return

        results = api.search_exercises(query)
        if not results:
            send(vk, vk_id,
                 f"😔 По запросу «{query}» ничего не найдено.\n"
                 "Попробуй другое название:",
                 kb.workout_search())
            return

        # Сохраняем результаты поиска
        set_data(vk_id, "search_results", results)

        lines = ["🔍 Найдено:"]
        for i, ex in enumerate(results, start=1):
            lines.append(f"{i}. {ex['name']} /ex_{ex['id']}")
        lines.append("\nОтправь команду /ex_ID чтобы посмотреть упражнение.")

        send(vk, vk_id, "\n".join(lines), kb.workout_search())
        set_state(vk_id, State.WORKOUT_SELECT)
        return

    if state == State.WORKOUT_SELECT:
        # Ожидаем /ex_ID
        match = re.match(r"^/ex_(\d+)$", text.strip())
        if not match:
            send(vk, vk_id,
                 "Отправь команду в формате /ex_ID (например /ex_15)\n"
                 "Или введи новое название для поиска:",
                 kb.workout_search())
            # Если ввели текст без /ex_ — считаем новым поиском
            if text.strip() and not text.startswith("/"):
                set_state(vk_id, State.WORKOUT_SEARCH)
                # Рекурсивно обработаем как поиск
                results = api.search_exercises(text.strip())
                if results:
                    set_data(vk_id, "search_results", results)
                    lines = ["🔍 Найдено:"]
                    for i, ex in enumerate(results, start=1):
                        lines.append(f"{i}. {ex['name']} /ex_{ex['id']}")
                    lines.append("\nОтправь /ex_ID чтобы посмотреть упражнение.")
                    send(vk, vk_id, "\n".join(lines), kb.workout_search())
                    set_state(vk_id, State.WORKOUT_SELECT)
                else:
                    send(vk, vk_id,
                         f"😔 По запросу «{text.strip()}» ничего не найдено.\n"
                         "Попробуй другое название:",
                         kb.workout_search())
                    set_state(vk_id, State.WORKOUT_SEARCH)
            return

        exercise_id = int(match.group(1))
        exercise = api.get_exercise_by_id(exercise_id)
        if not exercise:
            send(vk, vk_id, "❌ Упражнение не найдено. Попробуй другой ID.")
            return

        set_data(vk_id, "current_exercise", exercise)

        lines = [
            f"📋 {exercise['name']}",
            f"🏗 Оборудование: {exercise['equipment']}",
            f"💪 Группы мышц: {exercise['muscle_groups']}",
        ]
        send(vk, vk_id, "\n".join(lines), kb.workout_exercise_view())
        set_state(vk_id, State.WORKOUT_VIEW)
        return

    if state == State.WORKOUT_VIEW:
        if text_lower == "➕ добавить в тренировку":
            send(vk, vk_id,
                 "Введи вес (кг). Если без веса — напиши 0:",
                 kb.back_to_menu())
            set_state(vk_id, State.WORKOUT_WEIGHT)
            return

        if text_lower == "🔍 искать ещё":
            send(vk, vk_id,
                 "Введи название упражнения для поиска:",
                 kb.workout_search())
            set_state(vk_id, State.WORKOUT_SEARCH)
            return

        send(vk, vk_id, "Выбери действие:", kb.workout_exercise_view())
        return

    if state == State.WORKOUT_WEIGHT:
        match = re.match(r"^(\d+(?:[.,]\d+)?)$", text.strip())
        if not match:
            send(vk, vk_id, "Введи число (вес в кг), например: 80 или 0:")
            return

        weight = float(match.group(1).replace(",", "."))
        set_data(vk_id, "ex_weight", weight)
        send(vk, vk_id,
             "Сколько подходов? (например: 4):",
             kb.back_to_menu())
        set_state(vk_id, State.WORKOUT_SETS)
        return

    if state == State.WORKOUT_SETS:
        match = re.match(r"^(\d+)$", text.strip())
        if not match:
            send(vk, vk_id, "Введи целое число подходов, например: 4")
            return

        sets = int(match.group(1))
        set_data(vk_id, "ex_sets", sets)
        send(vk, vk_id,
             "Продолжительность в секундах (если не нужно — напиши 0):",
             kb.back_to_menu())
        set_state(vk_id, State.WORKOUT_DURATION)
        return

    if state == State.WORKOUT_DURATION:
        match = re.match(r"^(\d+)$", text.strip())
        if not match:
            send(vk, vk_id, "Введи число секунд, например: 60 или 0")
            return

        duration = int(match.group(1))
        d = get_data(vk_id)
        exercise = d.get("current_exercise", {})
        exercises_list = d.get("workout_exercises", [])

        exercises_list.append({
            "exercise_id": exercise.get("id"),
            "name": exercise.get("name", "—"),
            "weight": d.get("ex_weight", 0),
            "sets": d.get("ex_sets", 1),
            "duration": duration,
        })
        set_data(vk_id, "workout_exercises", exercises_list)

        # Показываем текущий состав тренировки
        lines = ["🏋️ Твоя тренировка:"]
        for i, ex in enumerate(exercises_list, start=1):
            w = f"{ex['weight']}кг" if ex['weight'] > 0 else "без веса"
            dur = f", {ex['duration']}сек" if ex['duration'] > 0 else ""
            lines.append(f"{i}. {ex['name']} — {ex['sets']} подх., {w}{dur}")

        lines.append("\nДобавить ещё или завершить?")
        send(vk, vk_id, "\n".join(lines), kb.workout_building())
        set_state(vk_id, State.WORKOUT_BUILDING)
        return

    if state == State.WORKOUT_BUILDING:
        if text_lower == "🔍 добавить ещё":
            send(vk, vk_id,
                 "Введи название упражнения для поиска:",
                 kb.workout_search())
            set_state(vk_id, State.WORKOUT_SEARCH)
            return

        if text_lower == "✅ завершить тренировку":
            exercises_list = get_data(vk_id).get("workout_exercises", [])
            ok = api.save_custom_workout(vk_id, exercises_list)
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

        send(vk, vk_id, "Выбери действие:", kb.workout_building())
        return

    # ── Ветка питания (FoodData Central) ──────────────────────────────────────
    if state == State.FOOD_INPUT:
        # Парсим: "курица 200" → product="курица", grams=200
        # Если грамм нет — по умолчанию 100
        input_text = text.strip()
        if not input_text:
            send(vk, vk_id,
                 "Введи название продукта и граммы (например: курица 200):",
                 kb.food_search())
            return

        # Пытаемся выделить число в конце
        match = re.match(r"^(.+?)\s+(\d+(?:[.,]\d+)?)\s*$", input_text)
        if match:
            product_name = match.group(1).strip()
            grams = float(match.group(2).replace(",", "."))
        else:
            product_name = input_text
            grams = 100.0

        set_data(vk_id, "food_query", product_name)
        set_data(vk_id, "food_grams", grams)

        send(vk, vk_id, "⏳ Ищу продукт...")

        results = api.search_food_fdc(product_name)
        if not results:
            send(vk, vk_id,
                 f"😔 По запросу «{product_name}» ничего не найдено.\n"
                 "Попробуй другое название:",
                 kb.food_search())
            return

        set_data(vk_id, "food_search_results", results)

        lines = ["🔍 Найдено:"]
        for i, food in enumerate(results, start=1):
            lines.append(f"{i}. {food['description']} /fd_{food['fdc_id']}")
        lines.append(f"\n(расчёт на {grams:.0f}г)")
        lines.append("Отправь /fd_ID чтобы выбрать продукт.")

        send(vk, vk_id, "\n".join(lines), kb.food_search())
        set_state(vk_id, State.FOOD_SELECT)
        return

    if state == State.FOOD_SELECT:
        # Ожидаем /fd_ID
        match = re.match(r"^/fd_(\d+)$", text.strip())
        if not match:
            # Если ввели текст без /fd_ — считаем новым поиском
            if text.strip() and not text.startswith("/"):
                set_state(vk_id, State.FOOD_INPUT)
                # Повторно обработаем как ввод
                input_text = text.strip()
                m = re.match(r"^(.+?)\s+(\d+(?:[.,]\d+)?)\s*$", input_text)
                if m:
                    product_name = m.group(1).strip()
                    grams = float(m.group(2).replace(",", "."))
                else:
                    product_name = input_text
                    grams = get_data(vk_id).get("food_grams", 100.0)

                set_data(vk_id, "food_query", product_name)
                set_data(vk_id, "food_grams", grams)

                results = api.search_food_fdc(product_name)
                if not results:
                    send(vk, vk_id,
                         f"😔 По запросу «{product_name}» ничего не найдено.\n"
                         "Попробуй другое название:",
                         kb.food_search())
                    set_state(vk_id, State.FOOD_INPUT)
                    return

                set_data(vk_id, "food_search_results", results)
                lines = ["🔍 Найдено:"]
                for i, food in enumerate(results, start=1):
                    lines.append(f"{i}. {food['description']} /fd_{food['fdc_id']}")
                lines.append(f"\n(расчёт на {grams:.0f}г)")
                lines.append("Отправь /fd_ID чтобы выбрать продукт.")
                send(vk, vk_id, "\n".join(lines), kb.food_search())
                set_state(vk_id, State.FOOD_SELECT)
            else:
                send(vk, vk_id,
                     "Отправь /fd_ID (например /fd_171077) или введи новый продукт:",
                     kb.food_search())
            return

        fdc_id = int(match.group(1))
        # Ищем в сохранённых результатах
        results = get_data(vk_id).get("food_search_results", [])
        food_data = None
        for item in results:
            if item.get("fdc_id") == fdc_id:
                food_data = item
                break

        if not food_data:
            send(vk, vk_id, "❌ Продукт не найден в результатах. Попробуй ещё раз.")
            return

        grams = get_data(vk_id).get("food_grams", 100.0)
        nutrients = api.calculate_nutrients(food_data, grams)

        # Сохраняем выбранный продукт
        food_item = {
            "food_name": food_data["description"],
            "fdc_id": fdc_id,
            "grams": grams,
            "calories": nutrients["calories"],
            "protein": nutrients["protein"],
            "fats": nutrients["fats"],
            "carbs": nutrients["carbs"],
        }

        food_items = get_data(vk_id).get("food_items", [])
        food_items.append(food_item)
        set_data(vk_id, "food_items", food_items)

        lines = [
            f"✅ {food_data['description']} ({grams:.0f}г)",
            f"🔥 {nutrients['calories']} ккал | Б: {nutrients['protein']}г | "
            f"Ж: {nutrients['fats']}г | У: {nutrients['carbs']}г",
            "",
            f"📋 В приёме пищи: {len(food_items)} продукт(ов)",
            "\nДобавить ещё или завершить?",
        ]
        send(vk, vk_id, "\n".join(lines), kb.food_confirm())
        set_state(vk_id, State.FOOD_CONFIRM)
        return

    if state == State.FOOD_CONFIRM:
        if text_lower == "➕ добавить ещё":
            send(vk, vk_id,
                 "Введи название продукта и граммы (например: рис 150):",
                 kb.food_search())
            set_state(vk_id, State.FOOD_INPUT)
            return

        if text_lower == "✅ завершить питание":
            send(vk, vk_id,
                 "Выбери тип приёма пищи:",
                 kb.meal_type())
            set_state(vk_id, State.FOOD_MEAL_TYPE)
            return

        send(vk, vk_id, "Выбери действие:", kb.food_confirm())
        return

    if state == State.FOOD_MEAL_TYPE:
        meal = MEAL_TYPE_MAP.get(text_lower)
        if not meal:
            send(vk, vk_id,
                 "Выбери тип из кнопок ниже:",
                 kb.meal_type())
            return

        food_items = get_data(vk_id).get("food_items", [])
        ok = api.save_food_entries(vk_id, food_items, meal)

        if not ok:
            send(vk, vk_id,
                 "⚠️ Не удалось сохранить запись. Попробуй позже.",
                 kb.main_menu())
        else:
            total_cal = sum(item["calories"] for item in food_items)
            total_p = sum(item["protein"] for item in food_items)
            total_f = sum(item["fats"] for item in food_items)
            total_c = sum(item["carbs"] for item in food_items)

            lines = [
                f"✅ {MEAL_TYPE_LABEL.get(meal, meal)} записан!",
                f"📋 Продуктов: {len(food_items)}",
                f"🔥 Итого: {total_cal:.0f} ккал",
                f"   Б: {total_p:.1f}г | Ж: {total_f:.1f}г | У: {total_c:.1f}г",
            ]
            send(vk, vk_id, "\n".join(lines), kb.main_menu())

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
