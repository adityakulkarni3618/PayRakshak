# Training data card

**Source:** 100% synthetic. `backend/app/ml/synthetic_data.py` holds 8 hand-written complaint templates per category (64 total),
expanded with random amounts, merchant names, greetings and closing phrases (12 variants each, 768 samples).

**Categories trained:** the 8 categories in `Cat.TRAINED`. `NEEDS_CLARIFICATION` is not a trained class; it is returned when
top-class probability is below `CONFIDENCE_THRESHOLD` (default 0.40) or the text is too short.

**Leakage control:** evaluation uses 4-fold GroupKFold *by template*, so every score comes from a model that never saw that
wording. The shipped model is refit on all data. Amounts are masked during preprocessing so the model cannot key on numbers.

**Reading the numbers:** `python -m app.ml.train` prints macro-F1 and per-class precision/recall; `model_store/metrics.json`
holds the confusion matrix. With only 8 templates per class, held-out-wording macro-F1 is modest (about 0.5 when this project
was generated). Real complaints will differ from these templates, so these numbers do NOT show real-world accuracy.

**How to improve:** add real, consented, de-identified complaints; add Hindi/Marathi/Hinglish text; widen templates; then
re-run training and re-calibrate the threshold. Consider a multilingual transformer only if it beats this baseline on held-out data.

**Anomaly detection:** deterministic rules plus a robust median/MAD amount outlier check that only runs with 30+ prior
transactions. No Isolation Forest is trained: there is no real transaction history to justify it.
