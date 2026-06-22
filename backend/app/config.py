"""
Centralized application configuration.

Reads values from environment variables (and a local .env file in development).
Every other module in the app should import `settings` from here instead of
calling os.getenv() directly. This gives us:
  - one source of truth
  - type validation at startup (app crashes immediately if something is misconfigured,
    instead of failing weirdly mid-request later)
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---- Database ----
    DATABASE_URL: str

    # ---- JWT Auth ----
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # ---- Gemini ----
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ---- Embeddings ----
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ---- Storage ----
    UPLOAD_DIR: str = "storage/uploaded_pdfs"
    VECTOR_STORE_DIR: str = "storage/vector_store"
    MAX_UPLOAD_SIZE_MB: int = 20

    # ---- App / CORS ----
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Singleton instance imported across the app: `from app.config import settings`
settings = Settings()
