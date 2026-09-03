import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://tot:tot_password@localhost:5432/trade_of_titans",
)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine_options = {}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
    if DATABASE_URL == "sqlite://":
        engine_options["poolclass"] = StaticPool
else:
    # High-concurrency pool configuration for PostgreSQL (supports 15-25 concurrent delegates)
    # prepare_threshold: None disables prepared statements on pooled Postgres (Supabase/PgBouncer transaction mode)
    engine_options.update({
        "pool_size": 20,
        "max_overflow": 20,
        "pool_timeout": 15,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
        "connect_args": {
            "prepare_threshold": None
        },
    })

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
