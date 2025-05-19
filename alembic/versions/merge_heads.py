"""merge heads

Revision ID: merge_heads
Revises: 02b144fbc56d, add_user_question_progress
Create Date: 2024-03-19 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'merge_heads'
down_revision = ('02b144fbc56d', 'add_user_question_progress')
branch_labels = None
depends_on = None

def upgrade():
    pass

def downgrade():
    pass 