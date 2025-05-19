# app/crud/crud_lessons.py
from typing import List, Optional

from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import and_, select, literal_column

import models
import schemas
from .utils import update_db_object
from core.cache import cached # Исправленный импорт
from . import constants # Ensured constants import is correct form
from . import crud_user_progress # Added import for crud_user_progress

import logging
logger = logging.getLogger(__name__)

# --- CRUD для Уроков (Lesson) ---
@cached(ttl=constants.CACHE_TTL) # Add if get_lesson was cached
def get_lesson(db: Session, lesson_id: int, user_id: Optional[int] = None) -> Optional[models.Lesson]:
    query = db.query(models.Lesson).filter(models.Lesson.id == lesson_id)
    # Eager load related data like blocks, questions, options
    query = query.options(
        selectinload(models.Lesson.blocks)
        .selectinload(models.LessonBlock.questions)
        .selectinload(models.Question.options)
    )
    lesson = query.first()

    if not lesson:
        return None

    if user_id:
        # Augment with user-specific progress
        lesson.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson.id)
        # The original crud.py (lines 426-434) had a subquery for completion status directly in the query.
        # Here, we are doing it post-fetch for simplicity and because get_lesson_completion_status is already defined.
        # If performance becomes an issue, the subquery approach can be revisited.

        # TODO: Original crud.py did not show fetching individual question answers here for a single lesson,
        # but if schemas.Lesson expects augmented questions (e.g. with user_answer), that logic would go here.
        # For now, only is_completed_by_user is added at the lesson level.
    
    return lesson

def get_lesson_by_title(db: Session, title: str, module_id: int) -> Optional[models.Lesson]:
    return db.query(models.Lesson).filter(
        models.Lesson.title == title,
        models.Lesson.module_id == module_id
    ).first()

def get_lessons_by_module(db: Session, module_id: int, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.Lesson]:
    query = db.query(models.Lesson)\
        .filter(models.Lesson.module_id == module_id)\
        .order_by(models.Lesson.order)
    
    query = query.options(
        selectinload(models.Lesson.blocks)
        .selectinload(models.LessonBlock.questions) 
        .selectinload(models.Question.options) # Eager load fully: blocks -> questions -> options
    )

    lessons = query.offset(skip).limit(limit).all()

    if user_id:
        for lesson_obj in lessons:
            lesson_obj.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_obj.id)
            # Similar to get_lesson, individual question answers within blocks are not explicitly augmented here
            # based on the original crud.py snippet for get_lessons_by_module.
    return lessons

def get_all_lessons(db: Session, skip: int = 0, limit: int = 100) -> List[models.Lesson]:
    # Original crud.py lines 464-468 (get_all_lessons, simpler than by_module)
    return db.query(models.Lesson).options(
        selectinload(models.Lesson.blocks).selectinload(models.LessonBlock.questions).selectinload(models.Question.options),
        selectinload(models.Lesson.module) # Also load parent module
    ).order_by(models.Lesson.module_id, models.Lesson.order).offset(skip).limit(limit).all()

def create_lesson(db: Session, lesson_data: schemas.LessonCreate) -> models.Lesson:
    # Original crud.py lines 471-523
    try:
        module = db.query(models.Module).filter(models.Module.id == lesson_data.module_id).first()
        if not module:
            logger.warning(f"Module with ID {lesson_data.module_id} not found when creating lesson.")
            # Propagate error appropriately, e.g., by raising ValueError to be caught by endpoint
            raise ValueError(f"Module {lesson_data.module_id} not found")

        # Create base lesson object
        db_lesson = models.Lesson(
            title=lesson_data.title,
            order=lesson_data.order if lesson_data.order is not None else 0,
            module_id=lesson_data.module_id,
            description=lesson_data.description # Added description from schema
        )
        # The original `crud.py` directly assigned db_lesson to block.lesson and block to question.lesson_block etc.
        # This creates the relationships before adding the main lesson to session.
        # SQLAlchemy handles this through backrefs or explicit assignment.

        if lesson_data.blocks:
            for block_schema in lesson_data.blocks:
                # Create LessonBlock
                db_block = models.LessonBlock(
                    order_in_lesson=block_schema.order_in_lesson,
                    block_type=block_schema.block_type,
                    theory_text=block_schema.theory_text,
                    lesson=db_lesson # Assign to lesson directly
                )
                # db.add(db_block) # Not strictly needed if lesson is added with cascade save-update

                if block_schema.block_type == models.LessonBlockType.EXERCISE and block_schema.questions:
                    for question_schema in block_schema.questions:
                        # Create Question
                        db_question = models.Question(
                            text=question_schema.text,
                            question_type=question_schema.question_type,
                            general_explanation=question_schema.general_explanation,
                            correct_answer_text=question_schema.correct_answer_text,
                            lesson_block=db_block # Assign to block directly
                        )
                        # db.add(db_question)

                        if question_schema.options:
                            for option_schema in question_schema.options:
                                # Create QuestionOption
                                db_option = models.QuestionOption(
                                    text=option_schema.text,
                                    is_correct=option_schema.is_correct,
                                    question=db_question # Assign to question directly
                                )
                                # db.add(db_option)
        
        db.add(db_lesson) # Add the top-level lesson, cascades should save children if configured
        db.commit()
        db.refresh(db_lesson) # Refresh to get IDs and load relationships
        
        return db_lesson
        
    except ValueError as ve: # Catch module not found
        db.rollback()
        logger.error(f"Value error creating lesson: {str(ve)}")
        raise # Re-raise for endpoint to handle
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating lesson: {str(e)}", exc_info=True)
        # Consider raising a more specific error or HTTPException if this CRUD is directly used by API
        # For now, re-raising the generic exception, but endpoint should catch it.
        raise

def update_lesson(db: Session, lesson_id: int, lesson_update: schemas.LessonUpdate) -> Optional[models.Lesson]:
    try:
        db_lesson = get_lesson(db, lesson_id) # user_id likely not needed for admin update context
        if not db_lesson:
            return None

        if lesson_update.module_id is not None:
            module = db.query(models.Module).filter(models.Module.id == lesson_update.module_id).first()
            if not module:
                logger.warning(f"Target module {lesson_update.module_id} not found for lesson update.")
                return None
        
        # Handle update of nested structures like blocks if schema supports it and original did it.
        # This is complex: involves diffing, creating new, updating existing, deleting old.
        # For now, only updating direct Lesson fields via update_db_object.
        update_data_for_lesson_model = lesson_update.model_dump(exclude_unset=True, exclude={"blocks"}) # Example exclusion
        
        # Manually handle fields not in the model for update_db_object or handle them separately
        custom_fields = {}
        if "blocks" in lesson_update.model_fields_set:
             # Logic to update/create/delete blocks for this lesson
             # This would call functions from crud_lesson_blocks.py
             logger.info("Updating blocks for lesson is a complex operation, not fully implemented in this refactor step.")
             pass # Placeholder

        # Update scalar fields on the lesson itself
        for key, value in update_data_for_lesson_model.items():
            if hasattr(db_lesson, key):
                 setattr(db_lesson, key, value)

        db.add(db_lesson)
        db.commit()
        db.refresh(db_lesson)
        return db_lesson
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating lesson {lesson_id}: {e}", exc_info=True)
        raise

def delete_lesson(db: Session, lesson_id: int) -> bool:
    try:
        db_lesson = get_lesson(db, lesson_id)
        if not db_lesson:
            return False
        
        # Add logic here to delete associated blocks, questions, options if cascading delete is not set up in DB/ORM
        # For example:
        # for block in db_lesson.blocks:
        #    for question in block.questions:
        #        # delete options for question
        #        db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question.id).delete()
        #    # delete questions for block
        #    db.query(models.Question).filter(models.Question.lesson_block_id == block.id).delete()
        # delete blocks for lesson
        # db.query(models.LessonBlock).filter(models.LessonBlock.lesson_id == lesson_id).delete()

        db.delete(db_lesson)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting lesson {lesson_id}: {e}", exc_info=True)
        raise 