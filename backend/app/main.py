import logging, uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from .config import settings
from .ctx import request_id
from .db import Base, engine
from .ml.classifier import classifier
from . import models  # noqa: F401  (register tables)
from .routers import auth, transactions, disputes, support, admin, ai, dashboard
from .routers.disputes import _public_router as cases_public_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("upiresolve")


@asynccontextmanager
async def lifespan(app):
    if settings.auto_create_tables:
        Base.metadata.create_all(engine)  # dev convenience; use migrations for real deployments
    if not classifier.load():
        log.warning("Classifier not loaded. Run `python -m app.ml.train`. AI analysis will report 'unavailable'.")
    yield


app = FastAPI(title="UPIResolve AI", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True,
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type", "X-Requested-With", "Idempotency-Key", "Authorization"])


@app.middleware("http")
async def correlation(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:16]
    request_id.set(rid)
    try:
        resp = await call_next(request)
    except Exception:
        log.exception("Unhandled error rid=%s path=%s", rid, request.url.path)  # details stay in logs, not in the response
        resp = JSONResponse({"detail": "Internal server error", "request_id": rid}, status_code=500)
    resp.headers["X-Request-ID"] = rid
    resp.headers["X-Content-Type-Options"] = "nosniff"
    return resp


for r in (auth, transactions, disputes, support, admin, ai, dashboard):
    app.include_router(r.router)
# Unauthenticated public endpoints (case tracking)
app.include_router(cases_public_router)


@app.get("/health")
def health():
    try:
        with engine.connect() as c:
            c.execute(text("SELECT 1"))
        db = "ok"
    except Exception:
        db = "down"
    return {"status": "ok" if db == "ok" else "degraded", "database": db, "model_available": classifier.available}
