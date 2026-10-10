# UPIResolve AI: guidance for coding agents (Antigravity, etc.)

Full-stack UPI dispute platform: FastAPI + SQLAlchemy backend (`backend/`), Next.js 14 + Tailwind frontend (`frontend/`).

## Run / verify
- Backend: `cd backend && pip install -r requirements.txt && python -m app.ml.train && uvicorn app.main:app --reload`
- Tests: `cd backend && python -m pytest -q`  (must stay green)
- Frontend: `cd frontend && npm install && npm run dev` / `npm run build`
- Seed synthetic demo data: `cd backend && python -m scripts.seed`; first admin: `python -m scripts.create_admin --email ... --name ...`

## Non-negotiable rules
1. AI recommends; people decide. Never add code that refunds, reverses, or closes a case from a model prediction. Recommendations stay `ADVISORY_ONLY`.
2. Keep classifier (`app/ml`), consistency rules (`services/consistency.py`) and resolution rules (`services/resolution.py`) separate. A prediction never changes a transaction's status.
3. Never fabricate confidence values, metrics or transaction data. If the model is missing, report AI as unavailable.
4. Role comes from the database, never from the client. Customers only touch their own rows; every router enforces this server-side.
5. `PROVIDER_VERIFIED` is reserved for a real provider integration. Sample data is `SYNTHETIC`; CSV imports are `USER_IMPORTED`.
6. Do not log or store UPI PINs/OTPs/passwords, or put raw complaint text in audit details.
7. Case status changes go through `services/cases.transition` (state machine + audit event).

## Known gaps to build next
Alembic migrations (tables use `create_all` in dev), frontend unit/e2e tests, malware scanning for uploads, a real provider adapter, Redis-backed rate limiting.
