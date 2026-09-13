import Orb from "../ui/Orb";
import { Button, Eyebrow } from "../ui";
import { useQueryModal } from "../../context/QueryModalContext";

const chat = [
  { from: "client", text: "Hi — do you deliver to Ikeja today? And what's the price for 2 units?" },
  {
    from: "ai",
    text: "Yes! We deliver to Ikeja same-day before 6pm. Two units come to ₦18,400 including delivery. Want me to place the order?",
  },
  { from: "client", text: "Perfect, yes please." },
];

export default function Hero() {
  const { openQueryModal } = useQueryModal();

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-24 pt-36 md:pb-32 md:pt-44">
      {/* Ambient orb centerpiece */}
      <Orb className="top-[-18%]" intensity={0.95} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div data-flow="up" className="reveal">
          <Eyebrow>RAG-powered WhatsApp automation</Eyebrow>

          <h1 className="mt-6 text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Answer every client on
            <br className="hidden sm:block" /> WhatsApp — <span className="text-gradient">without</span>
            <br className="hidden sm:block" /> hiring another rep.
          </h1>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-fg-dim">
            Vendor-GPT reads your catalog, policies and past chats, then replies to
            customers in seconds with answers that actually sound like you. Cut
            response time, slash WhatsApp API spend, and scale from market stall to
            enterprise on the same brain.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button onClick={() => openQueryModal("Starter")}>Start free — no card</Button>
            <Button href="/chat" variant="ghost">
              Talk to the assistant →
            </Button>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {[
              ["92%", "of routine chats auto-handled"],
              ["8s", "average first reply"],
              ["3.4×", "more clients per rep"],
            ].map(([n, l], i) => (
              <div key={l} data-flow="up" data-flow-delay={i * 90}>
                <dt className="text-2xl text-gradient">{n}</dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-fg-faint">
                  {l}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Floating WhatsApp-style chat mock */}
        <div
          data-flow="left"
          data-flow-delay="140"
          className="reveal relative"
        >
          <div className="relative mx-auto max-w-sm rounded-[26px] border border-hairline bg-white/[0.03] p-4 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(123,77,255,0.55)]">
            <div className="flex items-center gap-3 border-b border-hairline pb-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-glow-orange to-glow-violet" />
              <div>
                <p className="text-[13px]">Adunni Stores</p>
                <p className="text-[10px] text-glow-fuchsia">Vendor-GPT · online</p>
              </div>
              <span className="ml-auto text-[10px] text-fg-faint">now</span>
            </div>

            <div className="flex flex-col gap-3 py-4">
              {chat.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                    m.from === "ai"
                      ? "self-end text-white"
                      : "self-start bg-white/[0.06] text-fg-dim"
                  }`}
                  style={
                    m.from === "ai"
                      ? {
                          backgroundImage:
                            "linear-gradient(120deg, #e0369f, #7b4dff)",
                        }
                      : undefined
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-hairline bg-black/20 px-4 py-2.5 text-[12px] text-fg-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-glow-fuchsia" />
              Vendor-GPT is drafting a reply…
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
