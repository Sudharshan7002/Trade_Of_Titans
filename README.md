# 🌐 Trade of Titans (TOT)

> **A real-time, high-concurrency multiplayer geopolitical trading and macroeconomic simulation platform.**

---

## 📖 Table of Contents
1. [Overview & Concept](#-overview--concept)
2. [Key Gameplay & System Features](#-key-gameplay--system-features)
3. [User Roles & How to Use the App](#-user-roles--how-to-use-the-app)
4. [Official Nation Credentials Cheat Sheet](#-official-nation-credentials-cheat-sheet)
5. [Quickstart: Run Locally](#-quickstart-run-locally)
6. [Deployment (Render + Vercel)](#-deployment-render--vercel)
7. [Scoring Formula & Game Theory](#-scoring-formula--game-theory)
8. [Automated Testing & Verification](#-automated-testing--verification)

---

## 🌍 Overview & Concept

**Trade of Titans** simulates global macroeconomics, bilateral commodities exchange, and economic warfare across **15 sovereign nations** and **Standby Alpha (The Black Market)** over **15 dynamic trading rounds**.

Delegates must negotiate trade pacts, meet national strategic import quotas, balance treasuries, capitalize on round-by-round **Sovereign Spotlight Perks**, and defend against **Covert Espionage Operations**.

---

## ✨ Key Gameplay & System Features

- **⚡ Dual-Mode Trading Engine**: Supports **Fiat Currency ($)** and direct **Commodity Barter Swaps** with automated double-entry inventory validation.
- **🎯 Strategic Import Quotas**: Every sovereign power has 3 distinct import requirements with live progress bars.
- **🌟 Sovereign Spotlight**: Each of the 15 rounds spotlights one specific nation with custom economic perks (e.g. Petrodollar Subsidies, Double Export Limits, Tariff Waivers) and bounty rewards.
- **🕵️ Black Market & Covert Operations**: Nations can contract the Black Market to execute targeted stockpile sabotage or purchase defensive Counter-Intelligence Shields with automated UN Tribunal broadcasts.
- **🔥 Resource Crises**: Dynamic market price shocks triggered dynamically per round (e.g. oil embargoes, mineral booms).
- **🏆 Instantaneous Leaderboard & Podium**: Sub-20ms batch scoring calculation tracking national wealth, gross exports, quota fulfillment, and trade quality.
- **🛡️ Concurrency & Double-Execution Protection**: 15-second deduplication guard and idempotent trade settlement preventing double-spending during heavy network traffic.

---

## 👥 User Roles & How to Use the App

| Role | Default Username | Default Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin` | `pordinno@123` | Start/end game, advance rounds, trigger market crises, monitor covert ops dispatches, reset tournament database. |
| **⚖️ Trading Center** | `trading_center` | `pordinno@123` | Central floor referee desk. Create and approve bilateral trades, execute barter deals, override round limits when authorized. |
| **📊 Ranking Desk** | `ranking` | `pordinno@123` | Full-screen spectator leaderboard and victory podium. Syncs live metrics across all 15 nations. |
| **🌐 Country Delegate** | *(e.g. `usa`, `germany`)* | *(See Table Below)* | View national treasury, track 3 quota progress bars, propose trades, buy Intel Shields, and launch Sabotage attacks. |

---

### How to Play / Run an Event (Step-by-Step):

1. **The Admin starts the Game**:
   - Log into `/login` as `admin` (`pordinno@123`).
   - Go to the **Admin Dashboard** and click **"Start Game"** and **"Start Round 1"**.
2. **Delegates negotiate on the floor**:
   - Delegates log in with their country accounts on mobile or laptop (`usa`, `china`, `brazil`, etc.).
   - They negotiate commodity swaps with other delegations to fulfill their 3 import quotas.
3. **Referees record trades**:
   - Delegates bring their agreed deal to the **Trading Center Desk** (`trading_center`).
   - The referee inputs the exporter, importer, commodity, quantity, and price/barter commodity and clicks **"Execute Trade"**.
   - Both countries' inventories, treasuries, and quota progress bars update instantly.
4. **Espionage (Optional Tactics)**:
   - Countries can visit the **Black Market (Covert Ops)** tab to buy an **Intel Shield ($40k)** or launch **Depot Sabotage ($60k)** on a rival.
   - If an attacker hits a shielded country, counter-intelligence unmasks the attacker and announces the scandal live to the summit!
5. **Round Completion & Victory**:
   - The Admin ends each round and starts the next round.
   - At the conclusion of Round 15, open the **Rankings Page** (`/rankings`) to reveal the Grand Champion on the 3D Gold/Silver/Bronze victory podium!

---

## 📋 Official Nation Credentials Cheat Sheet

The database comes pre-seeded with all 15 official nations ready for immediate play:

| Country | Username | Password | Starting Treasury | Initial Export Strengths |
| :--- | :--- | :--- | :--- | :--- |
| 🇺🇸 **USA** | `usa` | `Titan#US9482` | $400,000 | Grain, Electronics, Oil |
| 🇩🇪 **Germany** | `germany` | `Titan#DE6317` | $350,000 | Steel, Electronics, Timber |
| 🇨🇦 **Canada** | `canada` | `Titan#CA5183` | $320,000 | Timber, Oil, Grain |
| 🇦🇺 **Australia** | `australia` | `Titan#AU7729` | $300,000 | Gold, Livestock, Steel |
| 🇮🇳 **India** | `india` | `Titan#IN3841` | $310,000 | Spices, Medicine, Textiles |
| 🇨🇳 **China** | `china` | `Titan#CN8264` | $380,000 | Electronics, Steel, Textiles |
| 🇧🇷 **Brazil** | `brazil` | `Titan#BR4915` | $290,000 | Grain, Timber, Livestock |
| 🇷🇺 **Russia** | `russia` | `Titan#RU6038` | $340,000 | Oil, Steel, Timber |
| 🇮🇩 **Indonesia** | `indonesia` | `Titan#ID2750` | $270,000 | Spices, Textiles, Oil |
| 🇯🇵 **Japan** | `japan` | `Titan#JP9104` | $360,000 | Electronics, Medicine, Steel |
| 🇫🇷 **France** | `france` | `Titan#FR4482` | $330,000 | Medicine, Livestock, Grain |
| 🇰🇷 **South Korea** | `south_korea` | `Titan#KR1593` | $320,000 | Electronics, Steel, Medicine |
| 🇮🇹 **Italy** | `italy` | `Titan#IT7326` | $300,000 | Textiles, Livestock, Spices |
| 🇲🇽 **Mexico** | `mexico` | `Titan#MX8051` | $280,000 | Oil, Grain, Textiles |
| 🇸🇦 **Saudi Arabia**| `saudi_arabia` | `Titan#SA3927` | $420,000 | Oil, Gold, Spices |

*(Operator accounts `admin`, `trading_center`, and `ranking` all use password `pordinno@123`)*

---

## 💻 Quickstart: Run Locally

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & `npm`
- **PostgreSQL** (or Docker)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Sudharshan7002/Trade_Of_Titans.git
cd Trade_Of_Titans
```

### Step 2: Set Up Database (Docker or Local Postgres)
If using Docker:
```bash
docker compose up -d db
```
*(Or use any PostgreSQL instance and update `DATABASE_URL` in `.env`)*

### Step 3: Set Up Backend
```bash
# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and start server
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```
The FastAPI documentation will be live at `http://127.0.0.1:8000/docs`.

### Step 4: Set Up Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🚀 Deployment (Render + Vercel)

### Backend on Render:
1. Create a **Web Service** on [Render](https://render.com) pointing to this repository.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL / Supabase connection URL.
   - `SECRET_KEY`: A secure random secret string.
   - `CORS_ORIGINS`: Your frontend URL (e.g. `https://trade-of-titans.vercel.app,http://localhost:5173`).
   - `OPERATOR_PASSWORD`: `pordinno@123`

### Frontend on Vercel:
1. Import the `frontend` directory on [Vercel](https://vercel.com).
2. Framework Preset: **Vite**.
3. Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com`

---

## 📐 Scoring Formula & Game Theory

Final composite rankings are determined by 5 pillars:
$$\text{Final Score} = \text{Wealth Score} + \text{Export Volume} + \text{Quota Completion Score} + \text{Deal Bonuses} - \text{Deal Penalties}$$

1. **Wealth Score**: Cash Treasury Balance + Stockpile Valuation at current reference prices.
2. **Export Volume**: $1\text{ pt}$ per unit of goods exported to foreign nations.
3. **Quota Completion**: $1,000\text{ pts}$ per fully satisfied strategic national import objective.
4. **Deal Bonuses / Penalties**: Buying below reference values or selling above yields $+100\text{ pts}$ smart trader bonuses; overpaying or underselling incurs $-100\text{ pts}$ penalties.

---

## 🧪 Automated Testing & Verification

Run the full automated test suite (including trade limits, spotlight perks, covert operations, barter serialization, and concurrency deduplication):

```bash
# Run pytest backend test suite
pytest

# Type-check and build frontend
cd frontend
npm run build
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
