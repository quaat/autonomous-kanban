import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_unknown_route_unsupported_method_invalid_json_and_error_shape(client):
    not_found = client.get("/missing")
    assert not_found.status_code == 404
    assert {"code", "message"}.issubset(not_found.json())

    method = client.put("/api/tasks")
    assert method.status_code == 405
    assert {"code", "message"}.issubset(method.json())

    invalid = client.post("/api/tasks", content="{", headers={"Content-Type": "application/json"})
    assert invalid.status_code == 400
    assert {"code", "message"}.issubset(invalid.json())


def test_openapi_available(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    assert response.json()["openapi"]


def test_read_endpoint_fixture_parity(client):
    cases = [
        ("/api/tasks", "tasks.json"),
        ("/api/activity-events", "activity-events.json"),
        ("/api/workflow/nodes", "workflow-nodes.json"),
        ("/api/workflow/edges", "workflow-edges.json"),
    ]
    for path, fixture_name in cases:
        expected = json.loads((ROOT / "fixtures" / fixture_name).read_text(encoding="utf-8"))
        assert client.get(path).json() == expected
