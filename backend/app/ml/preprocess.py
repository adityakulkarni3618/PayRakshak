import re

_WS = re.compile(r"\s+")
_AMT = re.compile(r"(?:rs\.?|inr|₹)\s*[\d,]+(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\b", re.I)
MAX_LEN = 2000


def normalize(text: str) -> str:
    """Lowercase, mask amounts (so the model cannot key on specific numbers), collapse whitespace."""
    t = (text or "")[:MAX_LEN].lower()
    t = _AMT.sub(" amt ", t)
    t = re.sub(r"[^a-z\s']", " ", t)
    return _WS.sub(" ", t).strip()
