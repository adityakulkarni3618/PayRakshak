import json, logging
from pathlib import Path
import joblib, numpy as np
from ..config import settings
from ..enums import Cat

log = logging.getLogger("upiresolve.ml")
VERSION = "baseline-v1"


class ClassifierService:
    def __init__(self, model_dir: Path | None = None, threshold: float | None = None):
        self.model_dir = Path(model_dir or settings.model_dir)
        self.threshold = threshold if threshold is not None else settings.confidence_threshold
        self._bundle = None

    def load(self) -> bool:
        try:
            self._bundle = joblib.load(self.model_dir / f"{VERSION}.joblib")
            return True
        except Exception as e:  # missing/corrupt model: fail safe, never invent predictions
            log.warning("Model unavailable (%s)", type(e).__name__)
            self._bundle = None
            return False

    def unload(self):
        self._bundle = None

    @property
    def available(self) -> bool:
        return self._bundle is not None

    def status(self) -> dict:
        metrics, mp = None, self.model_dir / "metrics.json"
        if mp.exists():
            m = json.loads(mp.read_text())
            metrics = {k: m.get(k) for k in ("macro_f1", "n_train", "n_test", "data_source", "caveat", "trained_at")}
        return {"available": self.available, "model_version": VERSION if self.available else None,
                "confidence_threshold": self.threshold, "training_metrics": metrics}

    def predict(self, text: str) -> dict | None:
        """Returns None when the model is unavailable (callers must not fabricate a prediction)."""
        if not self.available:
            return None
        b = self._bundle
        X = b["vectorizer"].transform([text])
        if X.nnz < 2:
            return self._result(Cat.CLARIFY, 0.0, True, ["INSUFFICIENT_TEXT"], [])
        probs = b["clf"].predict_proba(X)[0]
        i = int(np.argmax(probs))
        top, conf = str(b["clf"].classes_[i]), float(probs[i])
        contrib = X.toarray()[0] * b["clf"].coef_[i]
        names = b["vectorizer"].get_feature_names_out()
        terms = [str(names[j]) for j in np.argsort(contrib)[::-1][:3] if contrib[j] > 0]
        low = conf < self.threshold
        return self._result(Cat.CLARIFY if low else top, conf, low, ["LOW_MODEL_CONFIDENCE"] if low else [], terms, top)

    def _result(self, cat, conf, review, reasons, terms, raw=None):
        return {"predicted_category": cat, "raw_top_category": raw, "model_version": VERSION,
                "confidence": round(conf, 4), "requires_human_review": review,
                "reason_codes": reasons, "matched_terms": terms,
                "confidence_note": "Confidence in the predicted category only. It is not the probability of fraud or that the complaint is genuine."}


classifier = ClassifierService()
