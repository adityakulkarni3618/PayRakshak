import time
from collections import defaultdict, deque
from fastapi import HTTPException

_hits: dict[str, deque] = defaultdict(deque)


def check(key: str, limit: int, window: int = 60):
    """In-memory limiter (single process). Use Redis or a gateway limiter when running multiple workers."""
    now, q = time.monotonic(), _hits[key]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(429, "Too many attempts. Please wait a minute and try again.")
    q.append(now)


def reset():
    _hits.clear()
