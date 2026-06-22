"""
FastAPI application entrypoint.

Run with:
    uvicorn app.main:app --reload

This file:
  1. Creates the FastAPI app instance.
  2. Configures CORS so the React frontend can call this API from a different origin.
  3. Registers all route modules (added incrementally in later phases).
  4. Exposes a /health endpoint to verify the server is alive.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.utils.logger import logger
from app.routes import auth_routes, document_routes, chat_routes, dashboard_routes

app = FastAPI(
    title="RAG Chatbot API",
    description="AI-Powered Document Q&A System backend",
    version="1.0.0",
)

# ---- CORS ----
# Allows the frontend (running on a different origin, e.g. http://localhost:5173)
# to make requests to this API. In production this is set to the deployed
# Vercel URL via the FRONTEND_URL env var.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """Simple endpoint to confirm the API is running."""
    return {"status": "ok", "environment": settings.APP_ENV}


@app.get("/", tags=["Health"])
def root():
    return {"message": "RAG Chatbot API is running. See /docs for API documentation."}


# ---- Route registration ----
# All backend routes are now registered. This completes the API surface
# for: authentication, document management, RAG-powered chat, and the
# dashboard summary endpoint.
app.include_router(auth_routes.router)
app.include_router(document_routes.router)
app.include_router(chat_routes.router)
app.include_router(dashboard_routes.router)

logger.info("FastAPI app initialized. Environment: %s", settings.APP_ENV)
