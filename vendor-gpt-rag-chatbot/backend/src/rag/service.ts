import * as guardrails from "./guardrails.js";
import { GroqChatClient, type ChatTurn } from "./groqClient.js";
import type { Retriever } from "./retriever.js";

const MAX_HISTORY_TURNS = 6; // user+assistant pairs kept for conversational context
const MAX_MESSAGE_LENGTH = 2000;

export interface Source {
  id: string;
  title: string;
  category: string;
}

export interface ChatResult {
  reply: string;
  refused: boolean;
  sources: Source[];
}

export class RagChatService {
  constructor(
    private retriever: Retriever,
    private groqClient: GroqChatClient,
    private topK = 4
  ) {}

  async answer(message: string, history: ChatTurn[] = []): Promise<ChatResult> {
    const trimmed = (message ?? "").trim();
    if (!trimmed) {
      return { reply: "Ask me something about Vendor-GPT!", refused: false, sources: [] };
    }
    const clipped = trimmed.slice(0, MAX_MESSAGE_LENGTH);

    const retrieved = this.retriever.query(clipped, this.topK);

    // Layer 1: retrieval-confidence gate. No match worth calling the LLM about.
    if (!guardrails.isInScope(retrieved)) {
      return { reply: guardrails.REFUSAL_MESSAGE, refused: true, sources: [] };
    }

    const systemPrompt = guardrails.buildSystemPrompt(retrieved);
    const llmMessages = this.buildLlmMessages(history, clipped);

    const rawReply = await this.groqClient.chat(systemPrompt, llmMessages);

    // Layer 2: LLM self-report gate. Context matched, but didn't answer it.
    const { reply, refused } = guardrails.postprocessReply(rawReply);

    const sources: Source[] = refused
      ? []
      : retrieved.map((r) => ({
          id: r.chunk.id,
          title: r.chunk.title,
          category: r.chunk.category,
        }));

    return { reply, refused, sources };
  }

  private buildLlmMessages(history: ChatTurn[], message: string): ChatTurn[] {
    const cleaned = history
      .slice(-(MAX_HISTORY_TURNS * 2))
      .filter((t) => (t.role === "user" || t.role === "assistant") && t.content?.trim())
      .map((t) => ({ role: t.role, content: t.content.trim().slice(0, MAX_MESSAGE_LENGTH) }));
    cleaned.push({ role: "user", content: message });
    return cleaned;
  }
}
