# MeetScribe 🎙️✨

MeetScribe is an AI-powered meeting management web application that seamlessly integrates with **Google Meet** and **Google Calendar**. It aggregates your meetings, lets you jump directly into sessions, captures speech, converts it to text in real-time, and leverages AI to generate rich meeting documentation, action items, executive summaries, and study flashcards.

Repository: [https://github.com/JayrajsinhBhatti/MeetScribe](https://github.com/JayrajsinhBhatti/MeetScribe)

---

## 🌟 Key Features

- **Google OAuth 2.0 Integration**: Secure login and authorization to read Google Calendar events.
- **Calendar & Meeting Sync**: Unified view of upcoming and past Google Meet sessions.
- **In-App Quick Join**: Direct 1-click meeting launcher.
- **Audio Capture & Real-Time STT**: Browser-level audio recording streaming to Speech-to-Text.
- **AI-Powered Analysis**:
  - 📝 **Structured Meeting Document**: Detailed notes with timestamps and speaker context.
  - 📋 **Executive Summary**: High-level takeaways.
  - 📌 **Important Points**: Key discussion highlights.
  - ✅ **Action Items**: Task assignments with assignees and deadlines.
  - 🔑 **Key Decisions**: Crucial choices ratified during the meeting.
  - 🧠 **Flashcards**: Interactive Q&A flashcards for rapid knowledge retention.
- **Export & Share**: Download notes in PDF, Markdown, and DOCX formats or share via secure link.

---

## 🏗️ Architecture & Tech Stack

```
MeetScribe/
├── backend/                  # FastAPI + Python REST API
│   ├── app/
│   │   ├── api/              # API endpoints (v1 routes: auth, meetings, calendar)
│   │   ├── core/             # Security, JWT, OAuth configuration
│   │   ├── models/           # Beanie ODM models (User, Meeting, Transcript, AIOutput)
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   ├── services/         # Business logic (Calendar, Speech-to-Text, AI)
│   │   ├── config.py         # App configuration via Pydantic BaseSettings
│   │   ├── database.py       # Motor + Beanie MongoDB connection setup
│   │   └── main.py           # FastAPI entry point & CORS middleware
│   ├── .env.example          # Backend environment variable template
│   ├── requirements.txt      # Python dependencies
│   ├── test_db.py            # MongoDB connection verification script
│   └── README.md
│
├── frontend/                 # Vite + React + TypeScript Single Page Application
│   ├── src/
│   │   ├── assets/           # Static images, icons, illustrations
│   │   ├── components/       # Reusable UI widgets
│   │   ├── context/          # React Context providers (AuthContext, etc.)
│   │   ├── hooks/            # Custom hooks (useAudio, useAuth, etc.)
│   │   ├── pages/            # View components (Dashboard, MeetingDetail, Login)
│   │   ├── services/         # API clients (Axios, WebSockets)
│   │   ├── types/            # Frontend TypeScript definitions
│   │   ├── utils/            # Client-side utility functions
│   │   ├── App.tsx           # Root application component
│   │   ├── index.css         # Global styles
│   │   └── main.tsx          # Application bootstrap
│   ├── .env.example          # Frontend environment variable template
│   ├── .eslintrc.json        # ESLint config
│   ├── .prettierrc           # Prettier config
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore                # Root gitignore
├── .env.example              # Consolidated environment variable template
├── PROJECT_REQUIREMENTS.md   # Detailed system specifications & data models
└── IMPLEMENTATION_PLAN_3WEEKS.md # Day-by-day 3-week execution roadmap
```

### Technology Highlights

| Layer | Stack |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Vanilla CSS / Tailwind CSS |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | MongoDB & Beanie ODM (Motor async driver) |
| **Authentication** | Google OAuth 2.0, Authlib, JWT (python-jose) |
| **APIs & AI** | Google Calendar API v3, Google Cloud Speech-to-Text / Whisper, Google Gemini API / OpenAI GPT-4 |
| **Code Quality** | Pydantic strict typing, Pytest |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Python**: 3.11+
- **Node.js**: v20.x or v24.x & **npm**
- **Git**
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/JayrajsinhBhatti/MeetScribe.git
cd MeetScribe
```

#### 2. Backend Setup (FastAPI + Python)
```bash
cd backend

# Create & activate virtual environment (Windows PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
Copy-Item .env.example .env

# Run backend development server
uvicorn app.main:app --reload --port 5000
```
The backend server runs on `http://localhost:5000` by default.  
- Health check: `http://localhost:5000/health`  
- Swagger API Docs: `http://localhost:5000/docs`

#### 3. Frontend Setup (React + Vite)
In a separate terminal:
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
Copy-Item .env.example .env

# Run frontend development server
npm run dev
```
The frontend dev server will start at `http://localhost:5173`.

---

## 📜 Available Scripts

### Backend (`/backend`)
- `uvicorn app.main:app --reload --port 5000`: Starts FastAPI development server with hot reload.
- `python test_db.py`: Verifies MongoDB connection and Beanie document models.
- `pytest`: Runs test suite.

### Frontend (`/frontend`)
- `npm run dev`: Starts Vite local development server with HMR.
- `npm run build`: Types-checks and bundles the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Checks frontend code using ESLint.
- `npm run format`: Formats frontend code using Prettier.

---

## 📋 Roadmap & Implementation

Refer to [IMPLEMENTATION_PLAN_3WEEKS.md](IMPLEMENTATION_PLAN_3WEEKS.md) for the complete 21-day task breakdown.

---

## 📄 License

This project is licensed under the ISC License.
