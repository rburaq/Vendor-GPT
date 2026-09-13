import { useEffect, useRef, useState } from "react";
import { answerWithClientRag } from "../../src/lib/clientRag";

/**
 * Floating chat widget for the Vendor-GPT marketing site.
 *
 * Talks to the RAG backend's POST /api/chat endpoint. Styled with the same
 * design tokens as the rest of the site (src/index.css: --color-ink,
 * --color-hairline, the orange->fuchsia->violet gradient, DM Mono).
 *
 * Usage: drop <ChatWidget /> once, anywhere in App.tsx (e.g. right after
 * <Footer />) -- it's fixed-positioned and renders its own launcher button.
 */

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_CHAT_API_URL ?? "").trim();
  if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
    return "";
  }
  return envUrl.replace(/\/$/, "");
}

const API_BASE_URL = getApiBaseUrl();

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
  refused?: boolean;
}

const GREETING: Message = {
  role: "assistant",
  content: "Hi! I'm the Vendor-GPT assistant. Ask me about features, pricing, or how setup works.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.filter((m) => m !== GREETING);
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      let replyContent = "";
      let refused = false;
      let handledByApi = false;

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            history: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data: { reply?: string; refused?: boolean } = await res.json();
          if (typeof data?.reply === "string") {
            replyContent = data.reply;
            refused = Boolean(data.refused);
            handledByApi = true;
          }
        }
      } catch (networkOrParseError) {
        console.warn("API request failed, falling back to local client RAG:", networkOrParseError);
      }

      if (!handledByApi) {
        const localResult = answerWithClientRag(text);
        replyContent = localResult.reply;
        refused = localResult.refused;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyContent, refused },
      ]);
    } catch (err) {
      setError("Something went wrong reaching the assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_30px_-8px_rgba(226,54,159,0.6)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_40px_-6px_rgba(226,54,159,0.8)]"
        style={{ backgroundImage: "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)" }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[70] flex h-[min(560px,70vh)] w-[min(380px,90vw)] flex-col overflow-hidden rounded-3xl border border-hairline bg-ink/95 shadow-[0_30px_80px_-30px_rgba(123,77,255,0.55)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
            <div
              className="h-8 w-8 shrink-0 rounded-full"
              style={{
                backgroundImage:
                  "conic-gradient(from 200deg, #ff7a2f, #ff3d6e, #c23be0, #7b4dff, #5b8bff, #ff7a2f)",
              }}
            />
            <div>
              <p className="text-[13px] text-fg">Vendor-GPT Assistant</p>
              <p className="text-[10px] text-fg-faint">Answers grounded in our docs</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {loading && (
                <div className="self-start rounded-2xl bg-white/[0.06] px-3.5 py-2.5 text-[12.5px] text-fg-dim">
                  <TypingDots />
                </div>
              )}
              {error && <p className="text-[11px] text-glow-red">{error}</p>}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-hairline p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Vendor-GPT..."
              className="flex-1 rounded-full border border-hairline bg-white/[0.03] px-4 py-2.5 text-[13px] text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-glow-fuchsia"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-opacity disabled:opacity-40"
              style={{ backgroundImage: "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)" }}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
        isUser ? "self-end text-white" : "self-start bg-white/[0.06] text-fg-dim"
      } ${message.refused ? "border border-hairline" : ""}`}
      style={
        isUser
          ? { backgroundImage: "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)" }
          : undefined
      }
    >
      {message.content}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-faint [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-faint [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-faint" />
    </span>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
