# main.py
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import logging
from core.logging_config import setup_logging, logger

from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import jwt
from pydantic import BaseModel
from sqlalchemy.sql import select, func

from database import SessionLocal, engine
import models
import schemas
from app.crud import crud_users
from app.crud import crud_disciplines
from app.crud import crud_modules
from app.crud import crud_lessons
from app.crud import crud_lesson_blocks
from app.crud import crud_questions
from app.crud import crud_user_progress
import security

models.Base.metadata.create_all(bind=engine)

# Настройка логирования (можно передать 'production' для продакшена)
setup_logging(env="development")

# --- Зависимости ---
def get_db(): db = SessionLocal(); yield db; db.close()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    email = security.decode_access_token(token)
    if not email: raise credentials_exception
    user = crud_users.get_user_by_email(db, email=email)
    if user is None: raise credentials_exception
    return user
async def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if not current_user.is_active: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user
async def get_current_superuser(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if not current_user.is_superuser: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges")
    return current_user

# --- Инициализация FastAPI приложения ---
app = FastAPI(
    title="Lexico API", version="0.0.1",
    openapi_tags=[
        {"name": "Authentication", "description": "Аутентификация пользователей"},
        {"name": "Users", "description": "Операции с пользователями и верификация Email"},
        {"name": "Content (Public)", "description": "Доступ к учебному контенту"},
        {"name": "Content (Admin) - Disciplines", "description": "Администрирование: Дисциплины"},
        {"name": "Content (Admin) - Modules", "description": "Администрирование: Модули"},
        {"name": "Content (Admin) - Lessons", "description": "Администрирование: Уроки"},
        {"name": "Content (Admin) - Lesson Blocks", "description": "Администрирование: Блоки Урока"},
        {"name": "Content (Admin) - Questions", "description": "Администрирование: Вопросы"},
        {"name": "Content (Admin) - Question Options", "description": "Администрирование: Опции Вопросов"},
        {"name": "User Progress", "description": "Отслеживание прогресса пользователя"},
        {"name": "Default", "description": "Служебные эндпоинты"}
    ]
)
# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- Эндпоинты Аутентификации и Пользователей ---
@app.post("/token", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token_endpoint(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud_users.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password): raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_email_verified: raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify your email first.")
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES); access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}
@app.post("/users/", response_model=schemas.User, tags=["Users"], summary="Register new user")
def register_new_user_endpoint(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud_users.get_user_by_email(db, email=user_data.email): raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    return crud_users.create_user(db=db, user=user_data)
@app.post("/users/verify-email/", tags=["Users"], summary="Verify user's email address")
async def verify_user_email_endpoint(verification_data: schemas.EmailVerificationRequest, db: Session = Depends(get_db)):
    user = crud_users.get_user_by_email(db, email=verification_data.email)
    if not user: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
    if user.is_email_verified: raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email is already verified.")
    if user.email_verification_code != verification_data.code: raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid verification code.")
    expires_at = user.email_verification_code_expires_at;
    if expires_at and expires_at.tzinfo is None: expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at is None or expires_at < datetime.now(timezone.utc): raise HTTPException(status.HTTP_400_BAD_REQUEST, "Verification code expired.")
    verified_user = crud_users.verify_email(db, email=verification_data.email, verification_code=verification_data.code)
    if not verified_user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email verification failed. Invalid or expired code.")
    return {"message": "Email verified successfully."}
@app.get("/users/me/", response_model=schemas.User, tags=["Users"], summary="Get current authenticated user")
async def read_current_user_me_endpoint(current_user: models.User = Depends(get_current_active_user)): return current_user
@app.get("/users/", response_model=List[schemas.User], tags=["Users"], summary="Read users list (admin only)")
def read_users_list_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: models.User = Depends(get_current_superuser)): return crud_users.get_users(db, skip, limit)
@app.get("/users/{user_id}", response_model=schemas.User, tags=["Users"], summary="Read a single user by ID (admin or self)")
def read_single_user_endpoint(user_id: int, db: Session = Depends(get_db), current_user_for_check: models.User = Depends(get_current_active_user)):
    if not current_user_for_check.is_superuser and current_user_for_check.id != user_id: raise HTTPException(status.HTTP_403_FORBIDDEN, "Not enough permissions")
    db_user = crud_users.get_user(db, user_id);
    if not db_user: raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found"); return db_user

# --- Эндпоинты Учебного Контента (Публичное Чтение - GET) ---
TAG_CONTENT_PUBLIC = "Content (Public)"
@app.get("/disciplines/", response_model=List[schemas.Discipline], tags=[TAG_CONTENT_PUBLIC])
def public_read_disciplines(s: int = 0, l: int = 10, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    user_id = current_user.id if current_user else None
    return crud_disciplines.get_disciplines(db, s, l, user_id)
@app.get("/disciplines/{d_id}", response_model=schemas.Discipline, tags=[TAG_CONTENT_PUBLIC])
def public_read_discipline(d_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    user_id = current_user.id if current_user else None
    discipline = crud_disciplines.get_discipline(db, d_id, user_id)
    if not discipline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Discipline not found")
    return discipline
@app.get("/disciplines/{d_id}/modules/", response_model=List[schemas.Module], tags=[TAG_CONTENT_PUBLIC])
def public_read_modules_for_discipline(d_id: int, s: int = 0, l: int = 10, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    if not crud_disciplines.get_discipline(db, d_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discipline not found")
    user_id_for_call = current_user.id if current_user else None
    return crud_modules.get_modules_by_discipline(db, d_id, s, l, user_id=user_id_for_call)
@app.get("/modules/{m_id}", response_model=schemas.Module, tags=[TAG_CONTENT_PUBLIC])
def public_read_module(m_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    user_id = current_user.id if current_user else None
    module = crud_modules.get_module(db, m_id, user_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module
@app.get("/modules/{m_id}/lessons/", response_model=List[schemas.Lesson], tags=[TAG_CONTENT_PUBLIC])
def public_read_lessons_for_module(m_id: int, s: int = 0, l: int = 10, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    if not crud_modules.get_module(db,m_id): raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found"); return crud_lessons.get_lessons_by_module(db,m_id,user_id=current_user.id, skip=s,limit=l)
@app.get("/lessons/{l_id}", response_model=schemas.Lesson, tags=[TAG_CONTENT_PUBLIC])
def public_read_lesson(l_id: int, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(get_current_active_user)):
    user_id = current_user.id if current_user else None
    o = crud_lessons.get_lesson(db, l_id, user_id)
    if not o:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    return o

# === АДМИНИСТРАТИВНЫЕ CRUD ЭНДПОИНТЫ ДЛЯ КОНТЕНТА ===
# --- Disciplines (Admin) ---
TAG_DISCIPLINE_ADMIN = "Content (Admin) - Disciplines"
@app.post("/admin/disciplines/",response_model=schemas.Discipline,status_code=status.HTTP_201_CREATED,tags=[TAG_DISCIPLINE_ADMIN])
async def ad_create_d(d:schemas.DisciplineCreate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    logger.debug("Attempting to create discipline with title: %s", d.title)
    if crud_disciplines.get_discipline_by_title(db, title=d.title):
        logger.debug("Discipline with title '%s' already exists", d.title)
        raise HTTPException(status.HTTP_400_BAD_REQUEST,"Title already exists")
    created_discipline = crud_disciplines.create_discipline(db, d)
    logger.debug("crud_disciplines.create_discipline returned: %s", created_discipline)
    if created_discipline is None:
        logger.error("crud_disciplines.create_discipline returned None!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create discipline object")
    return created_discipline
@app.get("/admin/disciplines/",response_model=List[schemas.Discipline],tags=[TAG_DISCIPLINE_ADMIN])
async def ad_read_ds(s:int=0,l:int=100,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):return crud_disciplines.get_disciplines(db,s,l)
@app.get("/admin/disciplines/{d_id}",response_model=schemas.Discipline,tags=[TAG_DISCIPLINE_ADMIN])
async def ad_read_d(d_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_disciplines.get_discipline(db,d_id)
    if not o:
        logger.warning("Discipline with id %s not found", d_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discipline not found")
    return o
@app.put("/admin/disciplines/{d_id}",response_model=schemas.Discipline,tags=[TAG_DISCIPLINE_ADMIN])
async def ad_update_d(d_id:int,d_upd:schemas.DisciplineUpdate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_disciplines.update_discipline(db,d_id,d_upd)
    if not o:
        logger.warning("Discipline with id %s not found for update", d_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Discipline not found")
    return o
@app.delete("/admin/disciplines/{d_id}",status_code=status.HTTP_204_NO_CONTENT,tags=[TAG_DISCIPLINE_ADMIN])
async def ad_delete_d(d_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if not crud_disciplines.delete_discipline(db,d_id):
        logger.warning("Discipline with id %s not found for delete", d_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Discipline not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Modules (Admin) ---
TAG_MODULE_ADMIN = "Content (Admin) - Modules"
@app.post("/admin/modules/",response_model=schemas.Module,status_code=status.HTTP_201_CREATED,tags=[TAG_MODULE_ADMIN])
async def ad_create_m(m:schemas.ModuleCreate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    logger.debug("main.ad_create_m: Received module data: %s", m.model_dump())
    if not crud_disciplines.get_discipline(db,m.discipline_id):
        logger.warning("main.ad_create_m: Discipline with ID %s not found.", m.discipline_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,f"Discipline {m.discipline_id} not found")
    created_module = crud_modules.create_module(db,m)
    logger.debug("main.ad_create_m: crud_modules.create_module returned: %s", created_module)
    if created_module is None:
        logger.error("main.ad_create_m: crud_modules.create_module returned None!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create module object")
    return created_module
@app.get("/admin/modules/",response_model=List[schemas.Module],tags=[TAG_MODULE_ADMIN])
async def ad_read_ms(s:int=0,l:int=100,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):return crud_modules.get_all_modules(db,s,l)
@app.get("/admin/modules/{m_id}",response_model=schemas.Module,tags=[TAG_MODULE_ADMIN])
async def ad_read_m(m_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_modules.get_module(db,m_id)
    if not o:
        logger.warning("Module with id %s not found", m_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
    return o
@app.put("/admin/modules/{m_id}",response_model=schemas.Module,tags=[TAG_MODULE_ADMIN])
async def ad_update_m(m_id:int,m_upd:schemas.ModuleUpdate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if m_upd.discipline_id and not crud_disciplines.get_discipline(db,m_upd.discipline_id):
        logger.warning("Target discipline %s not found for module update", m_upd.discipline_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,f"Target Discipline {m_upd.discipline_id} not found")
    o=crud_modules.update_module(db,m_id,m_upd)
    if not o:
        logger.warning("Module with id %s not found for update", m_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found")
    return o
@app.delete("/admin/modules/{m_id}",status_code=status.HTTP_204_NO_CONTENT,tags=[TAG_MODULE_ADMIN])
async def ad_delete_m(m_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if not crud_modules.delete_module(db,m_id):
        logger.warning("Module with id %s not found for delete", m_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Module not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# --- Lessons (Admin) ---
TAG_LESSON_ADMIN = "Content (Admin) - Lessons"
@app.post("/admin/lessons/", response_model=schemas.Lesson, status_code=status.HTTP_201_CREATED, tags=[TAG_LESSON_ADMIN])
async def ad_create_l(l_data: schemas.LessonCreate, db: Session = Depends(get_db), su: models.User = Depends(get_current_superuser)):
    logger.debug("main.ad_create_l: Received lesson data: %s", l_data.model_dump_json(indent=2))
    if not crud_modules.get_module(db, l_data.module_id):
        logger.warning("main.ad_create_l: Module with ID %s not found.", l_data.module_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Module {l_data.module_id} not found")
    created_lesson = crud_lessons.create_lesson(db, l_data)
    logger.debug("main.ad_create_l: crud_lessons.create_lesson returned: %s", type(created_lesson))
    if created_lesson is None:
        logger.error("main.ad_create_l: crud_lessons.create_lesson returned None!")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create lesson object in CRUD")
    return created_lesson
@app.get("/admin/lessons/",response_model=List[schemas.Lesson],tags=[TAG_LESSON_ADMIN])
async def ad_read_ls(m_id:Optional[int]=None,s:int=0,l:int=100,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if m_id:
        if not crud_modules.get_module(db, m_id):
             raise HTTPException(status.HTTP_404_NOT_FOUND, f"Module {m_id} not found")
        return crud_lessons.get_lessons_by_module(db, m_id,user_id=None, skip=s, limit=l)
    return crud_lessons.get_all_lessons(db, s, l)
@app.get("/admin/lessons/{l_id}",response_model=schemas.Lesson,tags=[TAG_LESSON_ADMIN])
async def ad_read_l(l_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_lessons.get_lesson(db,l_id)
    if not o:
        logger.warning("Lesson with id %s not found", l_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
    return o
@app.put("/admin/lessons/{l_id}",response_model=schemas.Lesson,tags=[TAG_LESSON_ADMIN])
async def ad_update_l(l_id:int,l_upd:schemas.LessonUpdate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if l_upd.module_id and not crud_modules.get_module(db,l_upd.module_id):
        logger.warning("Target module %s not found for lesson update", l_upd.module_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,f"Target Module {l_upd.module_id} not found")
    o=crud_lessons.update_lesson(db,l_id,l_upd)
    if not o:
        logger.warning("Lesson with id %s not found for update", l_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found")
    return o
@app.delete("/admin/lessons/{l_id}",status_code=status.HTTP_204_NO_CONTENT,tags=[TAG_LESSON_ADMIN])
async def ad_delete_l(l_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if not crud_lessons.delete_lesson(db,l_id):
        logger.warning("Lesson with id %s not found for delete", l_id)
        raise HTTPException(status.HTTP_404_NOT_FOUND,"Lesson not found")

# --- LessonBlocks (Admin) ---
TAG_BLOCK_ADMIN = "Content (Admin) - Lesson Blocks"
@app.post("/admin/lessons/{l_id}/blocks/",response_model=schemas.LessonBlock,status_code=status.HTTP_201_CREATED,tags=[TAG_BLOCK_ADMIN])
async def ad_create_lb(l_id:int,b_data:schemas.LessonBlockCreate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    try:return crud_lesson_blocks.create_lesson_block(db,l_id,b_data)
    except ValueError as e:raise HTTPException(status.HTTP_404_NOT_FOUND,str(e))
@app.get("/admin/blocks/{b_id}",response_model=schemas.LessonBlock,tags=[TAG_BLOCK_ADMIN])
async def ad_read_lb(b_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):o=crud_lesson_blocks.get_lesson_block(db,b_id);assert o;return o
@app.put("/admin/blocks/{b_id}",response_model=schemas.LessonBlock,tags=[TAG_BLOCK_ADMIN])
async def ad_update_lb(b_id:int,b_upd:schemas.LessonBlockUpdate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_lesson_blocks.update_lesson_block(db,b_id,b_upd);assert o;return o
@app.delete("/admin/blocks/{b_id}",status_code=status.HTTP_204_NO_CONTENT,tags=[TAG_BLOCK_ADMIN])
async def ad_delete_lb(b_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if not crud_lesson_blocks.delete_lesson_block(db,b_id):raise HTTPException(status.HTTP_404_NOT_FOUND,"LessonBlock not found")
    
# --- QuestionOptions (Admin) ---
TAG_OPTION_ADMIN = "Content (Admin) - Question Options"
@app.post("/admin/questions/{q_id}/options/",response_model=schemas.QuestionOption,status_code=status.HTTP_201_CREATED,tags=[TAG_OPTION_ADMIN])
async def ad_create_qo(q_id:int,opt_data:schemas.QuestionOptionCreate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    try:return crud_questions.create_question_option(db,q_id,opt_data)
    except ValueError as e:raise HTTPException(status.HTTP_404_NOT_FOUND,str(e))
@app.get("/admin/options/{opt_id}",response_model=schemas.QuestionOption,tags=[TAG_OPTION_ADMIN])
async def ad_read_qo(opt_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):o=crud_questions.get_question_option(db,opt_id);assert o;return o
@app.put("/admin/options/{opt_id}",response_model=schemas.QuestionOption,tags=[TAG_OPTION_ADMIN])
async def ad_update_qo(opt_id:int,opt_upd:schemas.QuestionOptionUpdate,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    o=crud_questions.update_question_option(db,opt_id,opt_upd);assert o;return o
@app.delete("/admin/options/{opt_id}",status_code=status.HTTP_204_NO_CONTENT,tags=[TAG_OPTION_ADMIN])
async def ad_delete_qo(opt_id:int,db:Session=Depends(get_db),su:models.User=Depends(get_current_superuser)):
    if not crud_questions.delete_question_option(db,opt_id):raise HTTPException(status.HTTP_404_NOT_FOUND,"QuestionOption not found")

# (Эндпоинты для Questions можно добавить по аналогии, если нужно управлять ими отдельно от блоков)

# --- Эндпоинты для Прогресса Пользователя ---
@app.post("/users/me/progress/lessons/{l_id}/complete", response_model=schemas.UserLessonProgressResponse, tags=["User Progress"])
async def mark_lesson_completed_for_current_user(l_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    progress_record = crud_user_progress.mark_lesson_as_completed(db=db, user_id=current_user.id, lesson_id=l_id)
    if not progress_record:
        if crud_lessons.get_lesson(db, lesson_id=l_id) is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Lesson not found.")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not mark progress.")
    return progress_record

@app.post("/lessons/questions/{question_id}/submit_answer", response_model=schemas.QuestionAnswerResponse, tags=["User Progress"])
async def submit_question_answer_endpoint(
    question_id: int,
    answer: schemas.QuestionAnswerSubmit,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        result = crud_user_progress.submit_question_answer(db, current_user.id, question_id, answer.user_answer)
        return result
    except ValueError as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e))
    
# --- Стандартные эндпоинты ---
@app.get("/", tags=["Default"])
async def read_root_endpoint(): return {"message": "Добро пожаловать в Lexico API!"}
@app.get("/healthcheck", tags=["Default"])
async def health_check_endpoint(): return {"status": "OK", "message": "API работает!"}

@app.get("/admin/statistics", response_model=dict)
async def get_admin_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_superuser)
):
    """
    Получение статистики для панели администратора
    """
    try:
        # Получаем количество активных пользователей
        active_users_count = db.query(func.count(models.User.id)).filter(models.User.is_active == True).scalar() or 0

        # Получаем общее количество уроков
        total_lessons_count = db.query(func.count(models.Lesson.id)).scalar() or 0

        # Получаем количество завершенных уроков
        completed_lessons_count = db.query(func.count(models.UserLessonProgress.id)).scalar() or 0

        # Вычисляем процент завершенных уроков
        completion_percentage = round((completed_lessons_count / total_lessons_count * 100) if total_lessons_count > 0 else 0)

        return {
            "active_users": active_users_count,
            "total_lessons": total_lessons_count,
            "completed_lessons_percentage": completion_percentage
        }
    except Exception as e:
        print(f"Error in get_admin_statistics: {str(e)}")  # Для отладки
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting statistics: {str(e)}"
        )