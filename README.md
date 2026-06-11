# HireReady 🎯

> AI-powered technical interview preparation platform with RAG-based evaluation, mock interviews, and semantic answer scoring.

**Live demo:** [http://163.245.216.161](http://163.245.216.161)

## What it does

HireReady helps developers prepare for technical interviews.

The app evaluates answers semantically, not by keyword matching. Different wording with the same technical meaning receives similar scoring.

It supports:

* practice mode for individual questions
* mock interview mode with final report
* category-based question selection
* AI feedback on technical correctness

## Features

* **Practice mode** — answer one question at a time and get instant AI feedback
* **Mock interviews** — full interview flow with delayed scoring and final report
* **RAG-based evaluation** — answers are compared with curated reference answers
* **Semantic scoring** — Claude evaluates technical content, not grammar or spelling
* **Redis sessions** — mock interview state stored with TTL
* **Category-based learning** — questions grouped by topic

## Architecture

```text
Browser
  │
  ▼
Nginx (port 80)
  ├── /              → React SPA
  └── /api/*         → Fastify backend (port 3000)
        │
        ├── PostgreSQL + pgvector
        │   ├── categories
        │   ├── questions
        │   ├── reference_answers (1024-dim embeddings)
        │   └── session_answers
        │
        └── Redis
            └── mock interview sessions (TTL: 2h)
```

## RAG pipeline

```text
User answer
  ↓
Voyage AI (voyage-code-3)
  ↓
pgvector similarity search
  ↓
Top-3 reference answers
  ↓
Claude Haiku
  ↓
Score (0-10) + feedback
```

## Tech stack

**Backend**

* Node.js + TypeScript
* Fastify
* Prisma ORM
* PostgreSQL + pgvector
* Redis (ioredis)
* Docker / Docker Compose

**Frontend**

* React 19 + TypeScript
* React Router v7
* Vite
* Tailwind CSS v4

**AI**

* Voyage AI `voyage-code-3`
* Anthropic Claude Haiku

**Infrastructure**

* Nginx
* Docker Compose
* GitHub Actions

## Project structure

```text
hireready/
├── src/
│   ├── app.ts
│   ├── prisma.ts
│   ├── redis.ts
│   ├── routes/
│   │   ├── categories.ts
│   │   ├── questions.ts
│   │   ├── answers.ts
│   │   ├── sessions.ts
│   │   └── mock.ts
│   └── services/
│       ├── claude.ts
│       └── voyage.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── client/
│   └── src/
│       ├── pages/
│       └── components/
├── Dockerfile
├── docker-compose.yml
└── prisma.config.ts
```

## Mock interview flow

```text
setup → in_progress → completed
```

* session stored in Redis with 2h TTL
* answers saved during the interview without evaluation
* evaluation happens only in the final report
* all answers are evaluated in parallel with `Promise.all`

## API

| Method | Endpoint                     | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| GET    | `/categories`                | List categories                     |
| GET    | `/questions?categoryId=1`    | Questions by category               |
| GET    | `/questions/:id`             | Single question                     |
| POST   | `/answers`                   | Submit answer in practice mode      |
| POST   | `/sessions`                  | Create Redis session                |
| POST   | `/mock/sessions`             | Start mock interview                |
| POST   | `/mock/sessions/:id/answers` | Submit answer and get next question |
| GET    | `/mock/sessions/:id/report`  | Final AI evaluation report          |

## Local setup

### Requirements

* Node.js 22+
* Docker
* Docker Compose

### Install

```bash
git clone https://github.com/your-username/hireready.git
cd hireready
npm install
cd client && npm install && cd ..
```

### Environment

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/hireready
ANTHROPIC_API_KEY=your_key
VOYAGE_API_KEY=your_key
```

### Start services

```bash
docker compose up db redis -d
npx prisma migrate deploy
npm run seed
npm run dev
cd client && npm run dev
```

App runs at: `http://localhost:5173`

## Deployment

* backend in Docker
* PostgreSQL in Docker
* Redis in Docker
* React built as static files
* Nginx serves frontend and proxies API requests

## Database schema

```text
categories
  id, name, slug, description

questions
  id, category_id, title, body, difficulty (EASY/MEDIUM/HARD), tags[]

reference_answers
  id, question_id, body, embedding vector(1024)

session_answers
  id, question_id, user_answer, ai_score, ai_feedback
```

Similarity search:

```sql
SELECT body
FROM reference_answers
WHERE question_id = $1
ORDER BY embedding <=> $2::vector
LIMIT 3;
```

## Key decisions

* **Fastify** — schema validation and good performance
* **pgvector** — simple stack, no separate vector DB
* **Redis** — best fit for temporary interview sessions
* **Voyage AI** — optimized for technical/code embeddings
* **Deferred evaluation** — keeps mock interviews realistic and saves API calls
