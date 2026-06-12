from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database — SQLite default, override with DATABASE_URL=postgresql://...
    database_url: str = "sqlite:///./hireready.db"

    # AI providers
    groq_api_key: str = ""
    openai_api_key: str = ""          # backup AI provider

    # Auth
    secret_key: str = "hireready-dev-secret-change-in-prod"
    access_token_expire_minutes: int = 60 * 24 * 7    # 7 days
    refresh_token_expire_days: int = 30

    # OAuth (optional — leave empty to disable)
    google_client_id: str = ""
    google_client_secret: str = ""
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    oauth_redirect_base: str = "http://localhost:3000"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Redis (optional — falls back to in-memory cache)
    redis_url: str = ""

    # Email — SendGrid (optional)
    sendgrid_api_key: str = ""
    email_from: str = "noreply@hireready.ai"
    email_from_name: str = "HireReady AI"

    # Sentry (optional)
    sentry_dsn: str = ""

    # Job source API keys (all optional — sources degrade gracefully)
    usajobs_api_key: str = ""         # register free at developer.usajobs.gov
    usajobs_email: str = ""
    adzuna_app_id: str = ""           # free at developer.adzuna.com
    adzuna_api_key: str = ""
    rapidapi_key: str = ""            # for JSearch (LinkedIn/Indeed scraper)

    # H1B data
    h1b_data_path: str = "./data/h1b_sponsors.json"

    class Config:
        env_file = ".env"


settings = Settings()
