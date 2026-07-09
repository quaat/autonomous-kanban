from __future__ import annotations

from sqlalchemy import JSON, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TaskRecord(Base):
    __tablename__ = "tasks"
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    priority: Mapped[str] = mapped_column(String(50), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class ActivityEventRecord(Base):
    __tablename__ = "activity_events"
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    time: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class WorkflowNodeRecord(Base):
    __tablename__ = "workflow_nodes"
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    label: Mapped[str] = mapped_column(String(500), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class WorkflowEdgeRecord(Base):
    __tablename__ = "workflow_edges"
    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    source: Mapped[str] = mapped_column(String(100), ForeignKey("workflow_nodes.id"), nullable=False)
    target: Mapped[str] = mapped_column(String(100), ForeignKey("workflow_nodes.id"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    data: Mapped[dict] = mapped_column(JSON, nullable=False)


class PublishStateRecord(Base):
    __tablename__ = "publish_state"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    sequence: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    current_version: Mapped[str | None] = mapped_column(String(100), nullable=True)
