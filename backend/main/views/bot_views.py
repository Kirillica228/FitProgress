# Этот модуль намеренно оставлен пустым.
#
# Ранее здесь находились HTTP-эндпоинты для VK-бота (BotLinkVkView,
# BotWorkoutSessionView, BotFoodEntryView, BotMeasurementView, BotWorkoutsView).
# Они дублировали логику orm_client.py и были удалены, так как бот работает
# напрямую через Django ORM без HTTP-запросов к бэкенду.
#
# Маршруты /bot/* также удалены из backend/urls.py.
