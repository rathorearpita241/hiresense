"""FastAPI entrypoint for the HireSense ML service.

Run locally from the ml-service/ directory:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

from fastapi import FastAPI

from hiresense_core import __version__
from hiresense_core.health import build_health_payload


def create_app() -> FastAPI:
    app = FastAPI(
        title="HireSense ML service",
        version=__version__,
        description="Skill normalization, job matching and (optionally) salary inference.",
    )

    # Trained artifacts are loaded once at startup in a later milestone and stored on
    # app.state. Nothing is trained or loaded yet, so there is no model version.
    app.state.model_version = None

    @app.get("/health", tags=["meta"])
    def health() -> dict:
        return build_health_payload(model_version=app.state.model_version)

    return app


app = create_app()
