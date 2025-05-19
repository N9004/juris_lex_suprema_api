# schemas.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Union, Any, Dict
from datetime import datetime
import enum

from models import LessonBlockType, QuestionType

# --- Вспомогательные для CRUD вложенных сущностей ---
class IdOnly(BaseModel):
    id: int

# --- Схемы для Пользователей (User) ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel): # Для обновления профиля пользователем или админом
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    is_email_verified: Optional[bool] = None
    xp_points: Optional[int] = None
    # Пароль обновляется через отдельный эндпоинт обычно

class User(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    is_email_verified: bool
    xp_points: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- Схемы для Аутентификации (Token) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Схема для Запроса Верификации Email ---
class EmailVerificationRequest(BaseModel):
    email: EmailStr
    code: str

# --- Схемы для Учебного Контента (с детализацией для админки) ---

# --- QuestionOption ---
class QuestionOptionBase(BaseModel):
    text: str
    is_correct: bool

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionUpdate(QuestionOptionBase):
    id: Optional[int] = None

class QuestionOption(QuestionOptionBase):
    id: int
    question_id: int
    model_config = {"from_attributes": True}

# --- Question ---
class QuestionBase(BaseModel):
    text: str
    question_type: QuestionType
    general_explanation: Optional[str] = None
    correct_answer_text: Optional[str] = None

class QuestionCreate(QuestionBase):
    options: List[QuestionOptionCreate] = Field(default_factory=list)

class QuestionUpdate(QuestionBase):
    id: Optional[int] = None
    options: Optional[List[QuestionOptionUpdate]] = None

class Question(QuestionBase):
    id: int
    lesson_block_id: int
    options: List[QuestionOption] = []
    model_config = {"from_attributes": True}

# --- LessonBlock ---
class LessonBlockBase(BaseModel):
    order_in_lesson: int = Field(..., ge=0)
    block_type: LessonBlockType

class LessonBlockCreate(LessonBlockBase):
    theory_text: Optional[str] = None
    questions: Optional[List[QuestionCreate]] = Field(default_factory=list)

    @validator('theory_text', 'questions')
    def validate_block_content(cls, v, values):
        block_type = values.get('block_type')
        if block_type == LessonBlockType.THEORY:
            if v is not None and 'questions' in values and values['questions']:
                raise ValueError('Theory block cannot have questions')
        elif block_type == LessonBlockType.EXERCISE:
            if v is not None and 'theory_text' in values and values['theory_text']:
                raise ValueError('Exercise block cannot have theory text')
            if v is not None and 'questions' in values and not values['questions']:
                raise ValueError('Exercise block must have at least one question')
        return v

class LessonBlockUpdate(BaseModel):
    order_in_lesson: Optional[int] = Field(None, ge=0)
    theory_text: Optional[str] = None
    questions: Optional[List[QuestionUpdate]] = None

class LessonBlock(LessonBlockBase):
    id: int
    lesson_id: int
    theory_text: Optional[str] = None
    questions: List[Question] = []
    model_config = {"from_attributes": True}

# --- Lesson ---
class LessonBase(BaseModel):
    title: str = Field(..., min_length=1)
    order: Optional[int] = Field(0, ge=0)
    description: Optional[str] = None

class LessonCreate(LessonBase):
    module_id: int
    # При создании урока можно сразу передать его блоки
    blocks: List[LessonBlockCreate] = Field(default_factory=list)

class LessonUpdate(LessonBase):
    module_id: Optional[int] = None

class Lesson(LessonBase):
    id: int
    module_id: int
    is_completed_by_user: bool = False
    blocks: List[LessonBlock] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- Схемы для прогресса ---
class ModuleProgress(BaseModel):
    completed_lessons_count: int
    total_lessons_count: int
    progress_percent: int = 0

class DisciplineProgress(BaseModel):
    completed_modules_count: int
    total_modules_count: int 
    total_lessons_count: int
    completed_lessons_count: int
    progress_percent: int = 0

# --- Module ---
class ModuleBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    order: Optional[int] = Field(0, ge=0)

class ModuleCreate(ModuleBase):
    discipline_id: int

class ModuleUpdate(ModuleBase):
    discipline_id: Optional[int] = None

class Module(ModuleBase):
    id: int
    discipline_id: int
    progress: Optional[ModuleProgress] = None
    lessons: List[Lesson] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- Discipline ---
class DisciplineBase(BaseModel):
    title: str = Field(..., min_length=1) # Уникальность будет проверяться в CRUD
    description: Optional[str] = None

class DisciplineCreate(DisciplineBase):
    pass

class DisciplineUpdate(DisciplineBase):
    pass

class Discipline(DisciplineBase):
    id: int
    progress: Optional[DisciplineProgress] = None
    modules: List[Module] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# --- UserLessonProgress ---
class UserLessonProgressBase(BaseModel):
    lesson_id: int

class UserLessonProgressCreate(UserLessonProgressBase):
    pass

class UserLessonProgress(UserLessonProgressBase):
    id: int
    user_id: int
    completed_at: datetime
    attempts: int
    model_config = {"from_attributes": True}

# --- Схемы для ответов на вопросы ---
class QuestionAnswerSubmit(BaseModel):
    question_id: int
    user_answer: Any  # Может быть int, List[int], str или bool в зависимости от типа вопроса

class QuestionAnswerResponse(BaseModel):
    is_correct: bool
    explanation: Optional[str] = None
    correct_answer_details: Dict[str, Any]
    xp_awarded: int

# --- Схемы для прогресса пользователя (ответы API) ---
class UserLessonProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed_at: datetime
    attempts: int
    xp_earned_for_this_completion: int
    current_total_user_xp: int
    model_config = {"from_attributes": True}