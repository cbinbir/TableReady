import pytest
from fastapi.testclient import TestClient

from tableready_backend.main import create_app


@pytest.fixture
def client() -> TestClient:
    """A fresh app + empty in-memory store for every test.

    Seed data is intentionally left out: tests arrange their own parties and
    tables through the API instead of depending on seed content, so they stay
    valid however the demo seed evolves.
    """
    app = create_app(seed=False)
    return TestClient(app)
