"""add user question progress

Revision ID: add_user_question_progress
Revises: add_performance_indexes
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_user_question_progress'
down_revision = 'add_performance_indexes'
branch_labels = None
depends_on = None

def upgrade():
    # Создаем таблицу user_question_progress
    op.create_table(
        'user_question_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('answered_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['question_id'], ['questions.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'question_id', name='_user_question_uc')
    )
    
    # Создаем индексы для оптимизации запросов
    op.create_index(op.f('ix_user_question_progress_id'), 'user_question_progress', ['id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_user_id'), 'user_question_progress', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_question_id'), 'user_question_progress', ['question_id'], unique=False)
    op.create_index(op.f('ix_user_question_progress_answered_at'), 'user_question_progress', ['answered_at'], unique=False)

def downgrade():
    # Удаляем индексы
    op.drop_index(op.f('ix_user_question_progress_answered_at'), table_name='user_question_progress')
    op.drop_index(op.f('ix_user_question_progress_question_id'), table_name='user_question_progress')
    op.drop_index(op.f('ix_user_question_progress_user_id'), table_name='user_question_progress')
    op.drop_index(op.f('ix_user_question_progress_id'), table_name='user_question_progress')
    
    # Удаляем таблицу
    op.drop_table('user_question_progress') 