from ..ctx import request_id
from ..models import AuditEvent, Notification


def log_event(db, actor, action, entity_type, entity_id, dispute_id=None, detail=None):
    """Audit trail. Never put raw complaint text, passwords or tokens in `detail`."""
    db.add(AuditEvent(actor_id=getattr(actor, "id", None), actor_role=getattr(actor, "role", "SYSTEM"),
                      action=action, entity_type=entity_type, entity_id=str(entity_id),
                      dispute_id=dispute_id, detail=detail or {}, request_id=request_id.get()))


def notify(db, user_id, dispute, message):
    if user_id:
        db.add(Notification(user_id=user_id, dispute_id=dispute.id if dispute else None, message=message[:250]))
