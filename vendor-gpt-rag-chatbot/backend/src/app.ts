import { fileURLToPath } from "node:url";
import path from "node:path";
import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { z } from "zod";

import { GroqChatClient, GroqClientError } from "./rag/groqClient.js";
import { TfidfRetriever } from "./rag/retriever.js";
import { RagChatService } from "./rag/service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_PATH = path.join(__dirname, "..", "kb", "knowledge_base.json");
const PORT = Number(process.env.PORT ?? 8000);

const app = express();
app.use(express.json({ limit: "50kb" }));

// Lock this down to your real domain(s) in production, e.g.
// ALLOWED_ORIGINS="https://vendor-gpt.com,https://www.vendor-gpt.com"
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    methods: ["GET", "POST"],
  })
);

const retriever = new TfidfRetriever(KB_PATH);

let service: RagChatService | null = null;
let initError: string | null = null;
try {
  const groqClient = new GroqChatClient();
  service = new RagChatService(retriever, groqClient);
} catch (err) {
  // Don't crash the process on a missing key -- surface a clear 503 on
  // /api/chat instead, so the rest of the site (and health checks) keep working.
  initError = (err as Error).message;
}

const chatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", groq_configured: service !== null });
});

app.post("/api/chat", async (req: Request, res: Response) => {
  if (!service) {
    res.status(503).json({ detail: initError ?? "Chat service unavailable." });
    return;
  }

  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ detail: parsed.error.flatten() });
    return;
  }

  try {
    const result = await service.answer(parsed.data.message, parsed.data.history);
    res.json(result);
  } catch (err) {
    if (err instanceof GroqClientError) {
      res.status(502).json({ detail: err.message });
      return;
    }
    res.status(500).json({ detail: "Unexpected server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Vendor-GPT chatbot backend listening on port ${PORT}`);
});
