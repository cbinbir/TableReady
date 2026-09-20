"""FastAPI app factory implementing openapi.yaml."""

from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .routers import parties, tables
from .store import Store


def create_app(*, seed: bool = True) -> FastAPI:
    app = FastAPI(
        title="TableReady API",
        version="0.1.0",
        description="Implements openapi.yaml at the repository root.",
    )
    app.state.store = Store(seed=seed)

    app.include_router(parties.router, prefix="/api")
    app.include_router(tables.router, prefix="/api")

    @app.exception_handler(HTTPException)
    async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
        # openapi.yaml's Error schema is {"message": str}, not FastAPI's default {"detail": str}.
        return JSONResponse(status_code=exc.status_code, content={"message": str(exc.detail)})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        # openapi.yaml documents invalid request bodies as 400, not FastAPI's default 422.
        first_error = exc.errors()[0]
        location = ".".join(str(part) for part in first_error["loc"] if part != "body")
        message = f"{location}: {first_error['msg']}" if location else first_error["msg"]
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": message})

    return app


app = create_app()
