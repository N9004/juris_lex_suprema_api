# app/crud/crud_questions.py
from typing import List, Optional, Tuple, Any # Added Any for create_question

from sqlalchemy.orm import Session, selectinload

import models
import schemas
from .utils import update_db_object
from core.cache import cached
from . import constants
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, InvalidInputException, DatabaseOperationException

import logging
from . import crud_user_progress

logger = logging.getLogger(__name__)

# --- CRUD для Вопросов (Question) ---
@cached(ttl=constants.CACHE_TTL)
def get_question(db: Session, question_id: int, user_id: Optional[int] = None) -> models.Question:
    query = db.query(models.Question).filter(models.Question.id == question_id)
    query = query.options(
        selectinload(models.Question.options),
        selectinload(models.Question.lesson_block).selectinload(models.LessonBlock.lesson) # Eager load up to lesson
    )
    question = query.first()
    if not question:
        raise NotFoundException(entity_name="Вопрос", entity_id=question_id)
    
    if user_id and question.lesson_block and question.lesson_block.lesson:
        # A question's "is_completed_by_user" status is typically tied to its parent lesson's completion.
        question.is_completed_by_user = crud_user_progress.get_lesson_completion_status(
            db, user_id, question.lesson_block.lesson.id
        )
        # TODO: Augment with user's actual answer to *this* question if schema expects it.
        # user_progress_for_q = crud_user_progress.get_user_question_progress(db, user_id, question.id)
        # if user_progress_for_q:
        #     question.user_selected_option_id = user_progress_for_q.selected_option_id
        #     question.was_answered_correctly_by_user = user_progress_for_q.is_correct
            
    return question

@cached(ttl=constants.CACHE_TTL)
def get_questions_by_block(db: Session, block_id: int, user_id: Optional[int] = None) -> List[models.Question]:
    query = db.query(models.Question)\
        .filter(models.Question.lesson_block_id == block_id)\
        .order_by(models.Question.order)
    query = query.options(
        selectinload(models.Question.options),
        selectinload(models.Question.lesson_block).selectinload(models.LessonBlock.lesson) # Eager load up to lesson
    )
    questions = query.all()

    if user_id and questions:
        # Assuming all questions in this list belong to the same lesson block, and thus the same lesson.
        # Get the lesson_id from the first question's hierarchy if available.
        first_q = questions[0]
        if first_q.lesson_block and first_q.lesson_block.lesson:
            lesson_id = first_q.lesson_block.lesson.id
            lesson_completed_status = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_id)
            for q_obj in questions:
                q_obj.is_completed_by_user = lesson_completed_status
                # TODO: Augment with user's actual answer to *this* question if schema expects it.
    return questions

def create_question(db: Session, block_id: int, question_data: schemas.QuestionCreate) -> models.Question:
    """Creates a single question and its options, linking to a lesson_block."""
    # Based on original crud.py (lines 1205-1227, and pattern from create_lesson_block)
    try:
        block = db.query(models.LessonBlock).filter(models.LessonBlock.id == block_id).first()
        if not block:
            raise NotFoundException(entity_name="Блок урока для создания вопроса", entity_id=block_id)

        options_data = question_data.options or []
        db_question = models.Question(
            text=question_data.text,
            # type=question_data.type, # Original field was 'type', schema has 'question_type'
            question_type=question_data.question_type, 
            # order=question_data.order, # Original field was 'order', schema doesn't show for QuestionBase
            general_explanation=question_data.general_explanation,
            correct_answer_text=question_data.correct_answer_text,
            lesson_block_id=block_id
        )
        # Add options if provided
        if options_data:
            for option_schema in options_data:
                db_option = models.QuestionOption(
                    text=option_schema.text,
                    is_correct=option_schema.is_correct,
                    # order=option_schema.order, # Original field, schema doesn't show for QuestionOptionBase
                    question=db_question # Assign to question directly
                )
                # db.add(db_option) # Let cascade handle this
        
        db.add(db_question) # Add question, options should cascade if model relationships are correct
        db.commit() # Commit to get question ID and save options
        db.refresh(db_question) # Refresh to load options relation if needed
        
        return db_question
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating question for block {block_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать вопрос: {str(e)}")

def create_questions_batch(db: Session, block_id: int, questions_data: List[schemas.QuestionCreate]) -> List[models.Question]:
    """Creates multiple questions with their options for a given block_id."""
    # Original crud.py lines 812-851
    # This version will call create_question for each item for simplicity,
    # true batching might involve db.add_all() and careful flush/commit.
    # The original also did a db.flush() to get IDs then created options.
    db_questions = []
    try:
        block = db.query(models.LessonBlock).filter(models.LessonBlock.id == block_id).first()
        if not block:
            raise NotFoundException(entity_name="Блок урока для создания группы вопросов", entity_id=block_id)

        temp_questions_to_add = []
        for question_schema in questions_data:
            db_question_instance = models.Question(
                lesson_block_id=block_id,
                text=question_schema.text,
                question_type=question_schema.question_type,
                general_explanation=question_schema.general_explanation,
                correct_answer_text=question_schema.correct_answer_text
            )
            temp_options_to_add = []
            if question_schema.options:
                for option_schema in question_schema.options:
                    db_option_instance = models.QuestionOption(
                        text=option_schema.text,
                        is_correct=option_schema.is_correct,
                        question=db_question_instance # Link to parent question instance
                    )
                    temp_options_to_add.append(db_option_instance)
            
            # db_question_instance.options.extend(temp_options_to_add) # If relationship is appendable
            temp_questions_to_add.append(db_question_instance)
        
        db.add_all(temp_questions_to_add)
        db.commit() # Commit all questions and their cascaded options

        # Refresh all created questions to load their options and IDs
        for q_instance in temp_questions_to_add:
            db.refresh(q_instance)
            # Manually refresh options if eager loading isn't picking them up post-commit or if needed
            # for opt in q_instance.options: db.refresh(opt)
            db_questions.append(q_instance)
            
        return db_questions

    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating questions batch for block {block_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать группу вопросов: {str(e)}")

def update_question(db: Session, question_id: int, question_update: schemas.QuestionUpdate) -> models.Question:
    """Updates a single question and its options."""
    # Logic derived from update_lesson_block for nested entities in original crud.py
    try:
        db_question = db.query(models.Question).options(selectinload(models.Question.options)).filter(models.Question.id == question_id).first()
        if not db_question:
            raise NotFoundException(entity_name="Вопрос для обновления", entity_id=question_id)

        # Update scalar fields of the question
        question_scalar_data = question_update.model_dump(exclude_unset=True, exclude={"options", "id"})
        for key, value in question_scalar_data.items():
            if hasattr(db_question, key):
                setattr(db_question, key, value)
        
        # Handle options update
        if question_update.options is not None:
            existing_options_map = {opt.id: opt for opt in db_question.options}
            updated_option_ids = set()

            for opt_update_schema in question_update.options:
                opt_update_data = opt_update_schema.model_dump()
                if opt_update_data.get("id") and opt_update_data["id"] in existing_options_map:
                    # Update existing option
                    db_option = existing_options_map[opt_update_data["id"]]
                    updated_option_ids.add(db_option.id)
                    # Call crud_questions.update_question_option (or its logic directly)
                    update_question_option(db, db_option.id, schemas.QuestionOptionUpdate(**opt_update_schema.model_dump(exclude_unset=True)))
                else:
                    # Create new option
                    # Call crud_questions.create_question_option (or its logic directly)
                    create_question_option(db, question_id, schemas.QuestionOptionCreate(**opt_update_schema.model_dump(exclude_unset=True, exclude={'id'})))
            
            # Delete options not present in the update
            for opt_id_to_delete in list(existing_options_map.keys() - updated_option_ids):
                delete_question_option(db, opt_id_to_delete)

        db.add(db_question) # Re-add to session in case of changes to question itself
        db.commit()
        db.refresh(db_question) # Refresh to get all changes and updated/new options
        return db_question
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating question {question_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить вопрос: {str(e)}")

def update_questions_batch(db: Session, questions_data: List[Tuple[int, schemas.QuestionUpdate]]) -> List[models.Question]:
    """Updates multiple questions and their options."""
    # Original crud.py lines 852-887. This simplifies to calling update_question per item.
    updated_questions = []
    try:
        for q_id, q_update_data in questions_data:
            # Need to ensure QuestionUpdate schema passed to update_question is correct
            # The Tuple is (id, Schema). So q_update_data is already QuestionUpdate.
            try:
                updated_q = update_question(db, q_id, q_update_data)
                updated_questions.append(updated_q)
            except NotFoundException:
                logger.warning(f"Вопрос с ID {q_id} не найден при групповом обновлении")
                # Продолжаем с остальными вопросами
                continue
        # Commits are handled within update_question, so no final commit here needed if that pattern is kept.
        return updated_questions
    except Exception as e:
        # Rollback might have already happened in update_question if it raised an error.
        # However, if an error happens in the loop itself, a rollback here is good.
        db.rollback() 
        logger.error(f"Error in update_questions_batch: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить группу вопросов: {str(e)}")

def delete_question(db: Session, question_id: int) -> bool:
    """Deletes a single question and its associated options."""
    # Logic based on pattern for deleting related entities, e.g., original delete_lesson_block
    try:
        db_question = db.query(models.Question).options(selectinload(models.Question.options)).filter(models.Question.id == question_id).first()
        if not db_question:
            raise NotFoundException(entity_name="Вопрос для удаления", entity_id=question_id)
        
        # Explicitly delete options if cascade isn't 'all, delete-orphan' or to be certain
        # The original delete_questions_batch (lines 892-895) did this.
        for option in db_question.options: # db_question.options should be loaded due to selectinload
            db.delete(option)
        # Or, more directly if not relying on the loaded collection:
        # db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question_id).delete(synchronize_session=False)

        db.delete(db_question)
        db.commit()
        return True
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting question {question_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить вопрос: {str(e)}")

def delete_questions_batch(db: Session, question_ids: List[int]) -> bool:
    """Deletes multiple questions and their associated options."""
    # Original crud.py lines 887-907
    try:
        # First, delete all options for the questions in the batch to avoid FK violations
        # if session synchronization is an issue or cascades are not perfectly set.
        # This matches original crud.py approach (lines 892-895).
        db.query(models.QuestionOption).filter(
            models.QuestionOption.question_id.in_(question_ids)
        ).delete(synchronize_session=False) # False is often safer for batch deletes
        
        # Then, delete the questions themselves
        deleted_count = db.query(models.Question).filter(
            models.Question.id.in_(question_ids)
        ).delete(synchronize_session=False)
        
        db.commit()
        return deleted_count > 0 # Return true if at least one question was deleted
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting questions batch: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить группу вопросов: {str(e)}")

# --- CRUD для Опций Вопросов (QuestionOption) ---
def get_question_option(db: Session, option_id: int) -> models.QuestionOption:
    option = db.query(models.QuestionOption).filter(models.QuestionOption.id == option_id).first()
    if not option:
        raise NotFoundException(entity_name="Вариант ответа", entity_id=option_id)
    return option

def create_question_option(db: Session, question_id: int, option_data: schemas.QuestionOptionCreate) -> models.QuestionOption:
    try:
        # Ensure question exists
        question = db.query(models.Question).filter(models.Question.id == question_id).first()
        if not question:
            raise NotFoundException(entity_name="Вопрос для создания варианта ответа", entity_id=question_id)

        db_option = models.QuestionOption(**option_data.model_dump(), question_id=question_id)
        db.add(db_option)
        db.commit()
        db.refresh(db_option)
        return db_option
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating question option for question {question_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать вариант ответа: {str(e)}")

def update_question_option(db: Session, option_id: int, option_update: schemas.QuestionOptionUpdate) -> models.QuestionOption:
    try:
        db_option = db.query(models.QuestionOption).filter(models.QuestionOption.id == option_id).first()
        if not db_option:
            raise NotFoundException(entity_name="Вариант ответа для обновления", entity_id=option_id)
        
        # Ensure question_id in update data matches if provided, or is not changed to an invalid one.
        if option_update.question_id is not None and option_update.question_id != db_option.question_id:
            target_question = db.query(models.Question).filter(models.Question.id == option_update.question_id).first()
            if not target_question:
                raise NotFoundException(entity_name="Вопрос для привязки варианта ответа", entity_id=option_update.question_id)

        updated_option = update_db_object(db_option, option_update)
        db.add(updated_option)
        db.commit()
        db.refresh(updated_option)
        return updated_option
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating question option {option_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить вариант ответа: {str(e)}")

def delete_question_option(db: Session, option_id: int) -> bool:
    try:
        db_option = db.query(models.QuestionOption).filter(models.QuestionOption.id == option_id).first()
        if not db_option:
            raise NotFoundException(entity_name="Вариант ответа для удаления", entity_id=option_id)
        db.delete(db_option)
        db.commit()
        return True
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting question option {option_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить вариант ответа: {str(e)}") 