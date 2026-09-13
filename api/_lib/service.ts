import * as guardrails from "./guardrails";
import type { GroqChatClient, ChatTurn } from "./groqClient";
import type { Retriever } from "./retriever";

const MAX_HISTORY_TURNS = 6;
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
    private groqClient: GroqChatClient | null,
    private topK = 4
  ) {}

  async answer(message: string, history: ChatTurn[] = []): Promise<ChatResult> {
    const trimmed = (message ?? "").trim();
    if (!trimmed) {
      return { reply: "Ask me something about Vendor-GPT!", refused: false, sources: [] };
    }
    const clipped = trimmed.slice(0, MAX_MESSAGE_LENGTH);

    const retrieved = this.retriever.query(clipped, this.topK);

    if (!guardrails.isInScope(retrieved)) {
      return { reply: guardrails.REFUSAL_MESSAGE, refused: true, sources: [] };
    }

    const sources: Source[] = retrieved.map((r) => ({
      id: r.chunk.id,
      title: r.chunk.title,
      category: r.chunk.category,
    }));

    if (!this.groqClient) {
      return {
        reply: retrieved[0]?.chunk.content ?? "No matching knowledge base entry found.",
        refused: false,
        sources,
      };
    }

    const systemPrompt = guardrails.buildSystemPrompt(retrieved);
    const llmMessages = this.buildLlmMessages(history, clipped);

    const rawReply = await this.groqClient.chat(systemPrompt, llmMessages);

    const { reply, refused } = guardrails.postprocessReply(rawReply);

    return { reply, refused, sources: refused ? [] : sources };
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
