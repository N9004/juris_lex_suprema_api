# database.py
import os
from dotenv import load_dotenv # Добавляем импорт
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

PROJECT_ROOT = Path(__file__).resolve().parent # Если database.py в корне проекта
DOTENV_PATH = PROJECT_ROOT / ".env"

if DOTENV_PATH.exists():
    print(f"INFO: Loading .env file from (database.py): {DOTENV_PATH}")
    load_dotenv(dotenv_path=DOTENV_PATH)
else:
    print(f"WARNING (database.py): .env file not found at {DOTENV_PATH}.")

APP_MODULE_DIR = Path(__file__).resolve().parent # Это остается как есть

DB_NAME_FROM_ENV = os.getenv("DB_NAME")
DB_NAME = DB_NAME_FROM_ENV if DB_NAME_FROM_ENV else "juris_lex_suprema.db"

# Загружаем переменные окружения из .env файла
load_dotenv() # Эта строка должна быть в начале

APP_MODULE_DIR = Path(__file__).resolve().parent

# Читаем имя БД из .env, если оно там есть, иначе используем значение по умолчанию
DB_NAME_FROM_ENV = os.getenv("DB_NAME")
DB_NAME = DB_NAME_FROM_ENV if DB_NAME_FROM_ENV else "juris_lex_suprema.db"

SQLALCHEMY_DATABASE_URL = f"sqlite:///{APP_MODULE_DIR / DB_NAME}"

print(f"Путь к файлу базы данных: {APP_MODULE_DIR / DB_NAME}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()