from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.services.monitoring import init_sentry, configure_logging
from app.middleware.security import SecurityMiddleware
from app.api import jobs, ai, applications, auth, resume, h1b, monitoring
from app.websocket import router as ws_router
import app.models

configure_logging()
init_sentry()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireReady AI",
    description="Production-grade AI job hunting platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Security middleware (rate limiting, headers, injection protection)
app.add_middleware(SecurityMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(applications.router)
app.include_router(resume.router)
app.include_router(h1b.router)
app.include_router(monitoring.router)
app.include_router(ws_router)


@app.get("/")
def root():
    return {"message": "HireReady AI v2.0 — Production Ready", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}
