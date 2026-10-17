# HireSense

Explainable job-market analytics and job matching. A React dashboard, an Express API, MongoDB, and a Python (FastAPI) service for skill normalization and matching. The matching baseline is skill coverage plus TF-IDF cosine similarity, so every score can be explained. No LLM is used.

> **Status: Milestone 1 of 9 (scaffold).** There is no dataset, no model and no real job data yet. The dashboard shows system status only. Results will be added to this README with measured numbers as each milestone lands.

## Roadmap

| # | Milestone | Status |
|---|---|---|
| 1 | Scaffold and tooling | In progress |
| 2 | Dataset selection and audit (licence check, data dictionary) | Not started |
| 3 | Cleaning pipeline and skill normalization | Not started |
| 4 | Analytics and matching baseline | Not started |
| 5 | Express API and MongoDB endpoints | Not started |
| 6 | React dashboard pages | Not started |
| 7 | Evaluation (Precision@K, Recall@K, NDCG@K on a hand-labelled set) | Not started |
| 8 | Salary insights (descriptive first; model only if data supports it) | Not started |
| 9 | Deployment, screenshots, model card | Not started |

## Layout

```
client/       React + Vite dashboard
server/       Express API (health check, error handling, config validation)
ml-service/   FastAPI app + hiresense_core (code shared by pipelines and the service)
pipelines/    Offline data pipelines (ingest, clean, index, evaluate)
notebooks/    Audit, EDA and modelling notebooks
data/         raw/ and processed/ (git-ignored)
models/       Trained artifacts (git-ignored) and their metadata
docs/         Architecture notes; data dictionary and model card arrive with later milestones
```

## Prerequisites

- Node 20 or newer (developed against 22)
- Python 3.11 or newer (developed against 3.13)
- Docker, for a local MongoDB (optional until Milestone 5)

## Run it locally

```bash
cp .env.example .env

# 1. MongoDB (optional for now; the API reports it as down if it is not running)
docker compose up -d mongo

# 2. ML service  -> http://localhost:8000/health
cd ml-service
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --port 8000

# 3. API  -> http://localhost:4000/api/health   (new terminal)
cd server && npm install && npm run dev

# 4. Dashboard  -> http://localhost:5173   (new terminal)
cd client && npm install && npm run dev
```

The dashboard's Overview page calls `/api/health`, which reports whether MongoDB and the ML service are reachable.

## Tests

```bash
cd ml-service && source .venv/bin/activate && pytest && ruff check .
cd server && npm test
cd client && npm run build
```

GitHub Actions runs the same commands on every push and pull request (`.github/workflows/ci.yml`).

## Lock files

Dependencies are declared with lower bounds. After your first successful install, commit `server/package-lock.json`, `client/package-lock.json` and `ml-service/requirements.lock.txt` (`pip freeze > requirements.lock.txt`) so builds are reproducible.

## Design decisions

See [docs/architecture.md](docs/architecture.md).
