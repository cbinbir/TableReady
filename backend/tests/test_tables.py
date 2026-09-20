"""Tests for /api/tables, derived from openapi.yaml's Tables paths."""

from helpers import create_table

UNKNOWN_ID = "00000000-0000-0000-0000-000000000000"


class TestListTables:
    def test_empty_by_default(self, client):
        response = client.get("/api/tables")
        assert response.status_code == 200
        assert response.json() == []

    def test_returns_created_tables(self, client):
        created = create_table(client, label="T2", seats=6)
        response = client.get("/api/tables")
        assert response.status_code == 200
        labels = {t["label"] for t in response.json()}
        assert "T2" in labels
        assert created["seats"] == 6


class TestCreateTable:
    def test_defaults_to_open(self, client):
        response = client.post("/api/tables", json={"label": "Patio 1", "seats": 4})
        assert response.status_code == 201
        table = response.json()
        assert table["label"] == "Patio 1"
        assert table["seats"] == 4
        assert table["status"] == "open"
        assert isinstance(table["id"], str) and table["id"]

    def test_missing_required_field_is_400(self, client):
        response = client.post("/api/tables", json={"seats": 4})
        assert response.status_code == 400
        assert "message" in response.json()

    def test_zero_seats_is_400(self, client):
        response = client.post("/api/tables", json={"label": "T9", "seats": 0})
        assert response.status_code == 400


class TestUpdateTableStatus:
    def test_updates_status(self, client):
        table = create_table(client)
        response = client.patch(f"/api/tables/{table['id']}", json={"status": "occupied"})
        assert response.status_code == 200
        updated = response.json()
        assert updated["status"] == "occupied"
        assert updated["updatedAt"] != table["updatedAt"]
        # everything else is untouched
        assert updated["label"] == table["label"]
        assert updated["seats"] == table["seats"]

    def test_invalid_status_is_400(self, client):
        table = create_table(client)
        response = client.patch(f"/api/tables/{table['id']}", json={"status": "reserved"})
        assert response.status_code == 400

    def test_unknown_id_is_404(self, client):
        response = client.patch(f"/api/tables/{UNKNOWN_ID}", json={"status": "dirty"})
        assert response.status_code == 404
        assert "message" in response.json()


class TestDeleteTable:
    def test_removes_table(self, client):
        table = create_table(client)
        response = client.delete(f"/api/tables/{table['id']}")
        assert response.status_code == 204

        listed = client.get("/api/tables").json()
        assert all(t["id"] != table["id"] for t in listed)

    def test_unknown_id_is_404(self, client):
        response = client.delete(f"/api/tables/{UNKNOWN_ID}")
        assert response.status_code == 404
