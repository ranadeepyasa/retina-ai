import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Lightweight sliding-window rate limiter per client IP address.
    Does not require external Redis or Memcached dependencies.
    """
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        self.clients = defaultdict(list)

    def check(self, request: Request, custom_limit: int = None):
        limit = custom_limit or self.requests_per_minute
        # Resolve client IP
        client_ip = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()

        current_time = time.time()
        window_start = current_time - self.window_seconds

        # Filter out timestamps older than 60s
        timestamps = [ts for ts in self.clients[client_ip] if ts > window_start]
        
        if len(timestamps) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({limit} req/min). Please wait before retrying.",
                headers={"Retry-After": "30"}
            )

        timestamps.append(current_time)
        self.clients[client_ip] = timestamps

# Default instances for sensitive routes
auth_rate_limiter = InMemoryRateLimiter(requests_per_minute=15)
screening_rate_limiter = InMemoryRateLimiter(requests_per_minute=25)
