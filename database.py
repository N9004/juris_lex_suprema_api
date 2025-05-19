import os # os можно убрать, если не используется напрямую
from pathlib import Path # Убедитесь, что этот импорт есть
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Определяем путь к корневой директории проекта
# __file__ это путь к текущему файлу (database.py)
# Path(__file__).resolve() -> абсолютный путь к database.py
# .parent -> родительская директория (juris_lex_suprema_api)
# Это гарантирует, что путь будет правильным, независимо от того, откуда запускается приложение
APP_MODULE_DIR = Path(__file__).resolve().parent
DB_NAME = "juris_lex_suprema.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{APP_MODULE_DIR / DB_NAME}"

# Выведем для проверки, куда будет сохраняться БД (можно закомментировать после проверки)
print(f"Путь к файлу базы данных: {APP_MODULE_DIR / DB_NAME}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} # Необходимо для SQLite с FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()