import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Orb from "../components/ui/Orb";
import { LogoIcon } from "../components/ui/Logo";
import { answerWithClientRag } from "../lib/clientRag";

/**
 * Dedicated full-page Vendor-GPT assistant. Reuses the RAG backend contract
 * from the uploaded chatbot (POST /api/chat, GET /api/health) but presents it
 * as a standalone /chat route rather than a floating widget.
 */

function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_CHAT_API_URL ?? "").trim();
  // When running in a browser, ignore localhost/127.0.0.1 URLs because the client
  // browser cannot connect to localhost:8000 in cloud sandbox environments.
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
  content:
    "Hi! I'm the Vendor-GPT assistant. Ask me about features, pricing, or how setup works — I only answer from our own docs.",
};

const SUGGESTIONS = [
  "How much does the Growth plan cost?",
  "How does the RAG auto-reply work?",
  "Can it scale from a local vendor to enterprise?",
  "How long does setup take?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages.filter((m) => m !== GREETING);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
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
            message: trimmed,
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
        console.warn("Backend API call bypassed, falling back to client RAG engine:", networkOrParseError);
      }

      if (!handledByApi) {
        const localResult = answerWithClientRag(trimmed);
        replyContent = localResult.reply;
        refused = localResult.refused;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyContent, refused },
      ]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong reaching the assistant. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  const showSuggestions = messages.length === 1;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink text-fg">
      <Orb className="top-[-40%]" intensity={0.35} />

      {/* Header */}
      <header className="relative z-10 border-b border-hairline bg-ink/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <LogoIcon size={30} />
            <div>
              <p className="text-[14px] leading-tight">Vendor-GPT Assistant</p>
              <p className="flex items-center gap-1.5 text-[11px] text-fg-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-glow-fuchsia" />
                Grounded in our docs
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="rounded-full border border-hairline px-4 py-2 text-[12px] text-fg-dim transition-colors hover:border-white/25 hover:text-fg"
          >
            ← Back to site
          </Link>
        </div>
      </header>

      {/* Conversation */}
      <main
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-5 py-8"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m, i) => (
            <Bubble key={i} message={m} />
          ))}

          {loading && (
            <div className="flex items-center gap-3 self-start">
              <LogoIcon size={26} />
              <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}

          {error && (
            <p className="self-start text-[12px] text-glow-red">{error}</p>
          )}

          {showSuggestions && (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-hairline bg-white/[0.02] px-3.5 py-2 text-left text-[12.5px] text-fg-dim transition-colors hover:border-white/25 hover:text-fg"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <footer className="relative z-10 border-t border-hairline bg-ink/70 backdrop-blur-xl">
        <form
          onSubmit={onSubmit}
          className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Vendor-GPT…"
            disabled={loading}
            className="flex-1 rounded-full border border-hairline bg-white/[0.03] px-5 py-3 text-[13.5px] text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-glow-fuchsia"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-40"
            style={{
              backgroundImage: "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)",
            }}
          >
            <SendIcon />
          </button>
        </form>
        <p className="pb-4 text-center text-[10.5px] text-fg-faint">
          Vendor-GPT answers only from its own knowledge base and refuses
          off-topic questions.
        </p>
      </footer>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div
        className="max-w-[80%] self-end rounded-2xl rounded-tr-sm px-4 py-3 text-[13.5px] leading-relaxed text-white"
        style={{
          backgroundImage: "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)",
        }}
      >
        {message.content}
      </div>
    );
  }
  return (
    <div className="flex max-w-[85%] items-start gap-3 self-start">
      <LogoIcon size={26} className="mt-0.5 shrink-0" />
      <div
        className={`rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-[13.5px] leading-relaxed text-fg-dim ${
          message.refused ? "border border-hairline" : ""
        }`}
      >
        {message.content}
      </div>
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

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
