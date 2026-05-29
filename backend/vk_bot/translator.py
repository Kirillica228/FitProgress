"""
Модуль перевода для VK-бота FitProgress.

Переводит запросы пользователя (русский → английский) перед отправкой в FoodData Central,
и переводит результаты (английский → русский) для отображения пользователю.
"""
import logging

from deep_translator import GoogleTranslator

log = logging.getLogger(__name__)

# Кэш переводов для уменьшения количества запросов к Google Translate
_cache_ru_en: dict[str, str] = {}
_cache_en_ru: dict[str, str] = {}


def translate_to_english(text: str) -> str:
    """
    Переводит текст с русского на английский.
    Если перевод не удался — возвращает оригинальный текст.
    """
    if not text or not text.strip():
        return text

    text_stripped = text.strip().lower()

    # Проверяем кэш
    if text_stripped in _cache_ru_en:
        return _cache_ru_en[text_stripped]

    try:
        translated = GoogleTranslator(source='ru', target='en').translate(text_stripped)
        if translated:
            _cache_ru_en[text_stripped] = translated
            log.debug("Перевод RU→EN: '%s' → '%s'", text_stripped, translated)
            return translated
    except Exception as exc:
        log.warning("Ошибка перевода RU→EN для '%s': %s", text_stripped, exc)

    return text


def translate_to_russian(text: str) -> str:
    """
    Переводит текст с английского на русский.
    Если перевод не удался — возвращает оригинальный текст.
    """
    if not text or not text.strip():
        return text

    text_stripped = text.strip()

    # Проверяем кэш
    if text_stripped in _cache_en_ru:
        return _cache_en_ru[text_stripped]

    try:
        translated = GoogleTranslator(source='en', target='ru').translate(text_stripped)
        if translated:
            _cache_en_ru[text_stripped] = translated
            log.debug("Перевод EN→RU: '%s' → '%s'", text_stripped, translated)
            return translated
    except Exception as exc:
        log.warning("Ошибка перевода EN→RU для '%s': %s", text_stripped, exc)

    return text


def translate_food_descriptions(descriptions: list[str]) -> list[str]:
    """
    Переводит список описаний продуктов с английского на русский.
    Использует batch-подход для эффективности.
    """
    results = []
    for desc in descriptions:
        results.append(translate_to_russian(desc))
    return results
