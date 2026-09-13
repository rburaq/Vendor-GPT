import Orb from "../ui/Orb";
import { Button } from "../ui";
import { useQueryModal } from "../../context/QueryModalContext";

export default function CTA() {
  const { openQueryModal } = useQueryModal();

  return (
    <section id="cta" className="relative overflow-hidden px-6 py-28 md:py-40">
      <Orb className="top-[-30%]" intensity={0.85} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div data-flow="scale" className="reveal relative mx-auto max-w-3xl text-center">
        <h2 className="text-4xl leading-[1.08] tracking-tight md:text-5xl">
          Give every customer an instant,{" "}
          <span className="text-gradient">on-brand reply.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-fg-dim">
          Connect your WhatsApp number, point Vendor-GPT at your catalog, and go
          live today. Free to start — upgrade only when it's already paying for
          itself.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => openQueryModal("Starter")}>Start free — no card</Button>
          <Button onClick={() => openQueryModal("Enterprise")} variant="ghost">
            Book a live demo →
          </Button>
        </div>

        <p className="mt-6 text-[12px] text-fg-faint">
          Setup in minutes · No engineering required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
