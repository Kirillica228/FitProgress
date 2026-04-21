import asyncio

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

from bot.config import BOT_TOKEN
from bot.database import init_db
from bot.handlers import setup_routers


async def main() -> None:
    if not BOT_TOKEN:
        raise ValueError(
            "Не задан TELEGRAM_BOT_TOKEN. "
            "Добавьте переменную окружения перед запуском бота."
        )

    init_db()

    dispatcher = Dispatcher(storage=MemoryStorage())
    setup_routers(dispatcher)

    bot = Bot(token=BOT_TOKEN)
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
