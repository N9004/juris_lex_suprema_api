"""add performance indexes

Revision ID: add_performance_indexes
Revises: 02b144fbc56d
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_performance_indexes'
down_revision = '02b144fbc56d'
branch_labels = None
depends_on = None

def upgrade():
    # Индексы для таблицы User
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_user_xp_points', 'users', ['xp_points'])
    
    # Индексы для таблицы UserLessonProgress
    op.create_index('ix_user_lesson_progress_user_id', 'user_lesson_progress', ['user_id'])
    op.create_index('ix_user_lesson_progress_lesson_id', 'user_lesson_progress', ['lesson_id'])
    op.create_index('ix_user_lesson_progress_completed_at', 'user_lesson_progress', ['completed_at'])
    
    # Индексы для таблицы UserQuestionProgress
    op.create_index('ix_user_question_progress_user_id', 'user_question_progress', ['user_id'])
    op.create_index('ix_user_question_progress_question_id', 'user_question_progress', ['question_id'])
    op.create_index('ix_user_question_progress_answered_at', 'user_question_progress', ['answered_at'])
    
    # Индексы для таблицы Lesson
    op.create_index('ix_lesson_module_id', 'lessons', ['module_id'])
    op.create_index('ix_lesson_order', 'lessons', ['order'])
    
    # Индексы для таблицы LessonBlock
    op.create_index('ix_lesson_block_lesson_id', 'lesson_blocks', ['lesson_id'])
    op.create_index('ix_lesson_block_order', 'lesson_blocks', ['order_in_lesson'])
    
    # Индексы для таблицы Question
    op.create_index('ix_question_lesson_block_id', 'questions', ['lesson_block_id'])
    op.create_index('ix_question_type', 'questions', ['question_type'])
    
    # Индексы для таблицы QuestionOption
    op.create_index('ix_question_option_question_id', 'question_options', ['question_id'])
    op.create_index('ix_question_option_is_correct', 'question_options', ['is_correct'])
    
    # Индексы для таблицы Module
    op.create_index('ix_module_discipline_id', 'modules', ['discipline_id'])
    op.create_index('ix_module_order', 'modules', ['order'])

def downgrade():
    # Удаляем индексы в обратном порядке
    op.drop_index('ix_module_order', table_name='modules')
    op.drop_index('ix_module_discipline_id', table_name='modules')
    
    op.drop_index('ix_question_option_is_correct', table_name='question_options')
    op.drop_index('ix_question_option_question_id', table_name='question_options')
    
    op.drop_index('ix_question_type', table_name='questions')
    op.drop_index('ix_question_lesson_block_id', table_name='questions')
    
    op.drop_index('ix_lesson_block_order', table_name='lesson_blocks')
    op.drop_index('ix_lesson_block_lesson_id', table_name='lesson_blocks')
    
    op.drop_index('ix_lesson_order', table_name='lessons')
    op.drop_index('ix_lesson_module_id', table_name='lessons')
    
    op.drop_index('ix_user_question_progress_answered_at', table_name='user_question_progress')
    op.drop_index('ix_user_question_progress_question_id', table_name='user_question_progress')
    op.drop_index('ix_user_question_progress_user_id', table_name='user_question_progress')
    
    op.drop_index('ix_user_lesson_progress_completed_at', table_name='user_lesson_progress')
    op.drop_index('ix_user_lesson_progress_lesson_id', table_name='user_lesson_progress')
    op.drop_index('ix_user_lesson_progress_user_id', table_name='user_lesson_progress')
    
    op.drop_index('ix_user_xp_points', table_name='users')
    op.drop_index('ix_users_email', table_name='users') 