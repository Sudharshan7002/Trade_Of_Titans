import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
import app.models
from app.routers import (
    countries,
    resources,
    inventory,
    import_objectives,
    rounds,
    trades,
    crises,
    rankings,
    game,
    auth,
    users,
    country_portal,
    trading_center,
    trade_confirmation,
    admin_dashboard,
    objectives,
)



@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Ensure tables and default accounts exist on startup (seamless on Supabase/Render)
    try:
        from app.database import engine, SessionLocal
        from app.models.base import Base
        from app.models.user import User
        from app.core.security import hash_password
        from app.seed import DEFAULT_USERS

        Base.metadata.create_all(bind=engine)

        from sqlalchemy import text
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE rounds ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10"))
                conn.execute(text("ALTER TABLE rounds ADD COLUMN IF NOT EXISTS ends_at_timestamp FLOAT"))
                conn.commit()
            except Exception:
                pass

        db = SessionLocal()
        # Auto-seed full tournament if database has 0 countries (e.g. fresh Supabase deployment)
        from app.models.country import Country
        if db.query(Country).count() == 0:
            from app.seed_tournament import seed_tournament
            print("Fresh database detected: Bootstrapping official tournament data...")
            seed_tournament()
        else:
            for username, password, role in DEFAULT_USERS:
                existing = db.query(User).filter(User.username == username).first()
                if not existing:
                    db.add(User(
                        username=username,
                        password_hash=hash_password(password),
                        role=role,
                    ))
                elif os.getenv(f"{username.upper()}_PASSWORD"):
                    # Update password if explicitly configured in environment
                    existing.password_hash = hash_password(password)
            db.commit()
        db.commit()
    except Exception as e:
        print(f"Database bootstrap notice: {e}")
    finally:
        db.close()
    yield


app = FastAPI(title="Trade of Titans", lifespan=lifespan)

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)

app.include_router(countries.router)
app.include_router(resources.router)
app.include_router(inventory.router)
app.include_router(import_objectives.router)
app.include_router(rounds.router)
app.include_router(trades.router)
app.include_router(crises.router)
app.include_router(rankings.router)
app.include_router(game.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(country_portal.router)
app.include_router(trading_center.router)
app.include_router(
    trade_confirmation.router
)
app.include_router(
    admin_dashboard.router
)
app.include_router(objectives.router)


@app.get("/")
def root():
    return {"message": "Trade of Titans backend is running"}


@app.get("/db-test")
def db_test(db: Session = Depends(get_db)):
    result = db.execute(text("SELECT 1"))
    return {"database": result.scalar()}
