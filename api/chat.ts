/**
 * Vercel serverless function: POST /api/chat
 *
 * Runs the Vendor-GPT RAG pipeline (TF-IDF retrieval -> guardrails -> Groq)
 * in the same deployment as the site, so the assistant works in production
 * without a separately hosted backend. Set GROQ_API_KEY in the Vercel project's
 * Environment Variables.
 */

import kb from "./_lib/knowledge_base.json";
import { TfidfRetriever, type Chunk } from "./_lib/retriever";
import { GroqChatClient, GroqClientError, type ChatTurn } from "./_lib/groqClient";
import { RagChatService } from "./_lib/service";

// Built once per warm instance and reused across invocations.
const retriever = new TfidfRetriever(kb as Chunk[]);

let service: RagChatService | null = null;

function getService(): RagChatService {
  if (!service) {
    let groqClient: GroqChatClient | null = null;
    if (process.env.GROQ_API_KEY) {
      try {
        groqClient = new GroqChatClient();
      } catch (err) {
        console.warn("Groq initialization warning:", err);
      }
    }
    service = new RagChatService(retriever, groqClient);
  }
  return service;
}

function isValidHistory(value: unknown): value is ChatTurn[] {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        t &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string"
    )
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ detail: "Method not allowed." });
    return;
  }

  const chatService = getService();

  const body = req.body ?? {};
  const message = typeof body.message === "string" ? body.message : "";
  const history = isValidHistory(body.history) ? body.history : [];

  if (!message.trim() || message.length > 4000) {
    res.status(422).json({ detail: "`message` must be a non-empty string up to 4000 chars." });
    return;
  }

  try {
    const result = await chatService.answer(message, history);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof GroqClientError) {
      res.status(502).json({ detail: err.message });
      return;
    }
    res.status(500).json({ detail: "Unexpected server error." });
  }
}
