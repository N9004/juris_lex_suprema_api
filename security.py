# security.py
import os
from pathlib import Path # Убедись, что этот импорт есть
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

# --- Загрузка переменных окружения ---
# Определяем путь к корневой директории проекта.
# __file__ это путь к текущему файлу (security.py)
# Path(__file__).resolve() -> абсолютный путь к security.py
# .parent -> родительская директория (juris_lex_suprema_api)
# Это гарантирует, что .env будет искаться в корне проекта,
# даже если сам security.py или скрипт, его импортирующий,
# запускается из другого места.
# Важно: это предполагает, что security.py находится непосредственно в корневой папке проекта.
# Если security.py находится в подпапке, например, 'core/', то нужно будет:
# PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROJECT_ROOT = Path(__file__).resolve().parent
DOTENV_PATH = PROJECT_ROOT / ".env"

if DOTENV_PATH.exists():
    print(f"INFO: Loading .env file from: {DOTENV_PATH}")
    load_dotenv(dotenv_path=DOTENV_PATH)
else:
    # Эта ситуация не должна приводить к падению, если переменные окружения
    # установлены системно (например, в Docker-контейнере или на сервере).
    # Но для локальной разработки .env должен существовать.
    print(f"WARNING: .env file not found at {DOTENV_PATH}. "
          "Ensure environment variables are set system-wide or .env file exists.")

# --- Настройки JWT ---
# Теперь читаем из переменных окружения
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256") # Значение по умолчанию, если не найдено
ACCESS_TOKEN_EXPIRE_MINUTES_STR = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

# Валидация ACCESS_TOKEN_EXPIRE_MINUTES
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES_STR)
except ValueError:
    print(f"WARNING: Invalid value for ACCESS_TOKEN_EXPIRE_MINUTES: '{ACCESS_TOKEN_EXPIRE_MINUTES_STR}'. Using default 30.")
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Критическая проверка для SECRET_KEY
if not SECRET_KEY:
    # Эта ошибка должна остановить приложение, если ключ не найден
    # (ни в .env, ни системно)
    error_message = (
        "CRITICAL: SECRET_KEY is not set. "
        "Please set it in your .env file or as an environment variable."
    )
    print(error_message) # Выводим в консоль для логов
    raise ValueError(error_message)


# --- ОТЛАДОЧНЫЙ ВЫВОД (можно закомментировать после успешной настройки) ---
# print("--- DEBUG security.py (after load_dotenv and checks) ---")
# print(f"  SECRET_KEY: {'*' * 5 + SECRET_KEY[-5:] if SECRET_KEY else None}") # Не выводим ключ целиком
# print(f"  ALGORITHM: {ALGORITHM}")
# print(f"  ACCESS_TOKEN_EXPIRE_MINUTES: {ACCESS_TOKEN_EXPIRE_MINUTES}")
# print("--- END DEBUG security.py ---")


# --- Существующий код для хэширования паролей ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# --- Новые функции для JWT ---
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Используем проверенный SECRET_KEY и ALGORITHM
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    try:
        # Используем проверенный SECRET_KEY и ALGORITHM
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject: Optional[str] = payload.get("sub")
        # print(f"DEBUG decode_access_token: payload={payload}, subject={subject}") # Можно убрать после отладки
        if subject is None:
            return None
        return subject
    except JWTError as e: # Добавим вывод ошибки для JWTError
        print(f"DEBUG decode_access_token: JWTError - {str(e)}")
        return None