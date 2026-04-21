from aiogram import Dispatcher

from bot.handlers.workout import router as workout_router


def setup_routers(dispatcher: Dispatcher) -> None:
    dispatcher.include_router(workout_router)
