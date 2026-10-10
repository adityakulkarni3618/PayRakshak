import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (String, Numeric, DateTime, ForeignKey, Text, Boolean, Float, Integer,
                        UniqueConstraint, Index, JSON, CheckConstraint)
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base


def utcnow():
    return datetime.now(timezone.utc)


def uid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="CUSTOMER")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    failed_logins: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ImportBatch(Base):
    __tablename__ = "transaction_imports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    total_rows: Mapped[int] = mapped_column(Integer, default=0)
    imported: Mapped[int] = mapped_column(Integer, default=0)
    duplicates: Mapped[int] = mapped_column(Integer, default=0)
    invalid: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = (
        UniqueConstraint("owner_id", "row_hash", name="uq_txn_owner_rowhash"),
        CheckConstraint("amount > 0", name="ck_txn_amount_positive"),
        Index("ix_txn_owner_time", "owner_id", "occurred_at"),
    )
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    external_ref: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    direction: Mapped[str] = mapped_column(String(10), default="SENT")
    status: Mapped[str] = mapped_column(String(10))
    reversal_status: Mapped[str] = mapped_column(String(10), default="UNKNOWN")
    counterparty: Mapped[str] = mapped_column(String(120))
    merchant_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)
    data_source: Mapped[str] = mapped_column(String(20), default="UNKNOWN")
    import_batch_id: Mapped[str | None] = mapped_column(ForeignKey("transaction_imports.id"), nullable=True)
    row_hash: Mapped[str] = mapped_column(String(64))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Dispute(Base):
    __tablename__ = "disputes"
    __table_args__ = (UniqueConstraint("owner_id", "idempotency_key", name="uq_dispute_idem"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    transaction_id: Mapped[str] = mapped_column(ForeignKey("transactions.id"), index=True)
    description: Mapped[str] = mapped_column(Text)
    selected_category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    predicted_category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    effective_category: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    claimed_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2), nullable=True)
    order_reference: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="SUBMITTED", index=True)
    assigned_to: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(64), nullable=True)
    resolution_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class EvidenceFile(Base):
    __tablename__ = "evidence_files"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uid)
    dispute_id: Mapped[int] = mapped_column(ForeignKey("disputes.id"), index=True)
    uploader_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    original_name: Mapped[str] = mapped_column(String(255))
    stored_name: Mapped[str] = mapped_column(String(80))
    content_type: Mapped[str] = mapped_column(String(40))
    size: Mapped[int] = mapped_column(Integer)
    review_outcome: Mapped[str | None] = mapped_column(String(24), nullable=True)
    review_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_by: Mapped[str | None] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispute_id: Mapped[int] = mapped_column(ForeignKey("disputes.id"), index=True)
    model_version: Mapped[str | None] = mapped_column(String(40), nullable=True)
    ai_available: Mapped[bool] = mapped_column(Boolean, default=False)
    predicted_category: Mapped[str | None] = mapped_column(String(32), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    requires_human_review: Mapped[bool] = mapped_column(Boolean, default=True)
    reason_codes: Mapped[list] = mapped_column(JSON, default=list)
    explanation: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class ValidationFinding(Base):
    __tablename__ = "validation_findings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispute_id: Mapped[int] = mapped_column(ForeignKey("disputes.id"), index=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("ai_analyses.id"), index=True)
    rule_id: Mapped[str] = mapped_column(String(40))
    severity: Mapped[str] = mapped_column(String(10))
    kind: Mapped[str] = mapped_column(String(32))
    explanation: Mapped[str] = mapped_column(Text)
    fields: Mapped[list] = mapped_column(JSON, default=list)
    source_ids: Mapped[list] = mapped_column(JSON, default=list)
    next_step: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Recommendation(Base):
    __tablename__ = "resolution_recommendations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispute_id: Mapped[int] = mapped_column(ForeignKey("disputes.id"), index=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("ai_analyses.id"), index=True)
    action: Mapped[str] = mapped_column(String(60))
    explanation: Mapped[str] = mapped_column(Text)
    missing_information: Mapped[list] = mapped_column(JSON, default=list)
    review_reasons: Mapped[list] = mapped_column(JSON, default=list)
    requires_human_review: Mapped[bool] = mapped_column(Boolean, default=True)
    low_risk_eligible: Mapped[bool] = mapped_column(Boolean, default=False)
    execution_mode: Mapped[str] = mapped_column(String(20), default="ADVISORY_ONLY")
    rule_version: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CaseComment(Base):
    __tablename__ = "case_comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispute_id: Mapped[int] = mapped_column(ForeignKey("disputes.id"), index=True)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    kind: Mapped[str] = mapped_column(String(20))  # NOTE | INFO_REQUEST | CUSTOMER_REPLY
    visible_to_customer: Mapped[bool] = mapped_column(Boolean, default=False)
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Notification(Base):
    __tablename__ = "notifications"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    dispute_id: Mapped[int | None] = mapped_column(ForeignKey("disputes.id"), nullable=True)
    message: Mapped[str] = mapped_column(String(255))
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(20), nullable=True)
    action: Mapped[str] = mapped_column(String(60), index=True)
    entity_type: Mapped[str] = mapped_column(String(30))
    entity_id: Mapped[str] = mapped_column(String(40))
    dispute_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    detail: Mapped[dict] = mapped_column(JSON, default=dict)
    request_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
