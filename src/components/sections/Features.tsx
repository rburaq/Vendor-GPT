import Orb from "../ui/Orb";
import { Eyebrow } from "../ui";

const features = [
  {
    title: "RAG-grounded auto-replies",
    body: "Answers are retrieved from your own catalog, price list, FAQs and past chats — not hallucinated. Every reply cites what your business actually knows.",
    span: "md:col-span-2",
  },
  {
    title: "Costs a fraction of the API",
    body: "By resolving routine chats up front, you cut conversation-based charges and seat costs dramatically versus a traditional WhatsApp API stack.",
  },
  {
    title: "Vendor to enterprise",
    body: "Start on a phone at a market stall; graduate to multi-agent, multi-location routing on the same platform.",
  },
  {
    title: "Personalized per client",
    body: "Remembers order history, preferences and tone so each customer feels known — at any scale.",
    span: "md:col-span-2",
  },
  {
    title: "Built for local vendors",
    body: "Speaks your customers' language and currency, works on a single WhatsApp number, and sets up in minutes.",
  },
  {
    title: "Human handoff, on your terms",
    body: "Vendor-GPT knows when to escalate — routing edge cases to a person with the full conversation context attached.",
    span: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden px-6 py-24 md:py-32">
      <Orb className="top-[20%]" intensity={0.28} />

      <div className="relative mx-auto max-w-6xl">
        <div data-flow="up" className="reveal max-w-2xl">
          <Eyebrow>What's inside</Eyebrow>
          <h2 className="mt-5 text-3xl leading-tight tracking-tight md:text-4xl">
            An intelligence layer for every conversation you have.
          </h2>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              data-flow="up"
              data-flow-delay={(i % 3) * 90}
              className={`group relative rounded-3xl border border-hairline bg-white/[0.02] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04] ${f.span ?? ""}`}
            >
              <div className="mb-6 h-8 w-8 rounded-xl bg-gradient-to-br from-glow-orange via-glow-fuchsia to-glow-violet opacity-90 transition-transform duration-500 group-hover:scale-110" />
              <h3 className="text-lg tracking-tight">{f.title}</h3>
              <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-fg-dim">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
