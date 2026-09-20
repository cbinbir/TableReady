from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_store
from ..models import NewTableInput, RestaurantTable, TableStatusUpdate
from ..store import Store

router = APIRouter(prefix="/tables", tags=["Tables"])


@router.get("", response_model=list[RestaurantTable])
def list_tables(store: Store = Depends(get_store)) -> list[RestaurantTable]:
    return store.list_tables()


@router.post("", response_model=RestaurantTable, status_code=status.HTTP_201_CREATED)
def create_table(input: NewTableInput, store: Store = Depends(get_store)) -> RestaurantTable:
    return store.create_table(input)


@router.patch("/{table_id}", response_model=RestaurantTable)
def update_table_status(
    table_id: str, body: TableStatusUpdate, store: Store = Depends(get_store)
) -> RestaurantTable:
    updated = store.update_table_status(table_id, body.status)
    if updated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Table {table_id} not found")
    return updated


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(table_id: str, store: Store = Depends(get_store)) -> None:
    removed = store.delete_table(table_id)
    if not removed:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Table {table_id} not found")
