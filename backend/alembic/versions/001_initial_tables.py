"""Initial tables

Revision ID: 001_initial_tables
Revises: 
Create Date: 2026-10-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_tables'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=120), nullable=False),
        sa.Column('role', sa.Enum('SUPER_ADMIN', 'WHOLESALER', 'RETAILER', 'CUSTOMER', name='role'), nullable=False),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_email'), ['email'], unique=True)

    # products
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sku', sa.String(length=40), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=2000), nullable=False, server_default=''),
        sa.Column('stock', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('retail_price', sa.Float(), nullable=False),
        sa.Column('trade_price', sa.Float(), nullable=False),
        sa.Column('wholesale_price', sa.Float(), nullable=False),
        sa.Column('moq', sa.Integer(), nullable=False, server_default='50'),
        sa.Column('primary_image', sa.String(length=500), nullable=False, server_default='https://images.unsplash.com/photo-1505740420928-5e560c06d30e'),
        sa.Column('gallery_images', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_products_sku'), ['sku'], unique=True)
        batch_op.create_index(batch_op.f('ix_products_title'), ['title'], unique=False)

    # orders
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('order_type', sa.Enum('B2C', 'RETAILER', 'WHOLESALER', name='ordertype'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', name='orderstatus'), nullable=False),
        sa.Column('total', sa.Float(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_orders_user_id'), ['user_id'], unique=False)

    # order_items
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # agent_sessions
    op.create_table(
        'agent_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('thread_id', sa.String(length=64), nullable=False),
        sa.Column('user_id', sa.String(length=64), nullable=False, server_default='guest'),
        sa.Column('title', sa.String(length=128), nullable=False, server_default='New Chat'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('agent_sessions', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_agent_sessions_thread_id'), ['thread_id'], unique=True)
        batch_op.create_index(batch_op.f('ix_agent_sessions_user_id'), ['user_id'], unique=False)

    # agent_messages
    op.create_table(
        'agent_messages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('thread_id', sa.String(length=64), nullable=False),
        sa.Column('sender', sa.String(length=16), nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.String(length=32), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['thread_id'], ['agent_sessions.thread_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('agent_messages', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_agent_messages_thread_id'), ['thread_id'], unique=False)


def downgrade() -> None:
    op.drop_table('agent_messages')
    op.drop_table('agent_sessions')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('products')
    op.drop_table('users')
