def assert_error_body(response, expected_code=None):
    body = response.json()
    assert set(body) == {"code", "message"}
    if expected_code is not None:
        assert body["code"] == expected_code
    assert isinstance(body["message"], str)
    assert body["message"]


def test_get_workflow_nodes_and_edges(client):
    nodes = client.get("/api/workflow/nodes")
    edges = client.get("/api/workflow/edges")
    assert nodes.status_code == 200
    assert edges.status_code == 200
    assert nodes.json()[0]["id"] == "start-node"
    assert edges.json()[0]["id"] == "e1"


def test_patch_workflow_node_position(client):
    response = client.patch("/api/workflow/nodes/start-node", json={"position": {"x": 1, "y": 2}})
    assert response.status_code == 200
    assert response.json()["position"] == {"x": 1.0, "y": 2.0}


def test_patch_workflow_node_merges_config_and_preserves_id(client):
    response = client.patch("/api/workflow/nodes/analyze-node", json={"id": "wrong", "config": {"timeout": "10 m", "newKey": True}})
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "analyze-node"
    assert body["config"]["reviewer"] == "Gemini 1.5 Pro"
    assert body["config"]["timeout"] == "10 m"
    assert body["config"]["newKey"] is True


def test_patch_workflow_node_missing_and_invalid_position(client):
    missing = client.patch("/api/workflow/nodes/missing", json={"label": "x"})
    invalid_position = client.patch("/api/workflow/nodes/start-node", json={"position": {"x": "bad", "y": 2}})
    assert missing.status_code == 404
    assert_error_body(missing, "WORKFLOW_NODE_NOT_FOUND")
    assert invalid_position.status_code == 400
    assert_error_body(invalid_position, "INVALID_REQUEST")


def test_patch_workflow_node_rejects_type_changes(client):
    response = client.patch("/api/workflow/nodes/start-node", json={"type": "end"})
    assert response.status_code == 400
    assert_error_body(response, "INVALID_REQUEST")


def test_validate_simulate_publish(client):
    validate = client.post("/api/workflow/validate")
    simulate = client.post("/api/workflow/simulate")
    publish = client.post("/api/workflow/publish")
    assert validate.status_code == 200
    assert validate.json() == {"success": True, "errors": []}
    assert simulate.status_code == 200
    assert simulate.json()["log"]
    assert publish.status_code == 200
    assert publish.json()["version"].startswith("v1.")
