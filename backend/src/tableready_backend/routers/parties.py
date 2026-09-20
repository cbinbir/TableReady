from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_store
from ..models import NewPartyInput, Party, PartyEditableFields, PartyStatus, ReorderRequest
from ..store import Store

router = APIRouter(prefix="/parties", tags=["Parties"])


@router.get("", response_model=list[Party])
def list_parties(store: Store = Depends(get_store)) -> list[Party]:
    """All parties, every status. Waitlist and History are both derived from this."""
    return store.list_parties()


@router.post("", response_model=Party, status_code=status.HTTP_201_CREATED)
def create_party(input: NewPartyInput, store: Store = Depends(get_store)) -> Party:
    return store.create_party(input)


@router.patch("/{party_id}", response_model=Party)
def update_party(
    party_id: str, patch: PartyEditableFields, store: Store = Depends(get_store)
) -> Party:
    changes = patch.model_dump(exclude_unset=True)
    updated = store.update_party(party_id, **changes)
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Party {party_id} not found")
    return updated


@router.post("/{party_id}/reorder", response_model=list[Party])
def reorder_party(
    party_id: str, body: ReorderRequest, store: Store = Depends(get_store)
) -> list[Party]:
    result = store.reorder_party(party_id, body.direction)
    if result is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, detail=f"No waiting party {party_id} found"
        )
    return result


@router.post("/{party_id}/seat", response_model=Party)
def seat_party(party_id: str, store: Store = Depends(get_store)) -> Party:
    return _transition(store, party_id, status=PartyStatus.SEATED, seatedAt=datetime.now(timezone.utc))


@router.post("/{party_id}/no-show", response_model=Party)
def mark_party_no_show(party_id: str, store: Store = Depends(get_store)) -> Party:
    return _transition(store, party_id, status=PartyStatus.NO_SHOW)


@router.post("/{party_id}/cancel", response_model=Party)
def cancel_party(party_id: str, store: Store = Depends(get_store)) -> Party:
    return _transition(store, party_id, status=PartyStatus.CANCELLED)


@router.post("/{party_id}/recall", response_model=Party)
def recall_party(party_id: str, store: Store = Depends(get_store)) -> Party:
    return _transition(store, party_id, status=PartyStatus.WAITING)


def _transition(store: Store, party_id: str, **changes: object) -> Party:
    updated = store.update_party(party_id, **changes)
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Party {party_id} not found")
    return updated
