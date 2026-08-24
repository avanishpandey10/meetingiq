# 🧠 MeetingIQ — AI Meeting Intelligence & Action Tracker

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="build status" />
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="license" />
  <img src="https://img.shields.io/badge/frontend-React%2018-61DAFB?logo=react" alt="react" />
  <img src="https://img.shields.io/badge/backend-Node.js%20%2B%20Express-339933?logo=node.js" alt="node" />
  <img src="https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb" alt="mongodb" />
  <img src="https://img.shields.io/badge/AI-Groq%20Whisper%20%2B%20Llama-orange" alt="groq" />
</p>

<p align="center">
  <b>Turn raw meeting audio into structured, actionable intelligence — automatically.</b>
</p>

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [File Structure](#-file-structure)
- [Technology Stack](#-technology-stack)
- [System Workflow](#-system-workflow)
- [AI/LLM Approach](#-aillm-approach)
- [Prompt Engineering](#-prompt-engineering)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Demo Mode](#-demo-mode)
- [License](#-license)

---

## 🎯 Problem Statement

Meetings generate a huge amount of valuable information — but most of it is lost immediately afterward:

- 📉 **Lost information** — key discussion points are forgotten within hours
- ❓ **No action item tracking** — tasks are agreed upon but never followed up
- 🧩 **Decisions get forgotten** — no single source of truth for what was decided and why
- 🕵️ **No automated intelligence extraction** — teams rely on manual notes that are inconsistent and incomplete

---

## 💡 Solution

**MeetingIQ** solves this by turning any meeting recording into structured, actionable intelligence:

- 🤖 AI-powered meeting analysis using state-of-the-art speech and language models
- 🗂️ Structured intelligence extraction — decisions, action items, risks, and open questions
- ✅ Actionable insights delivered directly to a dashboard, with owners, deadlines, and priorities

---

## ✨ Key Features

### 🧠 Core Intelligence
- 🎙️ Audio transcription with **Groq Whisper**
- 📝 Executive summary generation
- ✅ Decision extraction with confidence scores
- 📋 Action item extraction (owner, deadline, priority)
- ⚠️ Risk and blocker identification
- ❓ Open questions tracking
- 🗂️ Topic segmentation
- 📊 Meeting effectiveness scoring (0–100)

### 🚀 Advanced Features
- 💬 **Ask Your Meeting** — grounded Q&A over the transcript
- 📈 Speaker analytics with charts
- 🕒 Meeting timeline
- 🔍 Transcript search and filtering
- 🔄 Action item tracking with status updates
- 📤 Export reports (JSON, Text, HTML)
- 🎭 Demo mode with mock data (no API key required)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                            CLIENT (React)                        │
│  ┌───────────┐  ┌────────────┐  ┌───────────┐  ┌─────────────┐   │
│  │ Dashboard │  │  Upload UI │  │  Meeting  │  │   History   │   │
│  │           │  │            │  │   View    │  │             │   │
│  └─────┬─────┘  └──────┬─────┘  └─────┬─────┘  └──────┬──────┘   │
│        └───────────────┴──────┬───────┴───────────────┘          │
│                        Axios (REST API)                          │
└───────────────────────────────┬────────────────────────────────-┘
                                 │
┌───────────────────────────────▼────────────────────────────────-┐
│                       SERVER (Node.js + Express)                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────────┐   │
│  │  Routes    │→│ Controllers │→│        Services            │   │
│  └────────────┘  └─────────────┘  │  ┌─────┐ ┌─────┐ ┌──────┐ │   │
│                                    │  │ ASR │ │ LLM │ │Pipe- │ │   │
│                                    │  │     │ │     │ │line  │ │   │
│                                    │  └─────┘ └─────┘ └──────┘ │   │
│                                    └──────────────┬────────────┘  │
└───────────────────────────────────────────────────┼──────────────┘
                                                      │
                        ┌─────────────────────────────┼───────────────┐
                        ▼                              ▼               │
              ┌──────────────────┐          ┌──────────────────────┐  │
              │   AI PIPELINE     │          │      DATABASE        │  │
              │ Groq Whisper (ASR)│          │   MongoDB (Mongoose) │  │
              │ Groq Llama (LLM)  │          │  Meetings/Transcripts│  │
              └──────────────────┘          │  Analysis/ActionItems│  │
                                              └──────────────────────┘
```

---

## 📁 File Structure

```
meetingiq/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   ├── meeting/
│   │   │   └── history/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   └── index.html
├── server/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   │   ├── asr/
│   │   ├── llm/
│   │   └── pipeline/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── prompts/
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Recharts, Axios |
| Backend | Node.js, Express, Mongoose, Multer |
| Database | MongoDB |
| AI/ML | Groq Whisper (ASR), Groq Llama (LLM) |
| Authentication | Not required (local app) |

---

## 🔄 System Workflow

1. **User uploads audio file** via the web client
2. **File validation** (format, size) on the server
3. **ASR transcription** using Groq Whisper
4. **Transcript cleaning** to remove noise and filler artifacts
5. **Speaker segmentation** to attribute dialogue
6. **Intelligence extraction** via a single combined LLM call
7. **Data storage** in MongoDB (Meeting, Transcript, Analysis, ActionItem)
8. **Dashboard rendering** with summaries, action items, and analytics

---

## 🤖 AI/LLM Approach

- **Single combined LLM call** for all analysis (summary, decisions, action items, risks, questions, scoring) — reduces latency and cost
- **Anti-hallucination measures** — the model is instructed to only report what is explicitly present in the transcript
- **Confidence scores** attached to extracted decisions and action items
- **Source attribution** — each insight is linked back to a transcript timestamp/segment

---

## 🧾 Prompt Engineering

- **Role-based prompts** — the LLM is framed as a meeting analyst with a defined scope
- **Strict JSON schema** — output is constrained to a predictable, parseable structure
- **Anti-hallucination rules** — explicit instructions to avoid fabricating names, dates, or commitments
- **Timestamp requirements** — every extracted item must reference its position in the transcript

---

## 📡 API Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/upload` | Upload audio file |
| GET | `/api/meetings` | List all meetings |
| GET | `/api/meetings/:id` | Get meeting details |
| DELETE | `/api/meetings/:id` | Delete meeting |
| GET | `/api/meetings/:id/transcript` | Get transcript |
| GET | `/api/meetings/:id/analysis` | Get analysis |
| GET | `/api/meetings/:id/status` | Processing status |
| POST | `/api/meetings/:id/ask` | Ask a question about the meeting |
| PATCH | `/api/action-items/:id` | Update action item |
| GET | `/api/action-items` | List action items |
| GET | `/api/analytics` | Platform analytics |

---

## 🗄️ Database Schema

**MongoDB Collections:**

- **Meeting** — core metadata (title, date, duration, participants, status)
- **Transcript** — raw and cleaned transcript text with speaker segments and timestamps
- **Analysis** — extracted summary, decisions, action items, risks, open questions, effectiveness score
- **ActionItem** — individual tasks with owner, deadline, priority, and status

---

## ⚙️ Setup Instructions

```bash
# Clone repository
git clone https://github.com/avanishpandey10/meetingiq.git
cd meetingiq

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your GROQ_API_KEY

# Start development
npm run dev
```

---

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | Database URL | `mongodb://localhost:27017/meetingiq` |
| `GROQ_API_KEY` | Groq API key | `-` |
| `GROQ_MODEL` | LLM model | `llama-3.1-8b-instant` |
| `GROQ_ASR_MODEL` | ASR model | `whisper-large-v3-turbo` |
| `DEMO_MODE` | Mock data | `false` |

---

## 🎭 Demo Mode

MeetingIQ can run **without any API keys** using built-in mock data — ideal for evaluation, grading, or offline demos.

1. Set `DEMO_MODE=true` in your `.env` file
2. Start the app with `npm run dev`
3. Upload any audio file (or use the provided sample) — the app will return pre-generated mock transcription and analysis results instead of calling the Groq APIs
4. All dashboard features (summaries, action items, analytics, exports) work fully in this mode

This allows reviewers to explore the complete feature set without needing a Groq account.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ for smarter meetings.</p>
