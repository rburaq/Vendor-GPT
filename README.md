# Vendor-GPT Site Chatbot — RAG + Groq (Node.js / TypeScript)

**🔗 Live App:** https://ai.studio/apps/919eb457-2472-48f0-9a19-72661a8162a5?fullscreenApplet=true

A scope-locked RAG chatbot for the Vendor-GPT marketing site. It answers questions about Vendor-GPT (the product) using **only** Vendor-GPT's own knowledge base, and refuses anything outside that scope instead of guessing. Built to match the site's existing stack (Vite + React 19 + Tailwind v4) and drops straight into the Figma Make export.

---

## Table of Contents

- [Overview](#overview)
- [How the Guardrail Works](#how-the-guardrail-works-two-layers)
- [Why TF-IDF Instead of Embeddings](#why-tf-idf-instead-of-an-embeddingsvector-db-retriever)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Knowledge Base](#2-knowledge-base)
  - [3. Frontend Integration](#3-frontend-integration)
- [Environment Variables](#environment-variables)
- [Deployment](#4-deploying)
- [Known Limitations / Next Steps](#known-limitations--next-steps)

---

## Overview

| | |
|---|---|
| **Purpose** | Scope-locked RAG chatbot for the Vendor-GPT marketing site |
| **Backend** | Node.js / TypeScript, Express |
| **LLM Provider** | Groq API |
| **Retrieval** | Dependency-free TF-IDF (no vector DB) |
| **Frontend** | Drop-in React widget styled to match the site (Vite + React 19 + Tailwind v4) |

---

## How the Guardrail Works (two layers)

1. **Retrieval-confidence gate** — every question is matched against the knowledge base first. If nothing scores above a similarity threshold, the request is refused immediately and the LLM is never called — no tokens spent, no chance of an improvised answer.
   - Verified locally: *"What is the capital of France?"* scores `0.000` and is refused before any network call.
   - *"How much does the Growth plan cost?"* scores `0.258` and proceeds.

2. **LLM self-report gate** — some questions share vocabulary with the KB without actually being answered by it (e.g. *"Does Vendor-GPT support Instagram DMs?"* matches loosely on "Vendor-GPT" but the KB never says this). The system prompt instructs the model to emit a fixed sentinel when the retrieved context doesn't answer the question; the backend swaps that sentinel for the standard refusal message before it ever reaches the user, so the model can't leak the sentinel or improvise around it.

Both layers were exercised against the running server during development: off-topic questions refuse instantly with zero network calls, and in-scope questions correctly reach the Groq call with retrieved context attached (confirmed via the compiled `dist/app.js` server, hitting `/api/health` and `/api/chat` directly).

## Why TF-IDF Instead of an Embeddings/Vector-DB Retriever

The Python version of this project used scikit-learn's TF-IDF vectorizer; Node has no drop-in equivalent, so `retriever.ts` is a small, dependency-free reimplementation of the same approach (unigrams + bigrams, smoothed IDF, L2-normalized vectors, cosine similarity) — no model download, no vector DB, nothing extra to run.

That's a reasonable choice for a KB this size (roughly two dozen chunks of marketing/product copy). If you grow the KB into the hundreds of chunks or need genuine semantic matching (synonyms, paraphrase), swap `TfidfRetriever` for an embeddings-based retriever behind the same `Retriever` interface in `retriever.ts` — nothing else has to change.

---

## Project Structure

```
vendor-gpt-rag-chatbot/
├── backend/
│   ├── src/
│   │   ├── app.ts             Express app — POST /api/chat, GET /api/health
│   │   └── rag/
│   │       ├── retriever.ts   Dependency-free TF-IDF retrieval over the KB
│   │       ├── guardrails.ts  Scope threshold + system prompt + refusal logic
│   │       ├── groqClient.ts  Groq chat-completions wrapper (groq-sdk)
│   │       └── service.ts     Orchestrates retrieve → guard → generate → guard
│   ├── kb/knowledge_base.json Vendor-GPT knowledge base (edit this to expand it)
│   ├── package.json / tsconfig.json
│   ├── .env.example
│   └── Dockerfile
└── frontend/
    └── ChatWidget.tsx         Drop-in chat widget, styled to match the site
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 18.17+ |
| Backend framework | Express (TypeScript) |
| LLM inference | Groq API (`groq-sdk`) |
| Retrieval | Custom TF-IDF (unigrams + bigrams, cosine similarity) |
| Frontend framework | React 19 + Vite |
| Styling | Tailwind CSS v4, matched to existing site CSS variables |
| Containerization | Docker (backend) |

---

## Getting Started

### 1. Backend Setup

Requires **Node.js 18.17+**.

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```ini
GROQ_API_KEY=gsk_...              # from https://console.groq.com/keys
GROQ_MODEL=openai/gpt-oss-120b    # see note below on model IDs
ALLOWED_ORIGINS=http://localhost:5173,https://your-real-domain.com
```

Run in dev mode (auto-reloads on change):

```bash
npm run dev
```

Or build + run the compiled version (what the Dockerfile does):

```bash
npm run build
npm start
```

Check it's alive:

```bash
curl http://localhost:8000/api/health
# → {"status":"ok","groq_configured":true}
```

> **Note on the Groq model ID:** Groq periodically retires model IDs (`llama-3.3-70b-versatile` and `llama-3.1-8b-instant` were both decommissioned on 2026-08-16, for example). `GROQ_MODEL` is an env var rather than hardcoded specifically so you can swap it without a code change. Check [console.groq.com/docs/models](https://console.groq.com/docs/models) for the current production-tier list before you deploy — `openai/gpt-oss-120b` (the default here) and `openai/gpt-oss-20b` (faster/cheaper) are today's recommended production models.

### 2. Knowledge Base

`backend/kb/knowledge_base.json` is a flat list of chunks:

```json
{
  "id": "pricing-002",
  "category": "pricing",
  "title": "Growth plan (most popular)",
  "content": "The Growth plan costs $49 per month..."
}
```

It's seeded from the copy already in the Figma export (`Hero.tsx`, `ProblemSolution.tsx`, `Features.tsx`, `UseCases.tsx`, `Pricing.tsx`, `CTA.tsx`) — problem/solution framing, all 6 features, all 3 case studies + testimonial, all 3 pricing tiers, and the getting-started blurb.

Before launch, expand it with real material the marketing copy doesn't cover: a proper FAQ, security/compliance details, integration docs, refund/cancellation policy, support contact info. Just add more objects to the JSON array — the retriever re-indexes on every server restart (or call `retriever.reload()` to refresh without restarting).

Tune `RAG_OUT_OF_SCOPE_THRESHOLD` in `.env` against real traffic: lower it if legitimate questions are getting refused, raise it if off-topic questions are slipping through to the LLM.

### 3. Frontend Integration

Copy the widget into your existing project:

```bash
cp frontend/ChatWidget.tsx <your-project>/src/components/ChatWidget.tsx
```

Add it to `src/App.tsx` (once, anywhere — it's fixed-positioned):

```tsx
import ChatWidget from "./components/ChatWidget";

// ...inside the returned JSX, e.g. right after <Footer />:
<Footer />
<ChatWidget />
```

Add the API URL to your frontend `.env`:

```ini
VITE_CHAT_API_URL=http://localhost:8000        # dev
# VITE_CHAT_API_URL=https://api.your-domain.com  # prod
```

No new npm dependencies for the widget itself — it's plain React + `fetch`, styled entirely with the Tailwind classes and CSS variables (`--color-ink`, `--color-hairline`, `--color-fg-dim`, the orange→fuchsia→violet gradient) already defined in `index.css`, so it matches the rest of the site without extra setup. The request/response shape of `/api/chat` is unchanged from the Python version, so the widget doesn't care which backend it's talking to.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key from [console.groq.com/keys](https://console.groq.com/keys) |
| `GROQ_MODEL` | ✅ | Groq model ID, e.g. `openai/gpt-oss-120b` |
| `GROQ_TEMPERATURE` | – | Sampling temperature for the Groq chat completion |
| `GROQ_MAX_TOKENS` | – | Max tokens per Groq completion |
| `RAG_OUT_OF_SCOPE_THRESHOLD` | – | Similarity cutoff below which a query is refused pre-LLM |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated list of origins allowed to call the API (CORS) |

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_CHAT_API_URL` | ✅ | Base URL the chat widget calls — point it at wherever the backend is deployed (baked in at build time by Vite, so rebuild after changing it) |

---

## 4. Deploying

- **Backend:** `backend/Dockerfile` builds the TypeScript and runs the compiled `dist/app.js` — ready to deploy on Fly.io, Render, Railway, a VPS, etc. Pass `GROQ_API_KEY`, `GROQ_MODEL`, and `ALLOWED_ORIGINS` as environment variables / secrets on the platform — never bake the key into the image or commit `.env`.
- **CORS:** set `ALLOWED_ORIGINS` to your real domain(s) once you're off localhost. The default in `.env.example` is restrictive on purpose.
- **Frontend:** `VITE_CHAT_API_URL` needs to point at wherever you deploy the backend (same-origin reverse proxy, or a separate API subdomain).

---

## Known Limitations / Next Steps

- Retrieval is lexical (TF-IDF), not semantic — see [Why TF-IDF...](#why-tf-idf-instead-of-an-embeddingsvector-db-retriever) above for how to swap it for an embeddings-based retriever if the KB grows.
- No persistent chat history or rate limiting yet; `MAX_HISTORY_TURNS` and `MAX_MESSAGE_LENGTH` in `src/rag/service.ts` cap per-request cost, but there's no per-IP throttling — worth adding (e.g. `express-rate-limit`) before a public launch to control Groq spend.
- Consider logging refused queries (without PII) to see what people are actually asking that the KB doesn't cover yet, and use that to grow `knowledge_base.json`.
