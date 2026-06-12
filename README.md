# HireReady AI

> AI-powered job hunting co-pilot for Likhith Dude — built with Next.js, FastAPI, and Google Gemini.

## Features

| Feature | Description |
|---|---|
| **Job Search** | Search live jobs from RemoteOK & Arbeitnow APIs by title/location |
| **One Click Apply** | Gemini AI tailors your resume + generates a cover letter instantly |
| **ATS Checker** | Score your resume 0–100 against any job description |
| **Interview Prep** | Generate top 10 questions + STAR answers for any role |
| **App Tracker** | Track all applications with status (Applied → Interview → Offer) |

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS (App Router)
- **Backend**: FastAPI + Python 3.11 + SQLAlchemy
- **AI**: Google Gemini 1.5 Flash
- **Database**: SQLite (local) / PostgreSQL (Docker/prod)
- **CI/CD**: GitHub Actions + Docker

## Quick Start (Local)

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set your Gemini API key
echo "GEMINI_API_KEY=your_key_here" >> .env

uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

App: http://localhost:3000

## Docker (Full Stack)

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_key_here

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Postgres: localhost:5432

## GitHub Actions Secrets

| Secret | Value |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

## API Endpoints

```
GET  /jobs/search?title=MLOps+Engineer&location=Remote
POST /ai/ats-check
POST /ai/one-click-apply
POST /ai/interview-prep
GET  /applications/
POST /applications/
PATCH /applications/{id}
DELETE /applications/{id}
```

## Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Add to `backend/.env` as `GEMINI_API_KEY=your_key`
