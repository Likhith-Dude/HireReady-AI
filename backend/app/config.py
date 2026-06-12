from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    # SQLite for local dev, PostgreSQL via env var in Docker/prod
    database_url: str = "sqlite:///./hireready.db"
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:3000"
    secret_key: str = "dev-secret"

    class Config:
        env_file = ".env"


settings = Settings()
