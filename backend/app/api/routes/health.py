from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SessionDep
from app.core.cache import ping_redis

router = APIRouter(tags=["Saúde"])


@router.get("/health")
async def health(session: SessionDep):
    """Liveness/readiness: o banco é obrigatório; o Redis é opcional (só degrada)."""
    await session.execute(text("SELECT 1"))
    redis_ok = await ping_redis()
    return {"status": "ok", "database": "up", "redis": "up" if redis_ok else "down"}
