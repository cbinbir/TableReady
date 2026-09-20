def main() -> None:
    """Entry point for `uv run tableready-backend`: runs the dev server."""
    import uvicorn

    uvicorn.run("tableready_backend.main:app", reload=True)
