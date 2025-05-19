# app/crud/crud_users.py
import random
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func

import models
import schemas
import security # Assuming security.py is in the root or accessible via PYTHONPATH
from . import constants # app.crud.constants
from core.cache import cached # Исправленный импорт для cached decorator
# from .utils import update_db_object # Not used directly in user functions shown
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, InvalidInputException, DatabaseOperationException

import logging
logger = logging.getLogger(__name__)

def generate_verification_code(length: int = constants.VERIFICATION_CODE_LENGTH) -> str:
    return "".join(random.choices(string.digits, k=length))

# --- CRUD для Пользователей (User) ---
def get_user(db: Session, user_id: int) -> models.User:
    db_user = db.query(models.User).options(
        selectinload(models.User.lesson_progress) # Assuming this relation exists
    ).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise NotFoundException(entity_name="Пользователь", entity_id=user_id)
    return db_user

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).options(
        selectinload(models.User.lesson_progress) # Assuming this relation exists
    ).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).options(
        selectinload(models.User.lesson_progress) # Assuming this relation exists
    ).order_by(models.User.id).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    # Проверка на существующего пользователя
    if get_user_by_email(db, email=user.email):
        raise DuplicateEntryException(entity_name="Пользователь", conflicting_field="email", conflicting_value=user.email)
        
    hashed_password = security.get_password_hash(user.password)
    verification_code = generate_verification_code()
    code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=constants.VERIFICATION_CODE_EXPIRE_MINUTES)
    
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_email_verified=False,
        email_verification_code=verification_code,
        email_verification_code_expires_at=code_expires_at,
        xp_points=0 # Default XP
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        # Consider sending an email here in a real app
        logger.info(f"Email Verification for {db_user.email}: Code: {db_user.email_verification_code}")
        return db_user
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating user: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать пользователя: {str(e)}")

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> models.User:
    try:
        db_user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
        if not db_user:
            raise NotFoundException(entity_name="Пользователь для обновления", entity_id=user_id)
            
        update_data = user_update.model_dump(exclude_unset=True)
        if 'password' in update_data and update_data['password']: # Check if password is not empty
            update_data['hashed_password'] = security.get_password_hash(update_data.pop('password'))
        elif 'password' in update_data: # password key exists but is empty or None
            update_data.pop('password') # Don't update password if it's empty

        for key, value in update_data.items():
            setattr(db_user, key, value)
            
        db.commit()
        db.refresh(db_user)
        return db_user
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user {user_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить пользователя: {str(e)}")

def verify_email(db: Session, email: str, verification_code: str) -> models.User:
    try:
        user_query = db.query(models.User).filter(
            models.User.email == email,
            models.User.email_verification_code == verification_code
        )
        db_user = user_query.with_for_update().first()

        if not db_user:
            logger.warning(f"Email verification failed: User {email} with code {verification_code} not found or code mismatch.")
            raise NotFoundException(entity_name="Пользователь для верификации", entity_id=email)

        if db_user.email_verification_code_expires_at < datetime.now(timezone.utc):
            logger.warning(f"Email verification failed: Code for {email} expired.")
            # Optionally, resend code or clear expired code
            # db_user.email_verification_code = None
            # db_user.email_verification_code_expires_at = None
            # db.commit()
            raise InvalidInputException("Код верификации истек.")
            
        db_user.is_email_verified = True
        db_user.email_verification_code = None
        db_user.email_verification_code_expires_at = None
        
        db.commit()
        db.refresh(db_user)
        logger.info(f"Email {email} verified successfully.")
        return db_user
    except (NotFoundException, InvalidInputException):
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error verifying email for {email}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Ошибка при верификации email: {str(e)}")

def request_password_reset(db: Session, email: str) -> models.User:
    try:
        db_user = db.query(models.User).filter(models.User.email == email).with_for_update().first()
        if not db_user:
            logger.warning(f"Password reset request: User {email} not found.")
            raise NotFoundException(entity_name="Пользователь для сброса пароля", entity_id=email)
            
        verification_code = generate_verification_code()
        code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=constants.VERIFICATION_CODE_EXPIRE_MINUTES)
        
        db_user.email_verification_code = verification_code
        db_user.email_verification_code_expires_at = code_expires_at
        
        db.commit()
        db.refresh(db_user)
        # Consider sending an email with the reset code here
        logger.info(f"Password Reset for {db_user.email}: Code: {db_user.email_verification_code}")
        return db_user # Return user to indicate success, actual reset in another step
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error requesting password reset for {email}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Ошибка при запросе сброса пароля: {str(e)}")

def reset_password(db: Session, email: str, verification_code: str, new_password: str) -> models.User:
    try:
        user_query = db.query(models.User).filter(
            models.User.email == email,
            models.User.email_verification_code == verification_code
        )
        db_user = user_query.with_for_update().first()
        
        if not db_user:
            logger.warning(f"Password reset failed: User {email} with code {verification_code} not found or code mismatch.")
            raise NotFoundException(entity_name="Пользователь для сброса пароля", entity_id=email)

        if db_user.email_verification_code_expires_at < datetime.now(timezone.utc):
            logger.warning(f"Password reset failed: Code for {email} expired.")
            raise InvalidInputException("Код сброса пароля истек.")
            
        db_user.hashed_password = security.get_password_hash(new_password)
        db_user.email_verification_code = None # Clear the code
        db_user.email_verification_code_expires_at = None
        
        db.commit()
        db.refresh(db_user)
        logger.info(f"Password for user {email} has been reset.")
        return db_user
    except (NotFoundException, InvalidInputException):
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error resetting password for {email}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Ошибка при сбросе пароля: {str(e)}")

@cached(ttl=constants.CACHE_TTL)
def get_user_stats(db: Session, user_id: int) -> Dict[str, Any]:
    try:
        # Проверим, существует ли пользователь
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise NotFoundException(entity_name="Пользователь для получения статистики", entity_id=user_id)
            
        total_lessons = db.query(func.count(models.Lesson.id)).scalar() or 0
        
        completed_lessons = db.query(func.count(models.UserLessonProgress.id))\
            .filter(models.UserLessonProgress.user_id == user_id)\
            .filter(models.UserLessonProgress.completed_at.isnot(None))\
            .scalar() or 0
        
        correct_answers = db.query(func.count(models.UserQuestionProgress.id))\
            .filter(
                models.UserQuestionProgress.user_id == user_id,
                models.UserQuestionProgress.is_correct == True
            )\
            .scalar() or 0
        
        total_attempts = db.query(func.count(models.UserQuestionProgress.id))\
            .filter(models.UserQuestionProgress.user_id == user_id)\
            .scalar() or 0
        
        xp_points = user.xp_points
        
        return {
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "completion_percentage": (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
            "correct_answers": correct_answers,
            "total_attempts": total_attempts,
            "accuracy_percentage": (correct_answers / total_attempts * 100) if total_attempts > 0 else 0,
            "xp_points": xp_points
        }
    except NotFoundException:
        raise
    except Exception as e:
        logger.error(f"Error getting user stats for user_id {user_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Ошибка при получении статистики пользователя: {str(e)}") 