from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import jobs, ai, applications
import app.models  # ensure models are registered

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HireReady AI",
    description="AI-powered job hunting platform for Likhith Dude",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(applications.router)


@app.get("/")
def root():
    return {"message": "HireReady AI API is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
