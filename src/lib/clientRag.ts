import kb from "../../api/_lib/knowledge_base.json";
import { TfidfRetriever, type Chunk, type RetrievedChunk } from "../../api/_lib/retriever";
import { isInScope, REFUSAL_MESSAGE } from "../../api/_lib/guardrails";

const retriever = new TfidfRetriever(kb as Chunk[]);

export interface ClientRagResult {
  reply: string;
  refused: boolean;
  sources: Array<{ id: string; title: string; category: string }>;
}

export function answerWithClientRag(message: string): ClientRagResult {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      reply: "Ask me something about Vendor-GPT!",
      refused: false,
      sources: [],
    };
  }

  const retrieved = retriever.query(trimmed, 4);

  if (!isInScope(retrieved)) {
    return {
      reply: REFUSAL_MESSAGE,
      refused: true,
      sources: [],
    };
  }

  const sources = retrieved.map((r) => ({
    id: r.chunk.id,
    title: r.chunk.title,
    category: r.chunk.category,
  }));

  // Synthesize answer from the top retrieved chunks
  const topChunk = retrieved[0]?.chunk;
  let reply = topChunk?.content ?? "No matching knowledge base entry found.";

  // If there's a highly relevant second chunk, append relevant supplementary context if distinct
  if (retrieved.length > 1 && retrieved[1].score > 0.15) {
    const secondChunk = retrieved[1].chunk;
    if (secondChunk.id !== topChunk.id && !reply.includes(secondChunk.content)) {
      // Append if it adds distinct value
      reply += `\n\nAdditionally, ${secondChunk.content}`;
    }
  }

  return {
    reply,
    refused: false,
    sources,
  };
}
