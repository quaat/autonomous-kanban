import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.errors import ApiError, install_error_handlers

ROOT = Path(__file__).resolve().parents[2]


def assert_error_body(response, expected_code):
    body = response.json()
    assert set(body) == {"code", "message"}
    assert body["code"] == expected_code
    assert isinstance(body["message"], str)
    assert body["message"]


def test_api_error_string_value():
    assert str(ApiError(404, "TASK_NOT_FOUND", "Task not found")) == "Task not found"


def test_unknown_route_unsupported_method_invalid_json_and_error_shape(client):
    not_found = client.get("/missing")
    assert not_found.status_code == 404
    assert_error_body(not_found, "ROUTE_NOT_FOUND")

    method = client.put("/api/tasks")
    assert method.status_code == 405
    assert_error_body(method, "METHOD_NOT_ALLOWED")

    invalid = client.post("/api/tasks", content="{", headers={"Content-Type": "application/json"})
    assert invalid.status_code == 400
    assert_error_body(invalid, "INVALID_REQUEST")


def test_unhandled_error_returns_safe_500_body():
    app = FastAPI()
    install_error_handlers(app)

    @app.get("/boom")
    def boom():
        raise RuntimeError("secret stack trace detail")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/boom")
    assert response.status_code == 500
    assert response.json() == {"code": "INTERNAL_SERVER_ERROR", "message": "Internal server error"}
    assert "secret stack trace detail" not in response.text
    assert "Traceback" not in response.text


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


def test_frontend_http_client_contract_read_and_workflow_shapes(client):
    tasks = client.get("/api/tasks").json()
    events = client.get("/api/activity-events").json()
    nodes = client.get("/api/workflow/nodes").json()
    edges = client.get("/api/workflow/edges").json()
    validation = client.post("/api/workflow/validate").json()
    simulation = client.post("/api/workflow/simulate").json()
    publish = client.post("/api/workflow/publish").json()

    assert {"id", "title", "status", "priority", "labels"}.issubset(tasks[0])
    assert {"id", "time", "type", "message"}.issubset(events[0])
    assert {"id", "type", "label", "position"}.issubset(nodes[0])
    assert {"x", "y"}.issubset(nodes[0]["position"])
    assert {"id", "source", "target"}.issubset(edges[0])
    assert set(validation) == {"success", "errors"}
    assert set(simulation) == {"success", "log"}
    assert simulation["log"]
    assert set(publish) == {"success", "version"}
