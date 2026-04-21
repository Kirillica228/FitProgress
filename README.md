# FitProgress

## Frontend

SPA dashboard lives in `frontend/` and uses:

- Next.js App Router
- TypeScript
- Zustand
- TanStack Query
- Tailwind CSS

Run it with:

```powershell
cd frontend
npm install
npm run dev
```

## Telegram bot

Телеграм-бот вынесен в отдельную систему в папку `bot/`.

Библиотека уже установлена в `.venv`: `aiogram==3.27.0`.

Для запуска бота укажите токен и выполните:

```powershell
$env:TELEGRAM_BOT_TOKEN="your_bot_token"
.\.venv\Scripts\python.exe .\bot\main.py
```

### MVP flow

1. `/start`
2. `Выбрать тренировку` или `Посмотреть прогресс`
3. Выбор типа тренировки
4. Выбор сложности
5. Генерация списка упражнений
6. `Начать тренировку`
7. Проход по упражнениям кнопками `Сделал` / `Пропустить`
8. Сохранение итогового результата в SQLite

### Structure

- `bot/main.py` — запуск бота
- `bot/handlers/workout.py` — сценарий бота
- `bot/states.py` — FSM состояния
- `bot/data.py` — статические данные тренировок
- `bot/services.py` — генерация и форматирование тренировок
- `bot/database.py` — SQLite-хранилище прогресса
