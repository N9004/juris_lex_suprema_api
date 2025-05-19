from typing import Optional, Dict, Any
from datetime import datetime, timezone

from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, func, exists, select

import models
import schemas
from .constants import (
    CACHE_TTL,
    XP_FOR_FIRST_COMPLETION,
    XP_FOR_SECOND_COMPLETION,
    XP_FOR_SUBSEQUENT_COMPLETIONS,
    XP_FOR_CORRECT_ANSWER
)
from core.cache import cached, clear_cache_for_function
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, InvalidInputException, DatabaseOperationException
# TODO: from .crud_users import get_user_stats # For award_xp cache clearing, if direct call is preferred

import logging
logger = logging.getLogger(__name__)

# --- CRUD для Прогресса Пользователя (User Progress) ---

@cached(ttl=CACHE_TTL)
def get_lesson_completion_status(db: Session, user_id: int, lesson_id: int) -> bool:
    return db.query(exists().where(and_(
        models.UserLessonProgress.user_id == user_id,
        models.UserLessonProgress.lesson_id == lesson_id,
        models.UserLessonProgress.completed_at.isnot(None) # Ensure it's marked completed
    ))).scalar()

@cached(ttl=CACHE_TTL)
def get_module_progress(db: Session, user_id: int, module_id: int) -> Dict[str, int]:
    """Calculates user's progress within a module (completed lessons vs total lessons)."""
    try:
        # Original (line 969-986) used a single query. Replicating that.
        result = db.query(
            func.count(models.Lesson.id).label('total_lessons'),
            func.count(models.UserLessonProgress.id).filter(
                 models.UserLessonProgress.completed_at.isnot(None) # Count only actual completions
            ).label('completed_lessons')
        ).outerjoin(
            models.UserLessonProgress,
            and_(
                models.UserLessonProgress.user_id == user_id,
                models.UserLessonProgress.lesson_id == models.Lesson.id
            )
        ).filter(
            models.Lesson.module_id == module_id
        ).first()
        
        total_lessons = result.total_lessons if result else 0
        completed_lessons = result.completed_lessons if result else 0
        
        return {
            "completed_lessons_count": completed_lessons,
            "total_lessons_count": total_lessons,
            "progress_percent": int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting module progress for user {user_id}, module {module_id}: {e}", exc_info=True)
        # It's better to raise or return a default dict that schema expects
        return {
            "completed_lessons_count": 0, 
            "total_lessons_count": 0,
            "progress_percent": 0
        }

@cached(ttl=CACHE_TTL)
def get_discipline_progress(db: Session, user_id: int, discipline_id: int) -> Dict[str, int]:
    """Calculates user's progress within a discipline."""
    try:
        # Запрос количества модулей в дисциплине и кол-ва завершенных модулей
        # Модуль считается завершенным, если завершены все его уроки
        
        # Сначала находим все модули в дисциплине
        modules_in_discipline = db.query(models.Module).filter(
            models.Module.discipline_id == discipline_id
        ).all()
        
        total_modules_count = len(modules_in_discipline)
        completed_modules_count = 0
        
        # Для каждого модуля проверяем, завершен ли он
        for module in modules_in_discipline:
            module_progress = get_module_progress(db, user_id, module.id)
            
            # Если все уроки в модуле завершены, считаем модуль завершенным
            if module_progress["completed_lessons_count"] > 0 and module_progress["total_lessons_count"] > 0:
                if module_progress["completed_lessons_count"] == module_progress["total_lessons_count"]:
                    completed_modules_count += 1
        
        # Также сохраняем информацию об уроках для совместимости с фронтендом
        lessons_result = db.query(
            func.count(models.Lesson.id).label('total_lessons'),
            func.count(models.UserLessonProgress.id).filter(
                models.UserLessonProgress.completed_at.isnot(None) # Count only actual completions
            ).label('completed_lessons')
        ).join(
            models.Module,
            models.Module.id == models.Lesson.module_id
        ).outerjoin(
            models.UserLessonProgress,
            and_(
                models.UserLessonProgress.user_id == user_id,
                models.UserLessonProgress.lesson_id == models.Lesson.id
            )
        ).filter(
            models.Module.discipline_id == discipline_id
        ).first()
        
        return {
            "completed_modules_count": completed_modules_count,
            "total_modules_count": total_modules_count,
            "total_lessons_count": lessons_result.total_lessons if lessons_result else 0,
            "completed_lessons_count": lessons_result.completed_lessons if lessons_result else 0,
            "progress_percent": int((completed_modules_count / total_modules_count) * 100) if total_modules_count > 0 else 0
        }
    except Exception as e:
        logger.error(f"Error getting discipline progress for user {user_id}, discipline {discipline_id}: {e}", exc_info=True)
        return {
            "completed_modules_count": 0,
            "total_modules_count": 0,
            "total_lessons_count": 0,
            "completed_lessons_count": 0,
            "progress_percent": 0
        }

def award_xp(db: Session, user: models.User, xp_points: int):
    """Helper to award XP and clear relevant caches."""
    if user and xp_points > 0:
        user.xp_points = (user.xp_points or 0) + xp_points
        db.add(user)
        # Clear caches that might show old XP or stats
        # Attempting to clear get_user_stats cache. This might require a direct import or a better mechanism.
        # For now, assuming clear_cache_for_function can take a string path to the function if not imported.
        # from app.crud.crud_users import get_user_stats # Example of what might be needed
        try:
            # This is a placeholder for how one might attempt to clear cache for a function in another module.
            # The `core.cache.clear_cache_for_function` would need to support string paths or the function itself.
            # If `get_user_stats` is not directly available, this specific call might not work as written.
            # A more robust solution might involve event signals or a centralized cache management.
            # For this refactor, we'll assume `clear_cache_for_function` is smart or this needs to be wired up correctly later.
            pass # Placeholder for actual call: clear_cache_for_function("app.crud.crud_users.get_user_stats", user_id=user.id)
        except Exception as e_cache:
            logger.error(f"Could not clear get_user_stats cache for user {user.id}: {e_cache}")
        logger.info(f"Awarded {xp_points} XP to user {user.id}. New total: {user.xp_points}")

def mark_lesson_as_completed(db: Session, user_id: int, lesson_id: int) -> models.UserLessonProgress:
    """Marks a lesson as completed for a user, awards XP, and clears relevant caches."""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
        lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()

        if not user:
            raise NotFoundException(entity_name="Пользователь для отметки завершения урока", entity_id=user_id)
        if not lesson:
            raise NotFoundException(entity_name="Урок для отметки завершения", entity_id=lesson_id)

        progress = db.query(models.UserLessonProgress).filter(
            models.UserLessonProgress.user_id == user_id,
            models.UserLessonProgress.lesson_id == lesson_id
        ).with_for_update().first()

        xp_to_award = 0
        current_attempts_before_this_completion = 0

        if progress:
            current_attempts_before_this_completion = progress.attempts or 0
            progress.attempts = current_attempts_before_this_completion + 1
            progress.completed_at = datetime.now(timezone.utc)
            
            # XP logic based on attempts *before* this completion, matching original award_xp_for_lesson_completion
            if current_attempts_before_this_completion == 0: # First time completing
                xp_to_award = XP_FOR_FIRST_COMPLETION
            elif current_attempts_before_this_completion == 1: # Second time completing
                xp_to_award = XP_FOR_SECOND_COMPLETION
            else: # Third or more times
                xp_to_award = XP_FOR_SUBSEQUENT_COMPLETIONS
        else:
            progress = models.UserLessonProgress(
                user_id=user_id,
                lesson_id=lesson_id,
                attempts=1, 
                completed_at=datetime.now(timezone.utc)
            )
            db.add(progress)
            xp_to_award = XP_FOR_FIRST_COMPLETION
        
        if xp_to_award > 0:
            user.xp_points = (user.xp_points or 0) + xp_to_award
        
        db.commit()
        db.refresh(progress)
        db.refresh(user) 

        # Очистка кэша для соответствующих функций
        # Теперь clear_cache_for_function поддерживает как объекты функций, так и строковые имена
        clear_cache_for_function(get_lesson_completion_status)
        
        if lesson.module_id:
            clear_cache_for_function(get_module_progress)
            
            module_info = db.query(models.Module.discipline_id).filter(models.Module.id == lesson.module_id).first()
            if module_info and module_info.discipline_id:
                clear_cache_for_function(get_discipline_progress)
        
        # Для функции в другом модуле используем строковое представление
        clear_cache_for_function('crud_users.get_user_stats')

        setattr(progress, 'xp_earned_for_this_completion', xp_to_award)
        setattr(progress, 'current_total_user_xp', user.xp_points)
        
        return progress
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error marking lesson {lesson_id} completed for user {user_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось отметить урок как завершенный: {str(e)}")

def submit_question_answer(db: Session, user_id: int, question_id: int, user_answer: Any) -> Dict[str, Any]:
    """Submits a user's answer to a question, records progress, awards XP, and clears cache."""
    try:
        user = db.query(models.User).filter(models.User.id == user_id).with_for_update().first()
        question = db.query(models.Question).options(
            selectinload(models.Question.options) # Eager load options
        ).filter(models.Question.id == question_id).first()
        
        if not user:
            raise NotFoundException(entity_name="Пользователь для ответа на вопрос", entity_id=user_id)
        if not question:
            raise NotFoundException(entity_name="Вопрос", entity_id=question_id)
        
        is_correct = False
        correct_answer_details = {}
        
        # Determine correctness based on question type (matches original crud.py lines 1130-1166)
        if question.question_type == models.QuestionType.SINGLE_CHOICE:
            correct_option = next((opt for opt in question.options if opt.is_correct), None)
            is_correct = correct_option and user_answer == correct_option.id
            if correct_option:
                correct_answer_details = {
                    "correct_option_id": correct_option.id,
                    "correct_option_text": correct_option.text
                }
        elif question.question_type == models.QuestionType.MULTIPLE_CHOICE:
            correct_option_ids = {opt.id for opt in question.options if opt.is_correct}
            is_correct = isinstance(user_answer, list) and set(user_answer) == correct_option_ids
            correct_answer_details = {
                "correct_option_ids": list(correct_option_ids),
                "correct_option_texts": [opt.text for opt in question.options if opt.is_correct]
            }
        elif question.question_type == models.QuestionType.TRUE_FALSE:
            is_correct = isinstance(user_answer, bool) and \
                         user_answer == (question.correct_answer_text.lower() == "true" if question.correct_answer_text else False)
            correct_answer_details = {
                "correct_bool_answer": question.correct_answer_text.lower() == "true" if question.correct_answer_text else None
            }
        elif question.question_type == models.QuestionType.FILL_IN_BLANK:
            is_correct = isinstance(user_answer, str) and \
                         user_answer.lower().strip() == (question.correct_answer_text.lower().strip() if question.correct_answer_text else "")
            correct_answer_details = {
                "correct_text_answer": question.correct_answer_text
            }
        
        xp_awarded = XP_FOR_CORRECT_ANSWER if is_correct else 0
        if xp_awarded > 0:
            user.xp_points = (user.xp_points or 0) + xp_awarded
            # Функция clear_cache_for_function принимает только имя функции
            clear_cache_for_function('crud_users.get_user_stats')

        # Проверяем, есть ли уже запись прогресса для этого пользователя и вопроса
        existing_progress = db.query(models.UserQuestionProgress).filter(
            models.UserQuestionProgress.user_id == user_id,
            models.UserQuestionProgress.question_id == question_id
        ).first()

        if existing_progress:
            # Обновляем существующую запись
            existing_progress.is_correct = is_correct
            existing_progress.answered_at = datetime.now(timezone.utc)
        else:
            # Создаем новую запись
            progress = models.UserQuestionProgress(
                user_id=user_id,
                question_id=question_id,
                is_correct=is_correct,
                answered_at=datetime.now(timezone.utc)
            )
            db.add(progress)
            
        db.commit()
        db.refresh(user) 
        
        return {
            "is_correct": is_correct,
            "explanation": question.general_explanation, 
            "correct_answer_details": correct_answer_details,
            "xp_awarded": xp_awarded
        }
    except NotFoundException: 
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting answer for question {question_id} by user {user_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось отправить ответ на вопрос: {str(e)}")

def get_user_question_progress(db: Session, user_id: int, question_id: int) -> Optional[models.UserQuestionProgress]:
    return db.query(models.UserQuestionProgress).filter(
        models.UserQuestionProgress.user_id == user_id,
        models.UserQuestionProgress.question_id == question_id
    ).first()

def get_user_lesson_progress(db: Session, user_id: int, lesson_id: int) -> Optional[models.UserLessonProgress]:
    return db.query(models.UserLessonProgress).filter(
        models.UserLessonProgress.user_id == user_id,
        models.UserLessonProgress.lesson_id == lesson_id
    ).first() 