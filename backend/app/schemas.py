from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, EmailStr, Field, field_validator
from .enums import Cat, Role


class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=10, max_length=128)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class DisputeIn(BaseModel):
    transaction_id: str = Field(min_length=36, max_length=36)
    selected_category: str | None = None  # None / "HELP" = "Help me identify the issue"
    description: str = Field(min_length=15, max_length=2000)
    claimed_amount: Decimal | None = Field(default=None, gt=0, le=10_000_000, decimal_places=2)
    order_reference: str | None = Field(default=None, max_length=64)

    @field_validator("selected_category")
    @classmethod
    def _cat(cls, v):
        if v in (None, "", "HELP"):
            return None
        if v not in Cat.TRAINED:
            raise ValueError("Unknown category")
        return v


class InfoIn(BaseModel):
    message: str = Field(min_length=3, max_length=2000)


class ReviewIn(BaseModel):
    decision: Literal["APPROVE_RECOMMENDATION", "REJECT", "RESOLVE"]
    note: str = Field(min_length=3, max_length=2000)


class AssignIn(BaseModel):
    agent_id: str | None = None


class NoteIn(BaseModel):
    body: str = Field(min_length=1, max_length=2000)


class EvidenceReviewIn(BaseModel):
    outcome: Literal["ACCEPTED", "REJECTED", "NEEDS_BETTER_COPY"]
    note: str | None = Field(default=None, max_length=1000)


class ClassifyIn(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class AnalyzeTxnIn(BaseModel):
    transaction_id: str
    category: str | None = None


class RoleIn(BaseModel):
    role: Literal["CUSTOMER", "SUPPORT_AGENT", "ADMIN"]
