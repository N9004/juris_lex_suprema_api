import sys
import os
from pathlib import Path

# Добавляем корневую директорию проекта в PYTHONPATH
project_root = Path(__file__).resolve().parent
sys.path.append(str(project_root))

import argparse
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User, Base
from schemas import UserCreate
from crud import get_user_by_email
from security import get_password_hash

# Убедимся, что таблицы созданы, если скрипт запускается для пустой БД
Base.metadata.create_all(bind=engine)

def set_superuser_status(db: Session, email: str, password: str = None, make_superuser: bool = True):
    """
    Создает нового пользователя (если не существует) или обновляет существующего,
    устанавливая ему статус суперпользователя.
    Если пароль предоставлен для существующего пользователя, он будет обновлен.
    """
    user = get_user_by_email(db, email=email)
    
    if user:
        print(f"Пользователь {email} уже существует. Обновление статуса is_superuser...")
        user.is_superuser = make_superuser
        if password:
            user.hashed_password = get_password_hash(password)
            print(f"Пароль для пользователя {email} обновлен.")
        # Если пользователь существует, предполагаем, что email уже верифицирован или это неважно для админа.
        # Или можно добавить user.is_email_verified = True
        user.is_email_verified = True # Админам верификация не нужна для входа, но пусть будет True
        print(f"Статус is_email_verified для {email} установлен в True.")

    else:
        if not password:
            print(f"Ошибка: для создания нового суперпользователя {email} необходимо указать пароль.")
            return
        print(f"Создание нового суперпользователя {email}...")
        # Мы не можем напрямую вызвать crud.create_user с флагом make_superuser,
        # если мы его оттуда убрали. Поэтому создадим пользователя вручную здесь.
        
        hashed_password = get_password_hash(password)
        user_in = UserCreate(email=email, password=password, full_name="Admin User") # full_name можно сделать параметром
        
        # Создаем объект модели напрямую
        db_user = User(
            email=user_in.email,
            hashed_password=hashed_password,
            full_name=user_in.full_name,
            is_active=True,
            is_superuser=make_superuser,
            is_email_verified=True # Суперюзеру сразу верифицируем email
        )
        db.add(db_user)
        user = db_user # присваиваем для вывода информации
        print(f"Новый суперпользователь {email} создан.")

    try:
        db.commit()
        db.refresh(user)
        print(f"Пользователь {user.email} успешно сохранен со статусом is_superuser={user.is_superuser}.")
    except Exception as e:
        db.rollback()
        print(f"Произошла ошибка при сохранении пользователя: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Создать или обновить суперпользователя.")
    parser.add_argument("email", type=str, help="Email суперпользователя.")
    parser.add_argument("--password", type=str, help="Пароль для нового пользователя или для смены пароля существующего.")
    parser.add_argument(
        "--remove", 
        action="store_true", 
        help="Убрать статус суперпользователя (установить is_superuser=False)."
    )

    args = parser.parse_args()

    db = SessionLocal()
    try:
        make_superuser_flag = not args.remove
        set_superuser_status(db, email=args.email, password=args.password, make_superuser=make_superuser_flag)
    finally:
        db.close()