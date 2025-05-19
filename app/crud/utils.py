# app/crud/utils.py
import models
import schemas

def update_db_object(db_obj: models.Base, update_data: schemas.BaseModel) -> models.Base:
    obj_data = update_data.model_dump(exclude_unset=True)
    for key, value in obj_data.items():
        setattr(db_obj, key, value)
    return db_obj 