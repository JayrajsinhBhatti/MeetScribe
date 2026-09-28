# MeetScribe Backend (FastAPI + Python) 🚀

This is the backend service for **MeetScribe**, built with **FastAPI**, **Motor & Beanie ODM**, and **MongoDB**.

---

## 🛠️ Requirements

- **Python**: 3.10+ (Recommended: Python 3.11)
- **MongoDB**: Running instance locally on `mongodb://localhost:27017` or MongoDB Atlas.

---

## 🚀 Setup & Installation

### 1. Create and Activate Virtual Environment

```bash
cd backend

# On Windows (PowerShell)
python -m venv .venv
.venv\Scripts\Activate.ps1

# On macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

Configure your `MONGODB_URI`, `GOOGLE_CLIENT_ID`, and other keys in `.env`.

---

## 🏃 Running the Application

### Start Development Server

```bash
uvicorn app.main:app --reload --port 5000
```

The API will be available at:
- **Base API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`
- **Interactive Swagger Docs**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/redoc`

### Test Database Connection

```bash
python test_db.py
```

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Google OAuth 2.0 endpoints
│   │       ├── calendar.py      # Google Calendar sync
│   │       ├── meetings.py      # Meeting management CRUD
│   │       └── router.py        # Master v1 router
│   ├── core/
│   │   └── security.py          # JWT creation & current user dependency
│   ├── models/                  # Beanie MongoDB Document models
│   │   ├── ai_output.py
│   │   ├── meeting.py
│   │   ├── transcript.py
│   │   └── user.py
│   ├── schemas/                 # Pydantic request/response schemas
│   │   ├── auth.py
│   │   ├── meeting.py
│   │   ├── transcript.py
│   │   └── user.py
│   ├── services/                # Business logic services
│   │   ├── ai_service.py
│   │   ├── calendar_service.py
│   │   └── stt_service.py
│   ├── config.py                # Pydantic Settings
│   ├── database.py              # Motor & Beanie initialization
│   └── main.py                  # FastAPI application entry point
├── requirements.txt             # Python dependencies
├── test_db.py                   # DB verification script
├── .env.example
└── README.md
```
