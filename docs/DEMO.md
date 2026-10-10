# Demo guide (3 scenarios, all synthetic data)

Setup: `python -m scripts.seed` (prints demo passwords once), sign in as demo.customer@example.com.

**A. Failed payment**: transaction SYN000002 (FAILED, reversal UNKNOWN). Report: "Payment failed but the money was debited."
Expect: classification, finding that the record is unverified, action VERIFY_REVERSAL_STATUS, case under review.
**B. Duplicate payment**: SYN000004 appears twice with the same reference. Expect finding R001 and COMPARE_REFERENCES_AND_SETTLEMENT.
**C. Unauthorized**: SYN000005. Expect ESCALATED, unverified-allegation finding, pointer to official reporting channels.

Then sign in as demo.agent@example.com: assign, request information, review evidence, approve, resolve. Show the customer's
timeline updating, then the admin audit log. Also show: stop the model (rename `model_store/baseline-v1.joblib`) and submit again to show
the honest "AI unavailable" behaviour.

Be upfront with judges: synthetic data, advisory-only, no live UPI integration.
