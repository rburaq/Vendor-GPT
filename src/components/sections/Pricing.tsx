import { Eyebrow, Button } from "../ui";
import { useQueryModal } from "../../context/QueryModalContext";
import type { PlanType } from "../ui/QuerySenderModal";

const tiers: {
  name: PlanType;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  cta: string;
  featured: boolean;
}[] = [
  {
    name: "Starter",
    price: "$0",
    cadence: "/mo",
    tagline: "For solo vendors testing the waters.",
    features: [
      "1 WhatsApp number",
      "Up to 500 auto-replies/mo",
      "Catalog & FAQ knowledge base",
      "Community support",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Growth",
    price: "$49",
    cadence: "/mo",
    tagline: "For growing businesses & small teams.",
    features: [
      "Up to 3 numbers, 5 seats",
      "Unlimited auto-replies",
      "Per-client personalization",
      "Human handoff + routing",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    tagline: "For multi-location & high volume.",
    features: [
      "Unlimited numbers & seats",
      "SSO, roles & audit logs",
      "Dedicated knowledge tuning",
      "SLA + solutions engineer",
    ],
    cta: "Talk to sales",
    featured: false,
  },
];

export default function Pricing() {
  const { openQueryModal } = useQueryModal();

  return (
    <section id="pricing" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div data-flow="up" className="reveal grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
          <div className="max-w-xl">
            <Eyebrow>Pricing & ROI</Eyebrow>
            <h2 className="mt-5 text-3xl leading-tight tracking-tight md:text-4xl">
              Pay less than one part-time hire. Do the work of several.
            </h2>
          </div>
          <p className="text-[13.5px] leading-relaxed text-fg-dim md:text-right">
            The average Growth customer recovers Vendor-GPT's cost within the first
            week — in reclaimed hours and reduced API spend alone.
          </p>
        </div>

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          {tiers.map((t, i) => (
            <div
              key={t.name}
              data-flow="up"
              data-flow-delay={i * 110}
              className={`reveal relative flex flex-col rounded-3xl border p-8 ${
                t.featured
                  ? "border-white/20 bg-white/[0.05]"
                  : "border-hairline bg-white/[0.02]"
              }`}
            >
              {t.featured && (
                <span
                  className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-lg px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white"
                  style={{
                    backgroundImage:
                      "linear-gradient(100deg, #e0369f, #7b4dff)",
                  }}
                >
                  Most popular
                </span>
              )}

              <h3 className="text-sm uppercase tracking-[0.18em] text-fg-dim">
                {t.name}
              </h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl tracking-tight text-gradient">
                  {t.price}
                </span>
                <span className="pb-1 text-[13px] text-fg-faint">{t.cadence}</span>
              </div>
              <p className="mt-3 text-[13px] text-fg-dim">{t.tagline}</p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-[13px] text-fg-dim"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-glow-fuchsia" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => openQueryModal(t.name)}
                variant={t.featured ? "primary" : "ghost"}
                className="mt-8 w-full"
              >
                {t.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
