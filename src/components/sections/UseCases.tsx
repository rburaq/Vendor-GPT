import { Eyebrow } from "../ui";

const cases = [
  {
    tag: "Local vendor",
    name: "Adunni Stores",
    scale: "1 WhatsApp line",
    story:
      "A neighbourhood grocery answering delivery, price and availability questions instantly — even at 11pm.",
    metric: "6 hrs/day",
    metricLabel: "saved on repetitive replies",
  },
  {
    tag: "Small agency",
    name: "Northlane Digital",
    scale: "5-person team",
    story:
      "Client onboarding, status updates and FAQs handled by Vendor-GPT, freeing the team for actual creative work.",
    metric: "3.4×",
    metricLabel: "more clients per account manager",
  },
  {
    tag: "Mid-market",
    name: "Meridian Health Group",
    scale: "40 clinics",
    story:
      "Appointment queries and policy questions across every location, routed and personalised — with human handoff for anything clinical.",
    metric: "61%",
    metricLabel: "lower messaging cost per patient",
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div data-flow="up" className="reveal max-w-2xl">
          <Eyebrow>Who it's for</Eyebrow>
          <h2 className="mt-5 text-3xl leading-tight tracking-tight md:text-4xl">
            One brain that grows with you — from stall to enterprise.
          </h2>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {cases.map((c, i) => (
            <article
              key={c.name}
              data-flow="up"
              data-flow-delay={i * 100}
              className="reveal flex flex-col rounded-3xl border border-hairline bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-hairline px-3 py-1 text-[11px] tracking-tight text-fg-dim">
                  {c.tag}
                </span>
                <span className="text-[11px] text-fg-faint">{c.scale}</span>
              </div>

              <h3 className="mt-6 text-xl tracking-tight">{c.name}</h3>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-fg-dim">
                {c.story}
              </p>

              <div className="mt-8 border-t border-hairline pt-6">
                <div className="text-3xl text-gradient">{c.metric}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-fg-faint">
                  {c.metricLabel}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Testimonial */}
        <blockquote
          data-flow="scale"
          data-flow-delay="150"
          className="reveal mt-4 rounded-3xl border border-hairline bg-white/[0.02] p-10 md:p-14"
        >
          <p className="max-w-3xl text-xl leading-relaxed tracking-tight md:text-2xl">
            "We were about to hire two more support staff. Instead Vendor-GPT
            handled the flood — and our customers say replies feel{" "}
            <span className="text-gradient">faster and more personal</span> than
            before."
          </p>
          <footer className="mt-8 flex items-center gap-3 text-[13px] text-fg-dim">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-glow-orange to-glow-violet" />
            <span>
              Tunde Bakare
              <span className="text-fg-faint"> · Founder, Northlane Digital</span>
            </span>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
