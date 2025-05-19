from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

# --- Настройки JWT ---
SECRET_KEY = "ВАШ_СЕКРЕТНЫЙ_КЛЮЧ_ЗДЕСЬ" # Убедитесь, что здесь ваш ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # <--- ВОТ ЭТА ПЕРЕМЕННАЯ

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
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES) # <--- И здесь она используется
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject: Optional[str] = payload.get("sub") # "sub" - это стандартное поле для идентификатора
        print(f"DEBUG decode_access_token: payload={payload}, subject={subject}") # Отладка
        if subject is None:
            return None
        return subject
    except JWTError:
        print(f"DEBUG decode_access_token: JWTError") # Отладка
        return None