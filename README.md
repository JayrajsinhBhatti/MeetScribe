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
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/           # Database and third-party API configurations
│   │   ├── controllers/      # Express request handlers
│   │   ├── middlewares/      # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas (User, Meeting, Transcript, AIOutput)
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Calendar, Speech-to-Text, and AI services
│   │   ├── types/            # TypeScript interface definitions
│   │   ├── utils/            # Helper utilities and loggers
│   │   └── index.ts          # Server entry point
│   ├── .env.example          # Backend environment variable template
│   ├── .eslintrc.json        # ESLint config
│   ├── .prettierrc           # Prettier config
│   ├── package.json
│   └── tsconfig.json
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
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS / Vanilla CSS |
| **Backend** | Node.js (v20+ / v24), Express.js, TypeScript, nodemon |
| **Database** | MongoDB & Mongoose |
| **Authentication** | Google OAuth 2.0 (Passport.js) |
| **APIs & AI** | Google Calendar API v3, Google Cloud Speech-to-Text / Whisper, Google Gemini API / OpenAI GPT-4 |
| **Code Quality** | ESLint, Prettier, TypeScript strict mode |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v20.x or v24.x
- **npm**: v10.x or higher
- **Git**
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or a MongoDB Atlas URI

---

### Installation & Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/JayrajsinhBhatti/MeetScribe.git
cd MeetScribe
```

#### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your Google OAuth, MongoDB, and AI API keys
# Run backend development server
npm run dev
```
The backend server runs on `http://localhost:5000` by default.  
Test health check at `http://localhost:5000/health`.

#### 3. Frontend Setup
```bash
# Navigate to frontend directory (from project root)
cd ../frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run frontend development server
npm run dev
```
The frontend dev server will start at `http://localhost:5173`.

---

## 📜 Available Scripts

### Backend (`/backend`)
- `npm run dev`: Runs the backend in watch mode using `nodemon` and `ts-node`.
- `npm run build`: Compiles TypeScript to JavaScript in `/dist`.
- `npm start`: Runs the compiled production code.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run lint:fix`: Automatically fixes ESLint warnings and formatting issues.
- `npm run format`: Formats source files using Prettier.

### Frontend (`/frontend`)
- `npm run dev`: Starts Vite local development server with HMR.
- `npm run build`: Types-checks and bundles the application for production.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Checks frontend code using ESLint.
- `npm run lint:fix`: Auto-fixes linting issues.
- `npm run format`: Formats frontend code using Prettier.

---

## 📋 Roadmap & Implementation

Refer to [IMPLEMENTATION_PLAN_3WEEKS.md](IMPLEMENTATION_PLAN_3WEEKS.md) for the complete 21-day task breakdown:
- **Week 1**: Foundation, OAuth 2.0, Calendar API, Meetings API, and Dashboard UI.
- **Week 2**: Audio capture, Speech-to-Text streaming, and AI processing prompts/endpoints.
- **Week 3**: Export (PDF/Markdown/DOCX), sharing, full-text search, UI polish, and cloud deployment.

---

## 📄 License

This project is licensed under the ISC License.
