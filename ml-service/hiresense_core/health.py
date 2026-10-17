"""Health payload for the ML service (pure function, no web framework needed)."""

from __future__ import annotations

from datetime import UTC, datetime

from hiresense_core import __version__

SERVICE_NAME = "hiresense-ml"


def build_health_payload(
    model_version: str | None = None,
    now: datetime | None = None,
) -> dict:
    """Describe the service state.

    `model_loaded` is only True when a trained artifact has actually been loaded.
    No model exists yet, so it is reported honestly as False.
    """
    timestamp = now or datetime.now(UTC)
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "version": __version__,
        "model_loaded": model_version is not None,
        "model_version": model_version,
        "time": timestamp.isoformat(),
    }
