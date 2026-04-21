from aiogram.fsm.state import State, StatesGroup


class WorkoutStates(StatesGroup):
    choosing_type = State()
    choosing_difficulty = State()
    ready_to_start = State()
    in_progress = State()
    waiting_result = State()
