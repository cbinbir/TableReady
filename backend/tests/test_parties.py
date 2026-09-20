"""Tests for /api/parties, derived from openapi.yaml's Parties paths."""

from helpers import create_party

UNKNOWN_ID = "00000000-0000-0000-0000-000000000000"


class TestListParties:
    def test_empty_by_default(self, client):
        response = client.get("/api/parties")
        assert response.status_code == 200
        assert response.json() == []

    def test_returns_every_status(self, client):
        waiting = create_party(client, name="Waiting")
        seated_id = create_party(client, name="ToSeat")["id"]
        client.post(f"/api/parties/{seated_id}/seat")

        response = client.get("/api/parties")
        assert response.status_code == 200
        names = {p["name"] for p in response.json()}
        assert names == {"Waiting", "ToSeat"}
        assert waiting["status"] == "waiting"


class TestCreateParty:
    def test_defaults_assigned_by_server(self, client):
        response = client.post(
            "/api/parties",
            json={
                "name": "Chen",
                "partySize": 2,
                "phone": "555-0187",
                "notes": "",
                "source": "call-ahead",
                "estimatedWaitMinutes": 15,
            },
        )
        assert response.status_code == 201
        party = response.json()
        assert party["name"] == "Chen"
        assert party["source"] == "call-ahead"
        assert party["status"] == "waiting"
        assert party["seatedAt"] is None
        assert party["createdAt"] == party["updatedAt"]
        assert isinstance(party["id"], str) and party["id"]
        assert isinstance(party["order"], int)

    def test_appears_in_list_after_creation(self, client):
        created = create_party(client, name="Okafor")
        response = client.get("/api/parties")
        assert any(p["id"] == created["id"] for p in response.json())

    def test_second_party_ordered_after_first(self, client):
        first = create_party(client, name="First")
        second = create_party(client, name="Second")
        assert second["order"] > first["order"]

    def test_missing_required_field_is_400(self, client):
        response = client.post(
            "/api/parties",
            json={
                "name": "Missing size",
                "phone": "",
                "notes": "",
                "source": "walk-in",
                "estimatedWaitMinutes": 10,
            },
        )
        assert response.status_code == 400
        assert "message" in response.json()

    def test_invalid_source_is_400(self, client):
        response = client.post(
            "/api/parties",
            json={
                "name": "Bad source",
                "partySize": 2,
                "phone": "",
                "notes": "",
                "source": "walk-up",
                "estimatedWaitMinutes": 10,
            },
        )
        assert response.status_code == 400


class TestUpdateParty:
    def test_updates_editable_fields(self, client):
        party = create_party(client, name="Original", partySize=2)
        response = client.patch(
            f"/api/parties/{party['id']}",
            json={"name": "Renamed", "partySize": 5, "notes": "High chair"},
        )
        assert response.status_code == 200
        updated = response.json()
        assert updated["name"] == "Renamed"
        assert updated["partySize"] == 5
        assert updated["notes"] == "High chair"
        # untouched fields survive the partial update
        assert updated["phone"] == party["phone"]
        assert updated["updatedAt"] != party["updatedAt"]

    def test_partial_update_leaves_other_fields_untouched(self, client):
        party = create_party(client, name="Original")
        response = client.patch(f"/api/parties/{party['id']}", json={"estimatedWaitMinutes": 45})
        assert response.status_code == 200
        updated = response.json()
        assert updated["estimatedWaitMinutes"] == 45
        assert updated["name"] == "Original"

    def test_unknown_id_is_404(self, client):
        response = client.patch(f"/api/parties/{UNKNOWN_ID}", json={"name": "Nobody"})
        assert response.status_code == 404
        assert "message" in response.json()


class TestReorderParty:
    def test_move_up_swaps_with_previous(self, client):
        first = create_party(client, name="First")
        second = create_party(client, name="Second")

        response = client.post(f"/api/parties/{second['id']}/reorder", json={"direction": "up"})
        assert response.status_code == 200
        by_id = {p["id"]: p for p in response.json()}
        assert by_id[second["id"]]["order"] == first["order"]
        assert by_id[first["id"]]["order"] == second["order"]

    def test_move_down_swaps_with_next(self, client):
        first = create_party(client, name="First")
        second = create_party(client, name="Second")

        response = client.post(f"/api/parties/{first['id']}/reorder", json={"direction": "down"})
        assert response.status_code == 200
        by_id = {p["id"]: p for p in response.json()}
        assert by_id[first["id"]]["order"] == second["order"]
        assert by_id[second["id"]]["order"] == first["order"]

    def test_moving_first_party_up_is_a_noop(self, client):
        first = create_party(client, name="First")
        create_party(client, name="Second")

        response = client.post(f"/api/parties/{first['id']}/reorder", json={"direction": "up"})
        assert response.status_code == 200
        by_id = {p["id"]: p for p in response.json()}
        assert by_id[first["id"]]["order"] == first["order"]

    def test_moving_last_party_down_is_a_noop(self, client):
        create_party(client, name="First")
        second = create_party(client, name="Second")

        response = client.post(f"/api/parties/{second['id']}/reorder", json={"direction": "down"})
        assert response.status_code == 200
        by_id = {p["id"]: p for p in response.json()}
        assert by_id[second["id"]]["order"] == second["order"]

    def test_unknown_id_is_404(self, client):
        response = client.post(f"/api/parties/{UNKNOWN_ID}/reorder", json={"direction": "up"})
        assert response.status_code == 404

    def test_non_waiting_party_is_404(self, client):
        party = create_party(client, name="Seated")
        client.post(f"/api/parties/{party['id']}/seat")

        response = client.post(f"/api/parties/{party['id']}/reorder", json={"direction": "up"})
        assert response.status_code == 404


class TestSeatParty:
    def test_sets_status_and_seated_at(self, client):
        party = create_party(client)
        response = client.post(f"/api/parties/{party['id']}/seat")
        assert response.status_code == 200
        seated = response.json()
        assert seated["status"] == "seated"
        assert seated["seatedAt"] is not None

    def test_unknown_id_is_404(self, client):
        response = client.post(f"/api/parties/{UNKNOWN_ID}/seat")
        assert response.status_code == 404


class TestNoShowParty:
    def test_sets_status(self, client):
        party = create_party(client)
        response = client.post(f"/api/parties/{party['id']}/no-show")
        assert response.status_code == 200
        assert response.json()["status"] == "no-show"

    def test_unknown_id_is_404(self, client):
        response = client.post(f"/api/parties/{UNKNOWN_ID}/no-show")
        assert response.status_code == 404


class TestCancelParty:
    def test_sets_status(self, client):
        party = create_party(client)
        response = client.post(f"/api/parties/{party['id']}/cancel")
        assert response.status_code == 200
        assert response.json()["status"] == "cancelled"

    def test_unknown_id_is_404(self, client):
        response = client.post(f"/api/parties/{UNKNOWN_ID}/cancel")
        assert response.status_code == 404


class TestRecallParty:
    def test_returns_no_show_party_to_waiting(self, client):
        party = create_party(client)
        client.post(f"/api/parties/{party['id']}/no-show")

        response = client.post(f"/api/parties/{party['id']}/recall")
        assert response.status_code == 200
        assert response.json()["status"] == "waiting"

    def test_returns_cancelled_party_to_waiting(self, client):
        party = create_party(client)
        client.post(f"/api/parties/{party['id']}/cancel")

        response = client.post(f"/api/parties/{party['id']}/recall")
        assert response.status_code == 200
        assert response.json()["status"] == "waiting"

    def test_unknown_id_is_404(self, client):
        response = client.post(f"/api/parties/{UNKNOWN_ID}/recall")
        assert response.status_code == 404
