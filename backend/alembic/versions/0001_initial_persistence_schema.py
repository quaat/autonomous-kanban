"""initial persistence schema

Revision ID: 0001
Revises:
Create Date: 2026-07-09
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tasks",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("status", sa.String(length=100), nullable=False),
        sa.Column("priority", sa.String(length=50), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tasks_status"), "tasks", ["status"], unique=False)
    op.create_table(
        "activity_events",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("time", sa.String(length=100), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "workflow_nodes",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("type", sa.String(length=100), nullable=False),
        sa.Column("label", sa.String(length=500), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "workflow_edges",
        sa.Column("id", sa.String(length=100), nullable=False),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("target", sa.String(length=100), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(["source"], ["workflow_nodes.id"]),
        sa.ForeignKeyConstraint(["target"], ["workflow_nodes.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "publish_state",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("current_version", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("publish_state")
    op.drop_table("workflow_edges")
    op.drop_table("workflow_nodes")
    op.drop_table("activity_events")
    op.drop_index(op.f("ix_tasks_status"), table_name="tasks")
    op.drop_table("tasks")
