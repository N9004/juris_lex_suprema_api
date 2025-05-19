"""add performance indexes

Revision ID: add_performance_indexes
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Индексы для таблицы User
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_user_xp_points', 'user', ['xp_points'])
    
    # Индексы для таблицы UserLessonProgress
    op.create_index('ix_user_lesson_progress_user_id', 'user_lesson_progress', ['user_id'])
    op.create_index('ix_user_lesson_progress_lesson_id', 'user_lesson_progress', ['lesson_id'])
    op.create_index('ix_user_lesson_progress_completed_at', 'user_lesson_progress', ['completed_at'])
    
    # Индексы для таблицы UserQuestionProgress
    op.create_index('ix_user_question_progress_user_id', 'user_question_progress', ['user_id'])
    op.create_index('ix_user_question_progress_question_id', 'user_question_progress', ['question_id'])
    op.create_index('ix_user_question_progress_answered_at', 'user_question_progress', ['answered_at'])
    
    # Индексы для таблицы Lesson
    op.create_index('ix_lesson_module_id', 'lesson', ['module_id'])
    op.create_index('ix_lesson_order', 'lesson', ['order'])
    
    # Индексы для таблицы LessonBlock
    op.create_index('ix_lesson_block_lesson_id', 'lesson_block', ['lesson_id'])
    op.create_index('ix_lesson_block_order', 'lesson_block', ['order_in_lesson'])
    
    # Индексы для таблицы Question
    op.create_index('ix_question_lesson_block_id', 'question', ['lesson_block_id'])
    op.create_index('ix_question_type', 'question', ['question_type'])
    
    # Индексы для таблицы QuestionOption
    op.create_index('ix_question_option_question_id', 'question_option', ['question_id'])
    op.create_index('ix_question_option_is_correct', 'question_option', ['is_correct'])
    
    # Индексы для таблицы Module
    op.create_index('ix_module_discipline_id', 'module', ['discipline_id'])
    op.create_index('ix_module_order', 'module', ['order'])

def downgrade():
    # Удаляем индексы в обратном порядке
    op.drop_index('ix_module_order')
    op.drop_index('ix_module_discipline_id')
    
    op.drop_index('ix_question_option_is_correct')
    op.drop_index('ix_question_option_question_id')
    
    op.drop_index('ix_question_type')
    op.drop_index('ix_question_lesson_block_id')
    
    op.drop_index('ix_lesson_block_order')
    op.drop_index('ix_lesson_block_lesson_id')
    
    op.drop_index('ix_lesson_order')
    op.drop_index('ix_lesson_module_id')
    
    op.drop_index('ix_user_question_progress_answered_at')
    op.drop_index('ix_user_question_progress_question_id')
    op.drop_index('ix_user_question_progress_user_id')
    
    op.drop_index('ix_user_lesson_progress_completed_at')
    op.drop_index('ix_user_lesson_progress_lesson_id')
    op.drop_index('ix_user_lesson_progress_user_id')
    
    op.drop_index('ix_user_xp_points')
    op.drop_index('ix_users_email') 