def test_get_activity_events_returns_seeded_events(client):
    response = client.get("/api/activity-events")
    assert response.status_code == 200
    assert response.json()[0]["id"] == "evt-1"


def test_create_activity_event(client):
    response = client.post("/api/activity-events", json={"time": "now", "type": "info", "message": "Created"})
    assert response.status_code == 201
    assert response.json()["id"] == "evt-1001"
    assert client.get("/api/activity-events").json()[0]["id"] == "evt-1001"


def test_create_activity_event_validation_errors(client):
    assert client.post("/api/activity-events", json={"time": "now", "type": "info"}).status_code == 400
    assert client.post("/api/activity-events", json={"time": "now", "type": "bad", "message": "x"}).status_code == 400


def test_create_activity_event_duplicate_id_returns_controlled_error(client):
    response = client.post(
        "/api/activity-events",
        json={"id": "evt-1", "time": "now", "type": "info", "message": "Duplicate"},
    )
    assert response.status_code == 409
    body = response.json()
    assert body == {"code": "ACTIVITY_EVENT_ALREADY_EXISTS", "message": "Activity event already exists"}
