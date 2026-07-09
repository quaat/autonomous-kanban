from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT_DIR = Path(__file__).resolve().parents[2]
FIXTURES_DIR = ROOT_DIR / "fixtures"


def _read_fixture(name: str) -> list[dict[str, Any]]:
    with (FIXTURES_DIR / name).open(encoding="utf-8") as fixture:
        return json.load(fixture)


def load_seed_data() -> dict[str, list[dict[str, Any]]]:
    return {
        "tasks": deepcopy(_read_fixture("tasks.json")),
        "activity_events": deepcopy(_read_fixture("activity-events.json")),
        "workflow_nodes": deepcopy(_read_fixture("workflow-nodes.json")),
        "workflow_edges": deepcopy(_read_fixture("workflow-edges.json")),
    }
