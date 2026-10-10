import os, secrets, logging
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
log = logging.getLogger("upiresolve")


class Settings:
    def __init__(self):
        self.env = os.getenv("ENV", "development")
        self.database_url = os.getenv("DATABASE_URL", f"sqlite:///{BASE / 'upiresolve.db'}")
        key = os.getenv("SECRET_KEY", "")
        if not key:
            if self.env == "production":
                raise RuntimeError("SECRET_KEY must be set in production")
            key = secrets.token_urlsafe(48)  # ephemeral dev key: sessions reset on restart
            log.warning("SECRET_KEY not set; using an ephemeral development key")
        self.secret_key = key
        self.token_minutes = int(os.getenv("TOKEN_MINUTES", "60"))
        self.cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
        self.upload_dir = Path(os.getenv("UPLOAD_DIR", str(BASE / "uploads")))
        self.model_dir = Path(os.getenv("MODEL_DIR", str(BASE / "model_store")))
        self.confidence_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.40"))
        self.max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))
        self.max_import_rows = int(os.getenv("MAX_IMPORT_ROWS", "1000"))
        self.auto_create_tables = os.getenv("AUTO_CREATE_TABLES", "true").lower() == "true"
        self.cookie_secure = self.env == "production"


settings = Settings()
