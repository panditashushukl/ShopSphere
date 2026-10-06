"""Add cart_items table

Revision ID: 002_add_cart_items
Revises: 001_initial_tables
Create Date: 2026-10-06 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002_add_cart_items'
down_revision: Union[str, Sequence[str], None] = '001_initial_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False, server_default='guest'),
        sa.Column('thread_id', sa.String(length=100), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('cart_items', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_cart_items_user_id'), ['user_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_cart_items_thread_id'), ['thread_id'], unique=False)


def downgrade() -> None:
    op.drop_table('cart_items')
