# app/crud/crud_modules.py
from typing import List, Optional

from sqlalchemy.orm import Session, selectinload, joinedload
from sqlalchemy import and_, select

import models
import schemas
from .utils import update_db_object
# from core.cache import cached # If get_module was cached
# from .constants import CACHE_TTL # If get_module was cached
from core.cache import cached # Исправленный импорт
from . import constants # Added import
from app.exceptions.crud_exceptions import NotFoundException, DuplicateEntryException, DatabaseOperationException

import logging
# import crud_user_progress
from . import crud_user_progress # Corrected import

logger = logging.getLogger(__name__)

# --- CRUD для Модулей (Module) ---
@cached(ttl=constants.CACHE_TTL) # Add if get_module was cached in original crud.py
def get_module(db: Session, module_id: int, user_id: Optional[int] = None) -> models.Module:
    query = db.query(models.Module).filter(models.Module.id == module_id)
    query = query.options(
        selectinload(models.Module.lessons)
        # .selectinload(models.Lesson.user_progress).filter(...) # If detailed progress per lesson needed
    ) # Add other eager loads if necessary, e.g., for discipline relationship
    
    module = query.first()

    if not module:
        raise NotFoundException(entity_name="Модуль", entity_id=module_id)

    if user_id:
        # Augment with progress information
        # Module progress (total vs completed lessons in module)
        module.progress = crud_user_progress.get_module_progress(db, user_id, module.id)
        for lesson_obj in module.lessons:
            # Lesson completion status
            lesson_obj.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_obj.id)
    
    return module

def get_module_by_title(db: Session, title: str, discipline_id: int) -> Optional[models.Module]:
    return db.query(models.Module).filter(
        models.Module.title == title,
        models.Module.discipline_id == discipline_id
    ).first()

def get_modules_by_discipline(db: Session, discipline_id: int, skip: int = 0, limit: int = 100, user_id: Optional[int] = None) -> List[models.Module]:
    query = db.query(models.Module)\
        .filter(models.Module.discipline_id == discipline_id)\
        .order_by(models.Module.order)
    
    query = query.options(selectinload(models.Module.lessons))
    
    modules = query.offset(skip).limit(limit).all()

    if user_id:
        for mod in modules:
            # Module progress
            mod.progress = crud_user_progress.get_module_progress(db, user_id, mod.id)
            for lesson_obj in mod.lessons:
                # Lesson completion status
                lesson_obj.is_completed_by_user = crud_user_progress.get_lesson_completion_status(db, user_id, lesson_obj.id)
    return modules

def get_all_modules(db: Session, skip: int = 0, limit: int = 100) -> List[models.Module]:
    # Assuming this does not need user_id specific data, or it would be handled like get_modules_by_discipline
    return db.query(models.Module).order_by(models.Module.id).offset(skip).limit(limit).all()

def create_module(db: Session, module_data: schemas.ModuleCreate) -> models.Module:
    try:
        # Проверяем существование дисциплины
        discipline = db.query(models.Discipline).filter(models.Discipline.id == module_data.discipline_id).first()
        if not discipline:
            raise NotFoundException(entity_name="Дисциплина", entity_id=module_data.discipline_id)

        # Проверка на дубликат названия модуля в рамках дисциплины
        existing_module = get_module_by_title(db, module_data.title, module_data.discipline_id)
        if existing_module:
            raise DuplicateEntryException(entity_name="Модуль", conflicting_field="title в рамках дисциплины", conflicting_value=module_data.title)

        db_module = models.Module(**module_data.model_dump())
        db.add(db_module)
        db.commit()
        db.refresh(db_module)
        return db_module
    except (NotFoundException, DuplicateEntryException):
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating module: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось создать модуль: {str(e)}")

def update_module(db: Session, module_id: int, module_update: schemas.ModuleUpdate) -> models.Module:
    try:
        db_module = db.query(models.Module).filter(models.Module.id == module_id).first()
        if not db_module:
            raise NotFoundException(entity_name="Модуль для обновления", entity_id=module_id)
        
        if module_update.discipline_id is not None:
            discipline = db.query(models.Discipline).filter(models.Discipline.id == module_update.discipline_id).first()
            if not discipline:
                raise NotFoundException(entity_name="Дисциплина для переноса модуля", entity_id=module_update.discipline_id)
                
        # Проверка на дубликат названия, если название меняется и меняется дисциплина
        if module_update.title and module_update.title != db_module.title or module_update.discipline_id and module_update.discipline_id != db_module.discipline_id:
            target_discipline_id = module_update.discipline_id if module_update.discipline_id is not None else db_module.discipline_id
            existing = get_module_by_title(db, module_update.title or db_module.title, target_discipline_id)
            if existing and existing.id != module_id:
                raise DuplicateEntryException(entity_name="Модуль", conflicting_field="title в рамках дисциплины", conflicting_value=module_update.title or db_module.title)

        updated_module = update_db_object(db_module, module_update)
        db.add(updated_module)
        db.commit()
        db.refresh(updated_module)
        return updated_module
    except (NotFoundException, DuplicateEntryException):
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating module {module_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось обновить модуль: {str(e)}")

def delete_module(db: Session, module_id: int) -> bool:
    try:
        db_module = db.query(models.Module).filter(models.Module.id == module_id).first()
        if not db_module:
            raise NotFoundException(entity_name="Модуль для удаления", entity_id=module_id)
        db.delete(db_module)
        db.commit()
        return True
    except NotFoundException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting module {module_id}: {e}", exc_info=True)
        raise DatabaseOperationException(f"Не удалось удалить модуль: {str(e)}") 