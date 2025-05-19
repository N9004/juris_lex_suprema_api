import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, 
    Enum as DBEnum, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func 

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, Enum, Float, Table
from sqlalchemy.sql import func
from datetime import datetime

from database import Base

# --- Определения Enum ---
class LessonBlockType(enum.Enum):
    THEORY = "theory"
    EXERCISE = "exercise"

class QuestionType(enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_IN_BLANK = "fill_in_blank"
    # CLASSIFY = "classify", 
    # ORDER_ITEMS = "order_items", 
    # FIND_ELEMENTS = "find_elements"


# --- Модель Пользователя ---
class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, index=True, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    
    is_email_verified = Column(Boolean, default=False, nullable=False)
    email_verification_code = Column(String, nullable=True, index=True)
    email_verification_code_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    xp_points = Column(Integer, default=0, nullable=False) 
    # study_streak_days = Column(Integer, default=0, nullable=False)
    # level = Column(Integer, default=1, nullable=False)
    # bio = Column(Text, nullable=True)
    # avatar_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    # Отношение к прогрессу по урокам
    lesson_progress = relationship(
        "UserLessonProgress", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    
    # Отношение к прогрессу по вопросам
    question_progress = relationship(
        "UserQuestionProgress",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    # TODO: UserAchievement, Friends

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', verified={self.is_email_verified}, xp={self.xp_points})>"


# --- Модели Учебного Контента ---

class Discipline(Base):
    __tablename__ = "disciplines"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    modules = relationship("Module", back_populates="discipline", cascade="all, delete-orphan", order_by="Module.order")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self):
        return f"<Discipline(id={self.id}, title='{self.title}')>"


class Module(Base):
    __tablename__ = "modules"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0, nullable=False)

    discipline_id = Column(Integer, ForeignKey("disciplines.id"), nullable=False)
    discipline = relationship("Discipline", back_populates="modules")
    
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self):
        return f"<Module(id={self.id}, title='{self.title}')>"


class Lesson(Base):
    __tablename__ = "lessons"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    order = Column(Integer, default=0, nullable=False)

    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    module = relationship("Module", back_populates="lessons")

    blocks = relationship(
        "LessonBlock", 
        back_populates="lesson", 
        cascade="all, delete-orphan",
        order_by="LessonBlock.order_in_lesson"
    )
    
    # Отношение к прогрессу пользователей по этому уроку
    user_progress = relationship(
        "UserLessonProgress", 
        back_populates="lesson", 
        cascade="all, delete-orphan"
    )


    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    def __repr__(self):
        return f"<Lesson(id={self.id}, title='{self.title}')>"


class LessonBlock(Base):
    __tablename__ = "lesson_blocks"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    order_in_lesson = Column(Integer, nullable=False, default=0)
    block_type = Column(DBEnum(LessonBlockType), nullable=False)

    theory_text = Column(Text, nullable=True)
    questions = relationship("Question", back_populates="lesson_block", cascade="all, delete-orphan")

    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    lesson = relationship("Lesson", back_populates="blocks")

    def __repr__(self):
        return f"<LessonBlock(id={self.id}, type='{self.block_type.value}', order={self.order_in_lesson})>"


class Question(Base):
    __tablename__ = "questions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    question_type = Column(DBEnum(QuestionType), nullable=False)
    correct_answer_text = Column(String, nullable=True) 
    general_explanation = Column(Text, nullable=True) 

    lesson_block_id = Column(Integer, ForeignKey("lesson_blocks.id"), nullable=False)
    lesson_block = relationship("LessonBlock", back_populates="questions")

    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.id")

    def __repr__(self):
        return f"<Question(id={self.id}, type='{self.question_type.value}', text='{self.text[:30]}')>"


class QuestionOption(Base):
    __tablename__ = "question_options"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    question = relationship("Question", back_populates="options")

    def __repr__(self):
        return f"<QuestionOption(id={self.id}, text='{self.text[:20]}', correct={self.is_correct})>"


# --- Новая Модель для Прогресса Пользователя по Урокам ---
class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"
    __table_args__ = (
        UniqueConstraint('user_id', 'lesson_id', name='_user_lesson_uc'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    
    completed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    attempts = Column(Integer, default=1, nullable=False)  # Количество попыток прохождения урока
    
    # Отношения для удобного доступа
    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="user_progress")

    def __repr__(self):
        return f"<UserLessonProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, attempts={self.attempts})>"

# --- Модель для Прогресса Пользователя по Вопросам ---
class UserQuestionProgress(Base):
    __tablename__ = "user_question_progress"
    __table_args__ = (
        UniqueConstraint('user_id', 'question_id', name='_user_question_uc'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    is_correct = Column(Boolean, default=False, nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Отношения для удобного доступа
    user = relationship("User", back_populates="question_progress")
    question = relationship("Question")

    def __repr__(self):
        return f"<UserQuestionProgress(user_id={self.user_id}, question_id={self.question_id}, is_correct={self.is_correct})>"