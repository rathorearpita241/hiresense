from datetime import UTC, datetime

from fastapi.testclient import TestClient

from app.main import create_app
from hiresense_core import __version__
from hiresense_core.health import build_health_payload


def test_payload_reports_no_model_by_default():
    payload = build_health_payload()
    assert payload["status"] == "ok"
    assert payload["service"] == "hiresense-ml"
    assert payload["version"] == __version__
    assert payload["model_loaded"] is False
    assert payload["model_version"] is None


def test_payload_reports_model_when_loaded():
    payload = build_health_payload(model_version="2026.10.0")
    assert payload["model_loaded"] is True
    assert payload["model_version"] == "2026.10.0"


def test_payload_time_is_iso_8601_utc():
    fixed = datetime(2026, 10, 16, 12, 0, tzinfo=UTC)
    assert build_health_payload(now=fixed)["time"] == "2026-10-16T12:00:00+00:00"


def test_health_endpoint():
    client = TestClient(create_app())
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is False


def test_unknown_route_returns_404():
    client = TestClient(create_app())
    assert client.get("/does-not-exist").status_code == 404
