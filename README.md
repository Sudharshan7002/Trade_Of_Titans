# Trade of Titans

Trade of Titans is a FastAPI trading-game backend with a React/Vite operations console for country delegates, the trading center, and administrators.

## Run locally

1. Start PostgreSQL with `docker compose up -d db`.
2. Copy `.env.example` to `.env` and set a production-safe `SECRET_KEY` if needed.
3. Apply the schema with `alembic upgrade head`.
4. Start the API: `.venv\\Scripts\\uvicorn app.main:app --reload`.
5. In another terminal, copy `frontend/.env.example` to `frontend/.env` (optional for the local proxy), then run `npm run dev` from `frontend`.
6. Open `http://localhost:5173`.

The Vite proxy forwards API requests to `http://127.0.0.1:8000`. For a separately hosted API, set `VITE_API_BASE_URL`; the backend allows the origins in `CORS_ORIGINS`.

## Initial access

To reset local data completely, run `.venv\Scripts\python -m app.seed`. This deletes countries, resources, inventories, objectives, rounds, trades, rankings, and game state, then retains only the default operator accounts:
- `admin` / `admin123` (Admin Supreme Control)
- `trading_center` / `trading123` (Trading Desk & Direct Settlement)
- `ranking` / `ranking123` (Global Standings & Podium)

Change these passwords using any of the methods below before using the app beyond local development:
- **CLI Command** (instant without wiping data):
  ```powershell
  .venv\Scripts\python -m app.change_password <username> <new_password>
  # Example:
  .venv\Scripts\python -m app.change_password admin my_new_password
  ```
- **Environment Variables** (in `.env` or Render settings):
  Set `ADMIN_PASSWORD`, `TRADING_CENTER_PASSWORD`, and/or `RANKING_PASSWORD`. The app will automatically sync them on startup.

The Admin dashboard enrolls countries and creates matching country logins automatically, and provides market setup for resources, stockpiles, and import objectives.

## Running in VS Code

You can run both services directly from VS Code:

### Option A: Using Two VS Code Terminals
1. Open the project root folder `TOT` in VS Code (`File -> Open Folder...`).
2. Open terminal #1 (`Ctrl + ` `) and run the backend:
   ```powershell
   .venv\Scripts\uvicorn app.main:app --reload --port 8000
   ```
3. Split or open terminal #2 (`+`) and run the frontend:
   ```powershell
   cd frontend
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`.

### Option B: Using VS Code Tasks
Press `Ctrl + Shift + P` -> **Tasks: Run Task** -> **Start Full Stack (Backend + Frontend)**.

## Verification

Run backend integration tests with `.venv\Scripts\pytest`. Run `npm run build` in `frontend` to type-check and produce a production build.

