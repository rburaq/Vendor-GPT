# Vendor-GPT Site Chatbot — RAG + Groq (Node.js / TypeScript)

A scope-locked RAG chatbot for the Vendor-GPT marketing site: it answers
questions about Vendor-GPT (the product) using only Vendor-GPT's own
knowledge base, and refuses anything outside that scope instead of
guessing. Built to match the site's existing stack (Vite + React 19 +
Tailwind v4) and drop straight into the Figma Make export you uploaded.

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

## How the guardrail works (two layers)

1. **Retrieval-confidence gate** — every question is matched against the
   knowledge base first. If nothing scores above a similarity threshold,
   the request is refused immediately and the LLM is never called — no
   tokens spent, no chance of an improvised answer. Verified locally:
   *"What is the capital of France?"* scores `0.000` and is refused
   before any network call; *"How much does the Growth plan cost?"*
   scores `0.258` and proceeds.
2. **LLM self-report gate** — some questions share vocabulary with the KB
   without actually being answered by it (e.g. *"Does Vendor-GPT support
   Instagram DMs?"* matches loosely on "Vendor-GPT" but the KB never says
   this). The system prompt instructs the model to emit a fixed sentinel
   when the retrieved context doesn't answer the question; the backend
   swaps that sentinel for the standard refusal message before it ever
   reaches the user, so the model can't leak the sentinel or improvise
   around it.

Both layers were exercised against the running server during development:
off-topic questions refuse instantly with zero network calls, and
in-scope questions correctly reach the Groq call with retrieved context
attached (confirmed via the compiled `dist/app.js` server, hitting
`/api/health` and `/api/chat` directly).

### Why TF-IDF instead of an embeddings/vector-DB retriever

The Python version of this project used scikit-learn's TF-IDF
vectorizer; Node has no drop-in equivalent, so `retriever.ts` is a small,
dependency-free reimplementation of the same approach (unigrams +
bigrams, smoothed IDF, L2-normalized vectors, cosine similarity) — no
model download, no vector DB, nothing extra to run. That's a reasonable
choice for a KB this size (roughly two dozen chunks of marketing/product
copy). If you grow the KB into the hundreds of chunks or need genuine
semantic matching (synonyms, paraphrase), swap `TfidfRetriever` for an
embeddings-based retriever behind the same `Retriever` interface in
`retriever.ts` — nothing else has to change.

## 1. Backend setup

Requires Node.js 18.17+.

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

Run it in dev mode (auto-reloads on change):

```bash
npm run dev
```

Or build + run the compiled version (what the Dockerfile does):

```bash
npm run build
npm start
```

Check it's alive: `curl http://localhost:8000/api/health` →
`{"status":"ok","groq_configured":true}`.

### A note on the Groq model ID

Groq periodically retires model IDs (`llama-3.3-70b-versatile` and
`llama-3.1-8b-instant` were both decommissioned on 2026-08-16, for
example). `GROQ_MODEL` is an env var rather than hardcoded specifically so
you can swap it without a code change. Check
[console.groq.com/docs/models](https://console.groq.com/docs/models) for
the current production-tier list before you deploy — `openai/gpt-oss-120b`
(set as the default here) and `openai/gpt-oss-20b` (faster/cheaper) are
today's recommended production models.

## 2. Knowledge base

`backend/kb/knowledge_base.json` is a flat list of chunks:

```json
{
  "id": "pricing-002",
  "category": "pricing",
  "title": "Growth plan (most popular)",
  "content": "The Growth plan costs $49 per month..."
}
```

It's seeded from the copy already in your Figma export (`Hero.tsx`,
`ProblemSolution.tsx`, `Features.tsx`, `UseCases.tsx`, `Pricing.tsx`,
`CTA.tsx`) — problem/solution framing, all 6 features, all 3 case studies
+ testimonial, all 3 pricing tiers, and the getting-started blurb. Before
launch you'll want to expand it with real material the marketing copy
doesn't cover: a proper FAQ, security/compliance details, integration
docs, refund/cancellation policy, support contact info. Just add more
objects to the JSON array — the retriever re-indexes on every server
restart (or call `retriever.reload()` to refresh without restarting).

Tune `RAG_OUT_OF_SCOPE_THRESHOLD` in `.env` against real traffic: lower it
if legitimate questions are getting refused, raise it if off-topic
questions are slipping through to the LLM.

## 3. Frontend integration

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

No new npm dependencies for the widget itself — it's plain React +
`fetch`, styled entirely with the Tailwind classes and CSS variables
(`--color-ink`, `--color-hairline`, `--color-fg-dim`, the
orange→fuchsia→violet gradient) already defined in your `index.css`, so
it matches the rest of the site without extra setup. The request/response
shape of `/api/chat` is unchanged from the Python version, so the widget
doesn't care which backend it's talking to.

## 4. Deploying

- **Backend**: `backend/Dockerfile` builds the TypeScript and runs the
  compiled `dist/app.js` — ready to deploy on Fly.io, Render, Railway, a
  VPS, etc. Pass `GROQ_API_KEY`, `GROQ_MODEL`, and `ALLOWED_ORIGINS` as
  environment variables / secrets on the platform — never bake the key
  into the image or commit `.env`.
- **CORS**: set `ALLOWED_ORIGINS` to your real domain(s) once you're off
  localhost. The default in `.env.example` is restrictive on purpose.
- **Frontend**: `VITE_CHAT_API_URL` needs to point at wherever you deploy
  the backend (same-origin reverse proxy, or a separate API subdomain).

## Known limitations / next steps

- Retrieval is lexical (TF-IDF), not semantic — see §"Why TF-IDF..."
  above for how to swap it for an embeddings-based retriever if the KB
  grows.
- No persistent chat history or rate limiting yet; `MAX_HISTORY_TURNS` and
  `MAX_MESSAGE_LENGTH` in `src/rag/service.ts` cap per-request cost, but
  there's no per-IP throttling — worth adding (e.g. `express-rate-limit`)
  before a public launch to control Groq spend.
- Consider logging refused queries (without PII) to see what people are
  actually asking that the KB doesn't cover yet, and use that to grow
  `knowledge_base.json`.
