"""Reproducible baseline: TF-IDF + Logistic Regression.   Run:  python -m app.ml.train"""
import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from .preprocess import normalize
from .synthetic_data import generate
from ..enums import Cat
from ..config import settings

VERSION = "baseline-v1"


def _fit(rows, seed):
    vec = TfidfVectorizer(preprocessor=normalize, ngram_range=(1, 2), min_df=2, sublinear_tf=True)
    X = vec.fit_transform([r["text"] for r in rows])
    clf = LogisticRegression(max_iter=2000, C=4.0, class_weight="balanced", random_state=seed)
    clf.fit(X, [r["label"] for r in rows])
    return vec, clf


def train(output_dir: Path | None = None, seed: int = 42) -> dict:
    """Evaluation = 4-fold GroupKFold BY TEMPLATE: every score comes from a model that never saw that
    template's wording (no near-duplicate leakage). The shipped model is then fitted on all data."""
    out = Path(output_dir or settings.model_dir)
    out.mkdir(parents=True, exist_ok=True)
    rows = generate(seed)
    groups = [r["group"] for r in rows]
    y_true, y_pred = [], []
    for tr, te in GroupKFold(n_splits=4).split(rows, groups=groups):
        vec, clf = _fit([rows[i] for i in tr], seed)
        test = [rows[i] for i in te]
        y_true += [r["label"] for r in test]
        y_pred += list(clf.predict(vec.transform([r["text"] for r in test])))
    vec, clf = _fit(rows, seed)
    labels = [str(c) for c in clf.classes_]
    metrics = {
        "model_version": VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "data_source": "SYNTHETIC (template-generated; see docs/DATA.md)",
        "evaluation": "4-fold GroupKFold by template (held-out wording); shipped model is refit on all data",
        "n_train": len(rows), "n_test": len(y_true),
        "config": {"vectorizer": "tfidf(1-2gram,min_df=2,sublinear)", "classifier": "LogisticRegression(C=4, balanced)", "seed": seed},
        "macro_f1": round(float(f1_score(y_true, y_pred, average="macro")), 4),
        "per_class": classification_report(y_true, y_pred, output_dict=True, zero_division=0),
        "labels": list(Cat.TRAINED),
        "confusion_labels": labels,
        "confusion_matrix": confusion_matrix(y_true, y_pred, labels=labels).tolist(),
        "caveat": "Synthetic, template-based data. These numbers do NOT demonstrate real-world dispute/fraud detection accuracy.",
    }
    joblib.dump({"vectorizer": vec, "clf": clf, "version": VERSION}, out / f"{VERSION}.joblib")
    (out / "metrics.json").write_text(json.dumps(metrics, indent=2))
    return metrics


if __name__ == "__main__":
    m = train()
    print(f"Trained {m['model_version']}  macro-F1={m['macro_f1']}  train={m['n_train']} test={m['n_test']}")
    for k in m["labels"]:
        v = m["per_class"][k]
        print(f"  {k:26s} P={v['precision']:.2f} R={v['recall']:.2f} F1={v['f1-score']:.2f}")
