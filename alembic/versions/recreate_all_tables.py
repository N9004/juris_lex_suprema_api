"""recreate all tables

Revision ID: recreate_all_tables
Revises: merge_heads
Create Date: 2024-03-19 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'recreate_all_tables'
down_revision = 'merge_heads'
branch_labels = None
depends_on = None

def upgrade():
    # Создаем все таблицы заново
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_email_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('email_verification_code', sa.String(), nullable=True),
        sa.Column('email_verification_code_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('xp_points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_full_name'), 'users', ['full_name'], unique=False)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    op.create_table(
        'disciplines',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_disciplines_id'), 'disciplines', ['id'], unique=False)
    op.create_index(op.f('ix_disciplines_title'), 'disciplines', ['title'], unique=True)

    op.create_table(
        'modules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('discipline_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['discipline_id'], ['disciplines.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_modules_id'), 'modules', ['id'], unique=False)
    op.create_index(op.f('ix_modules_title'), 'modules', ['title'], unique=False)

    op.create_table(
        'lessons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('module_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lessons_id'), 'lessons', ['id'], unique=False)
    op.create_index(op.f('ix_lessons_title'), 'lessons', ['title'], unique=False)

    op.create_table(
        'lesson_blocks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_in_lesson', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('block_type', sa.Enum('theory', 'exercise', name='lessonblocktype'), nullable=False),
        sa.Column('theory_text', sa.Text(), nullable=True),
        sa.Column('lesson_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lesson_blocks_id'), 'lesson_blocks', ['id'], unique=False)

    op.create_table(
        'questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('question_type', sa.Enum('single_choice', 'multiple_choice', 'true_false', 'fill_in_blank', name='questiontype'), nullable=False),
        sa.Column('correct_answer_text', sa.String(), nullable=True),
        sa.Column('general_explanation', sa.Text(), nullable=True),
        sa.Column('lesson_block_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['lesson_block_id'], ['lesson_blocks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)

    op.create_table(
        'question_options',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', sa.String(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_options_id'), 'question_options', ['id'], unique=False)

    op.create_table(
        'user_lesson_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('attempts', sa.Integer(), nullable=False, server_default='1'),
        sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'lesson_id', name='_user_lesson_uc')
    )
    op.create_index(op.f('ix_user_lesson_progress_id'), 'user_lesson_progress', ['id'], unique=False)

    op.create_table(
        'user_question_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('answered_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'question_id', name='_user_question_uc')
    )
    op.create_index(op.f('ix_user_question_progress_id'), 'user_question_progress', ['id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_user_id'), 'user_question_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_question_id'), 'user_question_progress', ['question_id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_answered_at'), 'user_question_progress', ['answered_at'], unique=False)

def downgrade():
    # Удаляем все таблицы в обратном порядке
    op.drop_table('user_question_progress')
    op.drop_table('user_lesson_progress')
    op.drop_table('question_options')
    op.drop_table('questions')
    op.drop_table('lesson_blocks')
    op.drop_table('lessons')
    op.drop_table('modules')
    op.drop_table('disciplines')
    op.drop_table('users') 