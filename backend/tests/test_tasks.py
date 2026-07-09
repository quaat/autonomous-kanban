def assert_error_body(response, expected_code=None):
    body = response.json()
    assert set(body) == {"code", "message"}
    if expected_code is not None:
        assert body["code"] == expected_code
    assert isinstance(body["message"], str)
    assert body["message"]


def test_health_and_ready(client):
    assert client.get("/healthz").json() == {"status": "ok"}
    assert client.get("/readyz").json() == {"status": "ok", "repositoryLoaded": True}


def test_get_tasks_returns_seeded_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]["id"] == "task-1"


def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "New task", "status": "to_do"})
    assert response.status_code == 201
    body = response.json()
    assert body["id"] == "task-1001"
    assert body["priority"] == "medium"
    assert body["labels"] == []


def test_create_task_validation_errors_include_error_contract(client):
    missing_title = client.post("/api/tasks", json={"status": "to_do"})
    invalid_status = client.post("/api/tasks", json={"title": "Bad", "status": "invalid"})
    assert missing_title.status_code == 400
    assert_error_body(missing_title, "INVALID_REQUEST")
    assert invalid_status.status_code == 400
    assert_error_body(invalid_status, "INVALID_REQUEST")


def test_patch_task_updates_and_preserves_path_id(client):
    response = client.patch("/api/tasks/task-1", json={"id": "wrong", "title": "Updated", "labels": ["x"]})
    assert response.status_code == 200
    assert response.json()["id"] == "task-1"
    assert response.json()["title"] == "Updated"
    assert response.json()["labels"] == ["x"]


def test_patch_missing_task(client):
    response = client.patch("/api/tasks/missing", json={"title": "Updated"})
    assert response.status_code == 404
    assert_error_body(response, "TASK_NOT_FOUND")


def test_move_task(client):
    response = client.post("/api/tasks/task-1/move", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_move_task_invalid_status(client):
    response = client.post("/api/tasks/task-1/move", json={"status": "invalid"})
    assert response.status_code == 400
    assert_error_body(response, "INVALID_REQUEST")
