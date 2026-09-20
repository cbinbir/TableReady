"""In-memory mock "database".

Stands in for a real database until one is wired up. Nothing outside this
module should reach into its internals — routers only call the methods
below, so swapping this for a real persistence layer later only means
replacing this file (and how it's constructed in `main.create_app`).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from .models import (
    NewPartyInput,
    NewTableInput,
    Party,
    PartyStatus,
    RestaurantTable,
    TableStatus,
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return str(uuid.uuid4())


class Store:
    """A single restaurant's parties and tables, held in memory."""

    def __init__(self, *, seed: bool = False) -> None:
        self.parties: dict[str, Party] = {}
        self.tables: dict[str, RestaurantTable] = {}
        self._order_counter = 0
        if seed:
            self._seed()

    # -- parties ----------------------------------------------------------

    def list_parties(self) -> list[Party]:
        return list(self.parties.values())

    def get_party(self, party_id: str) -> Party | None:
        return self.parties.get(party_id)

    def create_party(self, input: NewPartyInput) -> Party:
        now = _now()
        party = Party(
            id=_new_id(),
            name=input.name,
            partySize=input.partySize,
            phone=input.phone,
            notes=input.notes,
            source=input.source,
            estimatedWaitMinutes=input.estimatedWaitMinutes,
            status=PartyStatus.WAITING,
            order=self._next_order(),
            createdAt=now,
            updatedAt=now,
            seatedAt=None,
        )
        self.parties[party.id] = party
        return party

    def update_party(self, party_id: str, **changes: object) -> Party | None:
        """Merge `changes` into the party and bump `updatedAt`. Returns None if missing."""
        party = self.parties.get(party_id)
        if party is None:
            return None
        updated = party.model_copy(update={**changes, "updatedAt": _now()})
        self.parties[party_id] = updated
        return updated

    def reorder_party(self, party_id: str, direction: str) -> list[Party] | None:
        """Swap `order` with the neighboring waiting party. None if `party_id` isn't waiting."""
        waiting = sorted(
            (p for p in self.parties.values() if p.status == PartyStatus.WAITING),
            key=lambda p: p.order,
        )
        index = next((i for i, p in enumerate(waiting) if p.id == party_id), None)
        if index is None:
            return None

        swap_index = index - 1 if direction == "up" else index + 1
        if swap_index < 0 or swap_index >= len(waiting):
            return self.list_parties()

        a, b = waiting[index], waiting[swap_index]
        now = _now()
        self.parties[a.id] = a.model_copy(update={"order": b.order, "updatedAt": now})
        self.parties[b.id] = b.model_copy(update={"order": a.order, "updatedAt": now})
        return self.list_parties()

    def _next_order(self) -> int:
        self._order_counter += 1
        return self._order_counter

    # -- tables -------------------------------------------------------------

    def list_tables(self) -> list[RestaurantTable]:
        return list(self.tables.values())

    def get_table(self, table_id: str) -> RestaurantTable | None:
        return self.tables.get(table_id)

    def create_table(self, input: NewTableInput) -> RestaurantTable:
        table = RestaurantTable(
            id=_new_id(),
            label=input.label,
            seats=input.seats,
            status=TableStatus.OPEN,
            updatedAt=_now(),
        )
        self.tables[table.id] = table
        return table

    def update_table_status(self, table_id: str, status: TableStatus) -> RestaurantTable | None:
        table = self.tables.get(table_id)
        if table is None:
            return None
        updated = table.model_copy(update={"status": status, "updatedAt": _now()})
        self.tables[table_id] = updated
        return updated

    def delete_table(self, table_id: str) -> bool:
        return self.tables.pop(table_id, None) is not None

    # -- demo data ------------------------------------------------------------

    def _seed(self) -> None:
        def minutes_ago(minutes: int) -> datetime:
            return _now() - timedelta(minutes=minutes)

        seed_parties = [
            dict(
                name="Alvarez",
                partySize=4,
                phone="555-0142",
                notes="Prefers a booth",
                source="walk-in",
                estimatedWaitMinutes=20,
                status="waiting",
                created=18,
            ),
            dict(
                name="Chen",
                partySize=2,
                phone="555-0187",
                notes="",
                source="call-ahead",
                estimatedWaitMinutes=15,
                status="waiting",
                created=12,
            ),
            dict(
                name="Okafor",
                partySize=6,
                phone="555-0120",
                notes="High chair needed",
                source="walk-in",
                estimatedWaitMinutes=35,
                status="waiting",
                created=6,
            ),
        ]
        for seed in seed_parties:
            created_at = minutes_ago(seed["created"])
            party = Party(
                id=_new_id(),
                name=seed["name"],
                partySize=seed["partySize"],
                phone=seed["phone"],
                notes=seed["notes"],
                source=seed["source"],
                estimatedWaitMinutes=seed["estimatedWaitMinutes"],
                status=seed["status"],
                order=self._next_order(),
                createdAt=created_at,
                updatedAt=created_at,
                seatedAt=None,
            )
            self.parties[party.id] = party

        table_seeds = [
            ("T1", 2, "open"),
            ("T2", 2, "occupied"),
            ("T3", 4, "occupied"),
            ("T4", 4, "dirty"),
            ("T5", 4, "open"),
            ("T6", 6, "open"),
            ("Patio 1", 4, "open"),
            ("Patio 2", 2, "dirty"),
        ]
        for label, seats, status in table_seeds:
            table = RestaurantTable(
                id=_new_id(),
                label=label,
                seats=seats,
                status=status,
                updatedAt=minutes_ago(30),
            )
            self.tables[table.id] = table
