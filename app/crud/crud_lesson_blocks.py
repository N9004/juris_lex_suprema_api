# app/crud/crud_lesson_blocks.py
from typing import List, Optional

from sqlalchemy.orm import Session, selectinload

import models
import schemas
from .utils import update_db_object
from core.cache import cached # Исправленный импорт
from . import constants # Corrected import
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, InvalidInputException, DatabaseOperationException

import logging
logger = logging.getLogger(__name__)

from . import crud_user_progress # Corrected import

# --- CRUD для Блоков Урока (LessonBlock) ---
@cached(ttl=constants.CACHE_TTL) # If get_lesson_block was cached
def get_lesson_block(db: Session, block_id: int, user_id: Optional[int] = None) -> models.LessonBlock:
    query = db.query(models.LessonBlock).filter(models.LessonBlock.id == block_id)
    query = query.options(
        selectinload(models.LessonBlock.questions)
        .selectinload(models.Question.options),
        selectinload(models.LessonBlock.lesson) # Eager load lesson for user progress check
    )
    block = query.first()
    if not block:
        raise NotFoundException(entity_name="Блок урока", entity_id=block_id)
    
    if user_id and block.lesson:
        # is_completed_by_user on a block context usually means if the *lesson* it belongs to is completed.
        # The original crud.py used a subquery on UserLessonProgress joining up to LessonBlock.
        # This is simplified by fetching the lesson and checking its completion status.
        block.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, block.lesson_id)
        
        # TODO: Augment questions within the block with user answers if schema expects it here.
        # for q in block.questions:
        #     q.user_answer = crud_user_progress.get_user_question_answer(db, user_id, q.id) # Fictional example
            
    return block

@cached(ttl=constants.CACHE_TTL) # If get_lesson_blocks was cached
def get_lesson_blocks(db: Session, lesson_id: int, user_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[models.LessonBlock]:
    query = db.query(models.LessonBlock)\
        .filter(models.LessonBlock.lesson_id == lesson_id)\
        .order_by(models.LessonBlock.order_in_lesson) # Corrected order_by field
    
    query = query.options(
        selectinload(models.LessonBlock.questions)
        .selectinload(models.Question.options), # Eager load questions and their options
        selectinload(models.LessonBlock.lesson) # Eager load lesson for user progress check
    )
    
    blocks = query.offset(skip).limit(limit).all()

    if user_id and blocks and blocks[0].lesson: # Check if blocks exist and lesson is loaded
        # Assuming all blocks in this list belong to the same lesson, so one check is enough for lesson completion.
        lesson_completed_status = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_id)
        for block_obj in blocks:
            block_obj.is_completed_by_user = lesson_completed_status
            # TODO: Augment questions with user answers if needed.
    return blocks

def create_lesson_block(db: Session, lesson_id: int, block_data: schemas.LessonBlockCreate) -> models.LessonBlock:
    # Original crud.py lines 633-668
    try:
        lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
        if not lesson:
            raise NotFoundException(entity_name="Урок для создания блока", entity_id=lesson_id)

        # Create base block object
        db_block = models.LessonBlock(
            lesson_id=lesson_id,
            order_in_lesson=block_data.order_in_lesson,
            block_type=block_data.block_type,
            theory_text=block_data.theory_text
            # lesson relationship will be set by SQLAlchemy if lesson.blocks.append(db_block) is used,
            # or by db_block.lesson = lesson. For cascading, better to let parent handle it.
        )
        # Assign to lesson to establish relationship before commit, if not using cascade from lesson side only
        db_block.lesson = lesson 

        if block_data.block_type == models.LessonBlockType.EXERCISE and block_data.questions:
            for question_schema in block_data.questions:
                db_question = models.Question(
                    text=question_schema.text,
                    question_type=question_schema.question_type,
                    general_explanation=question_schema.general_explanation,
                    correct_answer_text=question_schema.correct_answer_text,
                    lesson_block=db_block # Assign to block
                )
                # db.add(db_question) # Let cascade handle or add explicitly if issues

                if question_schema.options:
                    for option_schema in question_schema.options:
                        db_option = models.QuestionOption(
                            text=option_schema.text,
                            is_correct=option_schema.is_correct,
                            question=db_question # Assign to question
                        )
                        # db.add(db_option)
        
        db.add(db_block) # Add block, children should be cascaded if models are set up with cascade.
                         # If not, they need to be added explicitly to the session.
                         # Original crud.py added lesson, then block, then question, then option with individual commits/flushes.
                         # Here, trying a more ORM-idiomatic way first.
        db.commit()
        db.refresh(db_block)
        return db_block
        
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating lesson block for lesson {lesson_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать блок урока: {str(e)}")

def update_lesson_block(db: Session, block_id: int, block_update: schemas.LessonBlockUpdate) -> models.LessonBlock:
    # Original crud.py lines 670-758
    try:
        db_block = db.query(models.LessonBlock).options(
            selectinload(models.LessonBlock.questions).selectinload(models.Question.options)
        ).filter(models.LessonBlock.id == block_id).first()

        if not db_block:
            raise NotFoundException(entity_name="Блок урока для обновления", entity_id=block_id)

        # Update scalar fields of the block
        update_data_dict = block_update.model_dump(exclude_unset=True, exclude={"questions"}) # Exclude questions for now
        for key, value in update_data_dict.items():
            if hasattr(db_block, key):
                setattr(db_block, key, value)

        # Handle questions update if provided in the payload
        if block_update.questions is not None and db_block.block_type == models.LessonBlockType.EXERCISE:
            existing_questions_map = {q.id: q for q in db_block.questions}
            updated_question_ids = set()

            for q_update_schema in block_update.questions:
                if q_update_schema.id and q_update_schema.id in existing_questions_map:
                    # Update existing question
                    db_question = existing_questions_map[q_update_schema.id]
                    updated_question_ids.add(db_question.id)
                    
                    # Update question scalar fields
                    q_scalar_data = q_update_schema.model_dump(exclude_unset=True, exclude={"options", "id"})
                    for key, value in q_scalar_data.items():
                        if hasattr(db_question, key):
                            setattr(db_question, key, value)
                    
                    # Update options for this question
                    if q_update_schema.options is not None:
                        existing_options_map = {opt.id: opt for opt in db_question.options}
                        updated_option_ids = set()
                        for opt_update_schema in q_update_schema.options:
                            if opt_update_schema.id and opt_update_schema.id in existing_options_map:
                                # Update existing option
                                db_option = existing_options_map[opt_update_schema.id]
                                updated_option_ids.add(db_option.id)
                                opt_scalar_data = opt_update_schema.model_dump(exclude_unset=True, exclude={"id"})
                                for key, value in opt_scalar_data.items():
                                    if hasattr(db_option, key):
                                        setattr(db_option, key, value)
                            else:
                                # Create new option
                                new_option = models.QuestionOption(
                                    **opt_update_schema.model_dump(exclude={"id"}), 
                                    question_id=db_question.id
                                )
                                db.add(new_option) # Add to session, will be associated via question.options by SA
                        
                        # Delete options not in the update payload for this question
                        for opt_id_to_delete in list(existing_options_map.keys() - updated_option_ids):
                            db.delete(existing_options_map[opt_id_to_delete])
                
                elif not q_update_schema.id: # New question (id is None or not provided)
                    # Create new question with its options
                    new_question = models.Question(
                        text=q_update_schema.text,
                        question_type=q_update_schema.question_type,
                        general_explanation=q_update_schema.general_explanation,
                        correct_answer_text=q_update_schema.correct_answer_text,
                        lesson_block_id=db_block.id # Associate with current block
                    )
                    if q_update_schema.options:
                        for opt_schema in q_update_schema.options:
                            new_option = models.QuestionOption(
                                text=opt_schema.text,
                                is_correct=opt_schema.is_correct,
                                question=new_question # Associate with new question
                            )
                            # new_question.options.append(new_option) # SA should handle this if relationship is correct
                    db.add(new_question)
            
            # Delete questions not in the update payload for this block
            for q_id_to_delete in list(existing_questions_map.keys() - updated_question_ids):
                question_to_delete = existing_questions_map[q_id_to_delete]
                # Manually delete options of the question to be deleted, if cascade is not 'all, delete-orphan' on Question.options
                for opt_to_delete in question_to_delete.options:
                    db.delete(opt_to_delete)
                db.delete(question_to_delete)

        db.add(db_block) # Add block to session again in case of changes
        db.commit()
        db.refresh(db_block)
        return db_block

    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating lesson block {block_id}: {str(e)}", exc_info=True)
        # Re-raise to be handled by endpoint, possibly as HTTPException
        raise DatabaseOperationException(f"Не удалось обновить блок урока: {str(e)}")

def delete_lesson_block(db: Session, block_id: int) -> bool:
    try:
        db_block = db.query(models.LessonBlock).filter(models.LessonBlock.id == block_id).first()
        if not db_block:
            raise NotFoundException(entity_name="Блок урока для удаления", entity_id=block_id)
        
        # Add logic here to delete associated questions and options if cascading delete is not set up
        # db.query(models.QuestionOption).join(models.Question).filter(models.Question.lesson_block_id == block_id).delete(synchronize_session=False)
        # db.query(models.Question).filter(models.Question.lesson_block_id == block_id).delete(synchronize_session=False)
        
        db.delete(db_block)
        db.commit()
        return True
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting lesson block {block_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить блок урока: {str(e)}") 