from sqlalchemy import select, func
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..db import get_db, engine
from ..deps import admin_only
from ..ml.classifier import classifier
from ..models import Dispute, AIAnalysis, ValidationFinding, AuditEvent, User
from ..schemas import RoleIn
from ..services.audit import log_event

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/analytics")
def analytics(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    def grp(col, *w):
        return {k or "NONE": v for k, v in db.execute(select(col, func.count()).where(*w).group_by(col)).all()}
    resolved = db.scalars(select(Dispute).where(Dispute.status == "RESOLVED", Dispute.resolved_at.is_not(None))).all()
    hrs = [(d.resolved_at - d.created_at.replace(tzinfo=d.resolved_at.tzinfo)).total_seconds() / 3600 for d in resolved]
    ai_total = db.scalar(select(func.count()).select_from(AIAnalysis).where(AIAnalysis.ai_available.is_(True))) or 0
    abst = db.scalar(select(func.count()).select_from(AIAnalysis).where(AIAnalysis.ai_available.is_(True), AIAnalysis.predicted_category == "NEEDS_CLARIFICATION")) or 0
    return {
        "total_disputes": db.scalar(select(func.count()).select_from(Dispute)) or 0,
        "by_status": grp(Dispute.status), "by_category": grp(Dispute.effective_category),
        "findings_by_rule": grp(ValidationFinding.rule_id),
        "avg_resolution_hours": round(sum(hrs) / len(hrs), 2) if hrs else None,
        "model_abstention_rate": round(abst / ai_total, 4) if ai_total else None,
        "definitions": {"avg_resolution_hours": "Mean hours from creation to RESOLVED, resolved cases only.",
                        "model_abstention_rate": "Share of model-analysed cases where the classifier returned NEEDS_CLARIFICATION.",
                        "accuracy": "Not reported: no verified ground-truth labels exist for live cases."},
    }


@router.get("/audit-events")
def audit(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), action: str | None = None,
          user: User = Depends(admin_only), db: Session = Depends(get_db)):
    f = [AuditEvent.action == action] if action else []
    total = db.scalar(select(func.count()).select_from(AuditEvent).where(*f)) or 0
    rows = db.scalars(select(AuditEvent).where(*f).order_by(AuditEvent.id.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"total": total, "items": [{"id": e.id, "action": e.action, "actor_id": e.actor_id, "actor_role": e.actor_role, "entity_type": e.entity_type,
                                       "entity_id": e.entity_id, "detail": e.detail, "request_id": e.request_id, "created_at": e.created_at} for e in rows]}


@router.get("/system-health")
def health(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    try:
        db.execute(select(1))
        db_ok = True
    except Exception:
        db_ok = False
    return {"database": "ok" if db_ok else "down", "model": classifier.status()}


@router.get("/users")
def users(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return [{"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "is_active": u.is_active} for u in db.scalars(select(User).order_by(User.created_at)).all()]


@router.post("/users/{user_id}/role")
def set_role(user_id: str, body: RoleIn, user: User = Depends(admin_only), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    if target.id == user.id:
        raise HTTPException(400, "You cannot change your own role")
    old, target.role = target.role, body.role
    log_event(db, user, "ROLE_CHANGED", "user", target.id, detail={"from": old, "to": body.role})
    db.commit()
    return {"id": target.id, "role": target.role}


@router.get("/export/audit-events")
def export_audit(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    import csv, io
    from fastapi.responses import Response
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["id", "action", "actor_role", "actor_id", "entity_type", "entity_id", "created_at"])
    for e in db.scalars(select(AuditEvent).order_by(AuditEvent.id.desc())).all():
        w.writerow([e.id, e.action, e.actor_role, e.actor_id, e.entity_type, e.entity_id, e.created_at])
    return Response(content=out.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=audit_events.csv"})


@router.get("/export/disputes")
def export_disputes(user: User = Depends(admin_only), db: Session = Depends(get_db)):
    import csv, io
    from fastapi.responses import Response
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["case_id", "owner_id", "effective_category", "status", "created_at", "resolved_at"])
    for d in db.scalars(select(Dispute).order_by(Dispute.id.desc())).all():
        w.writerow([d.case_id, d.owner_id, d.effective_category, d.status, d.created_at, d.resolved_at])
    return Response(content=out.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=disputes.csv"})

