import { Eyebrow } from "../ui";

const rows = [
  {
    n: "01",
    problem: "WhatsApp API bills that scale faster than revenue",
    pain: "Every conversation-based charge and agent seat adds up. Enterprise messaging suites price out the businesses that need them most.",
    solution: "Deflect the routine",
    fix: "Vendor-GPT resolves the 90% of repetitive questions before they ever reach a paid conversation window — you pay for outcomes, not chatter.",
  },
  {
    n: "02",
    problem: "Hours lost to the same questions, all day",
    pain: "\"Are you open?\" \"How much?\" \"Do you deliver?\" — typed out hundreds of times while real orders wait in the queue.",
    solution: "Instant, grounded replies",
    fix: "RAG retrieves the exact answer from your catalog, pricing and policies and responds in seconds — accurate, on-brand, 24/7.",
  },
  {
    n: "03",
    problem: "You can't grow support without growing payroll",
    pain: "More customers means more messages means more hires. Headcount becomes the ceiling on how many clients you can serve.",
    solution: "Scale on one brain",
    fix: "The same knowledge base handles ten clients or ten thousand. Add customers without adding a proportional support team.",
  },
];

export default function ProblemSolution() {
  return (
    <section id="problem" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div data-flow="up" className="reveal max-w-2xl">
          <Eyebrow>The problem, solved</Eyebrow>
          <h2 className="mt-5 text-3xl leading-tight tracking-tight md:text-4xl">
            Client messaging shouldn't cost you your{" "}
            <span className="text-gradient">margins or your evenings</span>.
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-px overflow-hidden rounded-3xl border border-hairline">
          {rows.map((r, i) => (
            <div
              key={r.n}
              data-flow="up"
              data-flow-delay={i * 100}
              className="reveal grid gap-8 bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04] md:grid-cols-[auto_1fr_1fr] md:p-10"
            >
              <div className="text-sm text-fg-faint">{r.n}</div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-glow-red/90">
                  The pain
                </p>
                <h3 className="mt-3 text-lg tracking-tight">{r.problem}</h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-fg-dim">
                  {r.pain}
                </p>
              </div>

              <div className="relative md:pl-8 md:before:absolute md:before:left-0 md:before:top-1 md:before:h-full md:before:w-px md:before:bg-hairline">
                <p className="text-[11px] uppercase tracking-[0.2em] text-glow-fuchsia">
                  Vendor-GPT
                </p>
                <h3 className="mt-3 text-lg tracking-tight text-gradient">
                  {r.solution}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-fg-dim">
                  {r.fix}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
