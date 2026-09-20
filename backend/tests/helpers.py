from fastapi.testclient import TestClient


def create_party(client: TestClient, **overrides: object) -> dict:
    body = {
        "name": "Alvarez",
        "partySize": 4,
        "phone": "555-0142",
        "notes": "Prefers a booth",
        "source": "walk-in",
        "estimatedWaitMinutes": 20,
        **overrides,
    }
    response = client.post("/api/parties", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def create_table(client: TestClient, **overrides: object) -> dict:
    body = {"label": "T1", "seats": 4, **overrides}
    response = client.post("/api/tables", json=body)
    assert response.status_code == 201, response.text
    return response.json()
