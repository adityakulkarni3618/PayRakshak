# UPIResolve AI

Intelligent UPI dispute detection and resolution platform: customers report payment problems; the system classifies the
complaint, checks the transaction records with deterministic rules, explains its findings, recommends a next step, and tracks
the case through review by support staff. **AI recommends. People decide. Nothing moves money.**

- Backend: FastAPI, SQLAlchemy 2, scikit-learn (TF-IDF + Logistic Regression), Pydantic
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind
- DB: SQLite for local dev, PostgreSQL via Docker Compose

## Quick start (local)
```bash
# 1. backend
cd backend
python -m venv .venv && source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.ml.train                                    # trains baseline, writes model_store/ + metrics.json
python -m scripts.seed                                    # SYNTHETIC demo data; prints demo passwords once
python -m scripts.create_admin --email you@example.com --name "You"   # first admin (prompts for password)
uvicorn app.main:app --reload                             # http://localhost:8000/docs

# 2. frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install && npm run dev                                # http://localhost:3000
```
Tests: `cd backend && python -m pytest -q`   Frontend build check: `cd frontend && npm run build`

## Docker
```bash
cp .env.example .env     # set SECRET_KEY and POSTGRES_PASSWORD
docker compose up --build
```

## What is real and what is not
| Area | Status |
|---|---|
| Auth, roles, cases, evidence, audit, dashboards | Implemented, backend covered by 24 automated tests |
| Complaint classifier | Real trained model, but on **synthetic template data**; see `docs/DATA.md` for honest metrics |
| Consistency rules / resolution engine | Deterministic, advisory-only |
| UPI/bank integration | **None.** Data is `SYNTHETIC` or `USER_IMPORTED`. `PROVIDER_VERIFIED` is reserved for a future adapter |
| Migrations (Alembic), frontend tests, malware scanning, Redis rate limiting | Not included |

## Layout
```
backend/app/{routers,services,ml}   API, business logic, classifier + training
backend/tests                       pytest (API, auth, isolation, state machine, ML, rules)
backend/scripts                     seed + create_admin
frontend/app, components, lib       Next.js pages, shared UI, API client
docs/                               ARCHITECTURE, DATA card, DEMO guide
AGENTS.md                           rules for AI coding agents working on this repo
```
