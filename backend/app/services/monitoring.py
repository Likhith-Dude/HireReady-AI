"""Sentry error tracking + structured logging. Gracefully no-ops without DSN."""
import logging
import time
from app.config import settings

logger = logging.getLogger(__name__)


def init_sentry():
    if not settings.sentry_dsn:
        logger.info("[Monitoring] Sentry not configured (no SENTRY_DSN). Errors logged locally.")
        return
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration
        from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            integrations=[FastApiIntegration(), SqlalchemyIntegration()],
            traces_sample_rate=0.2,
            environment="production" if "sqlite" not in settings.database_url else "development",
            send_default_pii=False,
        )
        logger.info("[Monitoring] Sentry initialized ✅")
    except Exception as e:
        logger.warning(f"[Monitoring] Sentry init failed: {e}")


def capture_exception(e: Exception, context: dict = None):
    try:
        import sentry_sdk
        with sentry_sdk.push_scope() as scope:
            if context:
                for k, v in context.items():
                    scope.set_extra(k, v)
            sentry_sdk.capture_exception(e)
    except Exception:
        logger.error(f"[Error] {type(e).__name__}: {e}")


def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # Silence noisy libs
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
