"""Provider Integration Adapter Pattern for UPI transaction verification.

Rule: 'PROVIDER_VERIFIED' is strictly reserved for real or mock provider adapters.
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.models import TransactionSource, TransactionStatus

class BaseProviderAdapter(ABC):
    @abstractmethod
    def verify_transaction(self, upi_ref: str) -> Optional[Dict[str, Any]]:
        """Verify transaction status directly with UPI Switch / Bank Provider API."""
        pass

    @abstractmethod
    def check_reversal_status(self, upi_ref: str) -> Optional[Dict[str, Any]]:
        """Check if a pending or failed transaction has been reversed by NPCI."""
        pass


class MockNPCIProviderAdapter(BaseProviderAdapter):
    """Mock Provider Adapter simulating real-time NPCI/Bank API verification calls."""
    
    def __init__(self, simulate_latency_ms: int = 50):
        self.simulate_latency_ms = simulate_latency_ms

    def verify_transaction(self, upi_ref: str) -> Optional[Dict[str, Any]]:
        if not upi_ref:
            return None
            
        # Simulate NPCI switch verification response
        return {
            "upi_ref": upi_ref,
            "provider_status": TransactionStatus.SUCCESS.value,
            "provenance": TransactionSource.PROVIDER_VERIFIED.value,
            "npci_response_code": "00",
            "npci_txn_id": f"NPCI-{upi_ref}",
            "verified": True,
            "bank_rrn": upi_ref,
        }

    def check_reversal_status(self, upi_ref: str) -> Optional[Dict[str, Any]]:
        if not upi_ref:
            return None

        return {
            "upi_ref": upi_ref,
            "reversal_initiated": True,
            "reversal_status": "COMPLETED",
            "npci_reversal_ref": f"REV-{upi_ref}",
            "provenance": TransactionSource.PROVIDER_VERIFIED.value,
        }

# Singleton default instance
provider_adapter = MockNPCIProviderAdapter()
