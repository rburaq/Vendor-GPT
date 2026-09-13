/**
 * Thin wrapper around the Groq chat completions API. Model id is read from an
 * env var (Groq renames/retires models periodically). Current production-tier
 * options include openai/gpt-oss-120b (default) and openai/gpt-oss-20b.
 */

import Groq from "groq-sdk";

export class GroqClientError extends Error {}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export class GroqChatClient {
  private client: Groq;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.GROQ_API_KEY;
    if (!key) {
      throw new GroqClientError(
        "GROQ_API_KEY is not set. Add it in your Vercel project's Environment Variables."
      );
    }
    this.client = new Groq({ apiKey: key });
    this.model = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
    this.temperature = Number(process.env.GROQ_TEMPERATURE ?? "0.2");
    this.maxTokens = Number(process.env.GROQ_MAX_TOKENS ?? "500");
  }

  async chat(systemPrompt: string, messages: ChatTurn[]): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });
      return (completion.choices[0]?.message?.content ?? "").trim();
    } catch (err) {
      throw new GroqClientError(`Groq API call failed: ${(err as Error).message}`);
    }
  }
}
