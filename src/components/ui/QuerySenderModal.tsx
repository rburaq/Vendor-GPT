import { useEffect, useState } from "react";
import {
  X,
  Mail,
  Send,
  Sparkles,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Building2,
  User,
  Phone,
} from "lucide-react";

export type PlanType = "Starter" | "Growth" | "Enterprise";

interface QuerySenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: PlanType;
}

const PLAN_DETAILS: Record<
  PlanType,
  {
    name: string;
    price: string;
    tagline: string;
    highlights: string;
  }
> = {
  Starter: {
    name: "Starter",
    price: "$0/mo",
    tagline: "Solo vendors testing the waters",
    highlights: "1 WhatsApp number · Up to 500 auto-replies/mo · FAQ knowledge base",
  },
  Growth: {
    name: "Growth",
    price: "$49/mo",
    tagline: "Growing businesses & small teams",
    highlights: "Up to 3 numbers · Unlimited auto-replies · Human handoff · Priority support",
  },
  Enterprise: {
    name: "Enterprise",
    price: "Custom",
    tagline: "Multi-location & high volume",
    highlights: "Unlimited numbers/seats · Dedicated knowledge tuning · Custom SLA",
  },
};

const DESTINATION_EMAIL = "cotvial@gmail.com";

export default function QuerySenderModal({
  isOpen,
  onClose,
  initialPlan = "Starter",
}: QuerySenderModalProps) {
  const [plan, setPlan] = useState<PlanType>(initialPlan);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [mailSentToast, setMailSentToast] = useState(false);

  // Sync initialPlan when modal opens
  useEffect(() => {
    if (isOpen) {
      setPlan(initialPlan);
      setCopied(false);
      setMailSentToast(false);
    }
  }, [isOpen, initialPlan]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const subject = `[Vendor-GPT Inquiry] ${plan} Plan Setup Request — ${
    businessName.trim() || name.trim() || "New Client"
  }`;

  const body = `Hello Vendor-GPT Team,

I would like to start with Vendor-GPT on the ${plan} plan.

===========================
PLAN SELECTION
===========================
• Selected Plan: ${plan} (${PLAN_DETAILS[plan].price})
• Tier Scope: ${PLAN_DETAILS[plan].tagline}

===========================
CONTACT & BUSINESS DETAILS
===========================
• Name / Contact: ${name.trim() || "Not specified"}
• Business / Store: ${businessName.trim() || "Not specified"}
• WhatsApp Number: ${whatsapp.trim() || "Not specified"}
• Contact Email: ${email.trim() || "Will reply from my sender account"}

===========================
CATALOG & SPECIFIC NEEDS
===========================
${query.trim() || "Please reach out to help connect our WhatsApp number and load our catalog knowledge base."}

===========================
Looking forward to launching our AI-powered WhatsApp vendor assistant!
`;

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    DESTINATION_EMAIL
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const mailtoUrl = `mailto:${DESTINATION_EMAIL}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  const handleOpenGmail = () => {
    window.open(gmailComposeUrl, "_blank", "noopener,noreferrer");
    setMailSentToast(true);
    setTimeout(() => setMailSentToast(false), 5000);
  };

  const handleCopyQuery = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${DESTINATION_EMAIL}\nSubject: ${subject}\n\n${body}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative z-10 my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-hairline bg-ink-2/95 p-6 sm:p-8 text-fg shadow-[0_25px_70px_-15px_rgba(123,77,255,0.4)] backdrop-blur-2xl transition-all"
      >
        {/* Glow ambient highlight */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #e0369f 0%, #7b4dff 50%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-glow-fuchsia">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get Started with Vendor-GPT</span>
            </div>
            <h3 id="modal-title" className="mt-1.5 text-2xl font-medium tracking-tight">
              Submit Your Plan Query
            </h3>
            <p className="mt-1 text-[13px] text-fg-dim">
              Your inquiry will be sent directly to{" "}
              <span className="font-semibold text-fg underline decoration-glow-fuchsia/40 underline-offset-2">
                {DESTINATION_EMAIL}
              </span>{" "}
              via Gmail.
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-hairline bg-white/[0.04] text-fg-dim transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-fg"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-6 space-y-5">
          {/* Plan Selection Chips */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.14em] text-fg-faint">
              1. Select Your Preferred Plan
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {(["Starter", "Growth", "Enterprise"] as PlanType[]).map((p) => {
                const isSelected = plan === p;
                const details = PLAN_DETAILS[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`group relative flex flex-col rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                      isSelected
                        ? "border-glow-fuchsia bg-white/[0.08] shadow-[0_0_20px_-5px_rgba(224,54,159,0.3)]"
                        : "border-hairline bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[13px] font-medium uppercase tracking-wider ${
                          isSelected ? "text-gradient font-bold" : "text-fg"
                        }`}
                      >
                        {details.name}
                      </span>
                      <span className="text-[12px] font-semibold text-fg-dim">
                        {details.price}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-fg-faint">
                      {details.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 rounded-xl border border-hairline bg-white/[0.02] px-3.5 py-2 text-[11.5px] text-fg-dim flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-glow-fuchsia shrink-0" />
              <span>
                <strong className="text-fg">{plan} Plan Features:</strong>{" "}
                {PLAN_DETAILS[plan].highlights}
              </span>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.14em] text-fg-faint">
              2. Your Contact & Store Info
            </label>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-faint">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (e.g. Aazan / Sarah)"
                  className="w-full rounded-2xl border border-hairline bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[13px] text-fg placeholder:text-fg-faint focus:border-glow-fuchsia focus:outline-none focus:ring-1 focus:ring-glow-fuchsia"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-faint">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Store / Brand Name (e.g. Adunni Stores)"
                  className="w-full rounded-2xl border border-hairline bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[13px] text-fg placeholder:text-fg-faint focus:border-glow-fuchsia focus:outline-none focus:ring-1 focus:ring-glow-fuchsia"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-faint">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp Number (e.g. +234 ... / +1 ...)"
                  className="w-full rounded-2xl border border-hairline bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[13px] text-fg placeholder:text-fg-faint focus:border-glow-fuchsia focus:outline-none focus:ring-1 focus:ring-glow-fuchsia"
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-fg-faint">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address (optional)"
                  className="w-full rounded-2xl border border-hairline bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-[13px] text-fg placeholder:text-fg-faint focus:border-glow-fuchsia focus:outline-none focus:ring-1 focus:ring-glow-fuchsia"
                />
              </div>
            </div>
          </div>

          {/* Inquiry / Message */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.14em] text-fg-faint">
              3. Catalog & Query Notes (Optional)
            </label>
            <div className="relative mt-2">
              <textarea
                rows={2}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tell us about your catalog size, daily chat volume, or any custom integrations you need..."
                className="w-full rounded-2xl border border-hairline bg-white/[0.03] p-3 text-[13px] text-fg placeholder:text-fg-faint focus:border-glow-fuchsia focus:outline-none focus:ring-1 focus:ring-glow-fuchsia"
              />
            </div>
          </div>

          {/* Action Area */}
          <div className="rounded-2xl border border-hairline bg-white/[0.02] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12.5px] font-medium text-fg flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-glow-fuchsia" />
                  Target: <span className="text-white font-mono font-normal">{DESTINATION_EMAIL}</span>
                </p>
                <p className="text-[11px] text-fg-faint mt-0.5">
                  Subject: <span className="text-fg-dim">{subject}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyQuery}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/[0.04] px-3.5 py-2 text-[12px] text-fg-dim transition-colors hover:border-white/30 hover:text-fg"
                  title="Copy full drafted email query"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Query</span>
                    </>
                  )}
                </button>

                <a
                  href={mailtoUrl}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/[0.04] px-3.5 py-2 text-[12px] text-fg-dim transition-colors hover:border-white/30 hover:text-fg"
                  title="Open in default desktop mail application"
                >
                  <span>Default Mail</span>
                </a>
              </div>
            </div>

            {/* Main Gmail Launch Button */}
            <button
              type="button"
              onClick={handleOpenGmail}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl py-3 text-[14px] font-medium text-white shadow-[0_10px_35px_-8px_rgba(226,54,159,0.7)] transition-all duration-300 hover:shadow-[0_12px_45px_-6px_rgba(226,54,159,0.9)] hover:-translate-y-0.5 active:translate-y-0"
              style={{
                backgroundImage:
                  "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)",
              }}
            >
              <Mail className="h-4 w-4" />
              <span>Send via Gmail ({plan} Plan)</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </button>
          </div>

          {mailSentToast && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[12px] text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <Check className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                Opening Gmail with your drafted {plan} plan setup request to{" "}
                <strong>{DESTINATION_EMAIL}</strong>!
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
