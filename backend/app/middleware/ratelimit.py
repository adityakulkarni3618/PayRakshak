from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

# Allow 5 requests per minute per IP for auth endpoints, 20 for public
limiter = Limiter(key_func=get_remote_address)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Determine which limiter to use based on path
        if request.url.path.startswith("/api/v1/auth") or request.url.path.startswith("/api/v1/disputes"):
            limit = "5/minute"
        else:
            limit = "20/minute"
        # Apply limit
        try:
            await limiter.limit(limit)(request)
        except Exception as exc:
            return Response(content=str(exc), status_code=429)
        return await call_next(request)
