from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..seed import load_seed_data
from .models import ActivityEventRecord, PublishStateRecord, TaskRecord, WorkflowEdgeRecord, WorkflowNodeRecord


def seed_empty_database(session: Session) -> None:
    has_rows = any(
        session.scalar(select(model).limit(1)) is not None
        for model in (TaskRecord, ActivityEventRecord, WorkflowNodeRecord, WorkflowEdgeRecord, PublishStateRecord)
    )
    if has_rows:
        return

    seed = load_seed_data()
    session.add_all(TaskRecord(id=item["id"], title=item["title"], status=item["status"], priority=item["priority"], order_index=index, data=item) for index, item in enumerate(seed["tasks"]))
    session.add_all(ActivityEventRecord(id=item["id"], time=item["time"], type=item["type"], message=item["message"], order_index=index, data=item) for index, item in enumerate(seed["activity_events"]))
    session.add_all(WorkflowNodeRecord(id=item["id"], type=item["type"], label=item["label"], order_index=index, data=item) for index, item in enumerate(seed["workflow_nodes"]))
    session.add_all(WorkflowEdgeRecord(id=item["id"], source=item["source"], target=item["target"], order_index=index, data=item) for index, item in enumerate(seed["workflow_edges"]))
    session.add(PublishStateRecord(id=1, sequence=1, current_version=None))
    session.commit()
