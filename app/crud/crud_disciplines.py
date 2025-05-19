# app/crud/crud_disciplines.py
from typing import List, Optional

from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, and_

import models
import schemas
from .utils import update_db_object
from . import crud_user_progress
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, DatabaseOperationException

import logging
logger = logging.getLogger(__name__)

# --- CRUD для Дисциплин (Discipline) ---
def get_discipline(db: Session, discipline_id: int, user_id: Optional[int] = None) -> models.Discipline:
    query = db.query(models.Discipline).filter(models.Discipline.id == discipline_id)
    
    if user_id:
        # Eager load modules and their lessons
        query = query.options(
            selectinload(models.Discipline.modules)
            .selectinload(models.Module.lessons)
        )
        discipline = query.first()
        if not discipline:
            raise NotFoundException(entity_name="Дисциплина", entity_id=discipline_id)

        # Augment with progress information (mimicking original logic)
        # Discipline progress (total vs completed lessons in discipline)
        discipline.progress = crud_user_progress.get_discipline_progress(db, user_id, discipline.id)

        for module_obj in discipline.modules:
            # Module progress (total vs completed lessons in module)
            module_obj.progress = crud_user_progress.get_module_progress(db, user_id, module_obj.id)
            for lesson_obj in module_obj.lessons:
                # Lesson completion status
                lesson_obj.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_obj.id)
        return discipline
    else:
        # If no user_id, just load the discipline and its structure without progress
        query = query.options(
            selectinload(models.Discipline.modules)
            .selectinload(models.Module.lessons)
        )
        discipline = query.first()
        if not discipline:
            raise NotFoundException(entity_name="Дисциплина", entity_id=discipline_id)
        return discipline

def get_discipline_by_title(db: Session, title: str) -> Optional[models.Discipline]:
    return db.query(models.Discipline).filter(models.Discipline.title == title).first()

def get_disciplines(db: Session, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[models.Discipline]:
    query = db.query(models.Discipline).order_by(models.Discipline.id)
    
    query = query.options(
        selectinload(models.Discipline.modules)
        .selectinload(models.Module.lessons)
    )

    disciplines = query.offset(skip).limit(limit).all()
    
    if user_id:
        for disc in disciplines:
            # Discipline progress
            disc.progress = crud_user_progress.get_discipline_progress(db, user_id, disc.id)
            for module_obj in disc.modules:
                # Module progress
                module_obj.progress = crud_user_progress.get_module_progress(db, user_id, module_obj.id)
                for lesson_obj in module_obj.lessons:
                    # Lesson completion status
                    lesson_obj.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_obj.id)
    return disciplines

def create_discipline(db: Session, discipline_data: schemas.DisciplineCreate) -> models.Discipline:
    try:
        # Проверка на существующую дисциплину с таким же названием
        existing_discipline = get_discipline_by_title(db, discipline_data.title)
        if existing_discipline:
            raise DuplicateEntryException(entity_name="Дисциплина", conflicting_field="title", conflicting_value=discipline_data.title)
            
        db_discipline = models.Discipline(**discipline_data.model_dump())
        db.add(db_discipline)
        db.commit()
        db.refresh(db_discipline)
        return db_discipline
    except DuplicateEntryException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating discipline: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать дисциплину: {str(e)}")

def update_discipline(db: Session, discipline_id: int, discipline_update: schemas.DisciplineUpdate) -> models.Discipline:
    try:
        db_discipline = db.query(models.Discipline).filter(models.Discipline.id == discipline_id).first()
        if not db_discipline:
            raise NotFoundException(entity_name="Дисциплина для обновления", entity_id=discipline_id)
            
        # Проверка на дубликат названия, если название меняется
        if discipline_update.title and discipline_update.title != db_discipline.title:
            existing = get_discipline_by_title(db, discipline_update.title)
            if existing and existing.id != discipline_id:
                raise DuplicateEntryException(entity_name="Дисциплина", conflicting_field="title", conflicting_value=discipline_update.title)
                
        updated_discipline = update_db_object(db_discipline, discipline_update)
        db.add(updated_discipline) # or just db.add(db_discipline) as it's the same object
        db.commit()
        db.refresh(updated_discipline)
        return updated_discipline
    except (NotFoundException, DuplicateEntryException):
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating discipline {discipline_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить дисциплину: {str(e)}")

def delete_discipline(db: Session, discipline_id: int) -> bool:
    try:
        db_discipline = db.query(models.Discipline).filter(models.Discipline.id == discipline_id).first()
        if not db_discipline:
            raise NotFoundException(entity_name="Дисциплина для удаления", entity_id=discipline_id)
            
        db.delete(db_discipline)
        db.commit()
        return True
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting discipline {discipline_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить дисциплину: {str(e)}") 