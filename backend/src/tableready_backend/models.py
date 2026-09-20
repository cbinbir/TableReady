"""Pydantic models mirroring the schemas in openapi.yaml."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class PartySource(str, Enum):
    WALK_IN = "walk-in"
    CALL_AHEAD = "call-ahead"


class PartyStatus(str, Enum):
    WAITING = "waiting"
    SEATED = "seated"
    NO_SHOW = "no-show"
    CANCELLED = "cancelled"


class TableStatus(str, Enum):
    OPEN = "open"
    OCCUPIED = "occupied"
    DIRTY = "dirty"


class Party(BaseModel):
    id: str
    name: str
    partySize: int = Field(ge=1)
    phone: str
    notes: str
    source: PartySource
    estimatedWaitMinutes: int = Field(ge=0)
    status: PartyStatus
    order: int
    createdAt: datetime
    updatedAt: datetime
    seatedAt: datetime | None


class NewPartyInput(BaseModel):
    name: str = Field(min_length=1)
    partySize: int = Field(ge=1)
    phone: str
    notes: str
    source: PartySource
    estimatedWaitMinutes: int = Field(ge=0)


class PartyEditableFields(BaseModel):
    name: str | None = Field(default=None, min_length=1)
    partySize: int | None = Field(default=None, ge=1)
    phone: str | None = None
    notes: str | None = None
    source: PartySource | None = None
    estimatedWaitMinutes: int | None = Field(default=None, ge=0)


class ReorderRequest(BaseModel):
    direction: Literal["up", "down"]


class RestaurantTable(BaseModel):
    id: str
    label: str
    seats: int = Field(ge=1)
    status: TableStatus
    updatedAt: datetime


class NewTableInput(BaseModel):
    label: str = Field(min_length=1)
    seats: int = Field(ge=1)


class TableStatusUpdate(BaseModel):
    status: TableStatus


class Error(BaseModel):
    message: str
