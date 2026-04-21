import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "7678444142:AAHqhLRucJns5HpBpd-e1zQSQY0bX9DOVgA")
DB_PATH = BASE_DIR / "bot" / "fit_progress.db"
