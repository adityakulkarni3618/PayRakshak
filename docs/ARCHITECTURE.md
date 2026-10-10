# Architecture

```
Next.js (customer / support / admin)  ->  FastAPI  ->  PostgreSQL (SQLite in dev)
                                           |
        routers: auth, transactions, disputes, support, admin, ai, dashboard
                                           |
   services/cases (state machine, audit)  -> services/analysis orchestrates:
        ml/classifier  (TF-IDF + LogReg, uncertainty threshold)
        services/consistency  (rule engine, evidence-backed findings)
        services/resolution   (advisory recommendations, review conditions)
        services/explain      (structured explanation from real outputs only)
```

## Case lifecycle
SUBMITTED -> VALIDATING -> AI_ANALYSIS -> {AWAITING_INFORMATION | UNDER_REVIEW | ACTION_RECOMMENDED | ESCALATED}
-> RESOLVED / REJECTED / WITHDRAWN; terminal cases can be REOPENED. Allowed transitions live in `services/cases.ALLOWED`.
Unauthorized-transaction complaints go straight to ESCALATED.

## Tables
users, transactions, transaction_imports, disputes, evidence_files, ai_analyses, validation_findings,
resolution_recommendations, case_comments, notifications, audit_events. Analyses/findings/recommendations are append-only history.

## Security notes
Scrypt password hashing; JWT (id only) in an httpOnly cookie; CSRF header required on cookie-authenticated writes; login lockout +
rate limit; uploads restricted to PNG/JPG/PDF with magic-byte checks, random names, stored outside any public path, served only
through authorised endpoints; role always read from DB. 403 is returned for cases that exist but belong to someone else.
Limitations: in-memory rate limiter (single process), no malware scan, no migrations, no HTTPS termination (use a reverse proxy).
