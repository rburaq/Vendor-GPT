import { Link } from "react-router";

/**
 * Vendor-GPT Brand Mark
 * 
 * Represents the synergy between digital vendor commerce and RAG conversational intelligence.
 * The glyph merges a stylized dimensional "V" storefront canopy with neural nodes,
 * conversational wave dynamics, and an energetic intelligence core.
 */

export function LogoIcon({
  className = "",
  size = 36,
  animated = false,
  title = "Vendor-GPT",
}: {
  className?: string;
  size?: number;
  animated?: boolean;
  title?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main vibrant flame-to-violet gradient */}
        <linearGradient
          id="vg-primary-grad"
          x1="6"
          y1="8"
          x2="58"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff7a2f" />
          <stop offset="28%" stopColor="#ff3d6e" />
          <stop offset="60%" stopColor="#e0369f" />
          <stop offset="85%" stopColor="#7b4dff" />
          <stop offset="100%" stopColor="#5b8bff" />
        </linearGradient>

        {/* Core glow */}
        <radialGradient id="vg-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ff3d6e" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#7b4dff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7b4dff" stopOpacity="0" />
        </radialGradient>

        {/* Storefront roof facet gradient */}
        <linearGradient
          id="vg-roof-left"
          x1="12"
          y1="14"
          x2="32"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ff7a2f" />
          <stop offset="100%" stopColor="#e0369f" />
        </linearGradient>

        <linearGradient
          id="vg-roof-right"
          x1="52"
          y1="14"
          x2="32"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#5b8bff" />
          <stop offset="100%" stopColor="#7b4dff" />
        </linearGradient>

        {/* Ambient background aura filter */}
        <filter id="vg-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Subtle outer shield/hexagon contour */}
      <polygon
        points="32,6 54,17 54,43 32,56 10,43 10,17"
        fill="rgba(255, 255, 255, 0.02)"
        stroke="url(#vg-primary-grad)"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.45"
      />

      {/* Main Dimensional "V" Vendor Storefront Structure */}
      {/* Left Wing / Canopy */}
      <path
        d="M13 18 L32 37 L32 46 L13 25 Z"
        fill="url(#vg-roof-left)"
        opacity="0.95"
      />

      {/* Right Wing / Canopy */}
      <path
        d="M51 18 L32 37 L32 46 L51 25 Z"
        fill="url(#vg-roof-right)"
        opacity="0.95"
      />

      {/* Facet Highlights */}
      <path
        d="M13 18 L32 29 L51 18 L32 10 Z"
        fill="url(#vg-primary-grad)"
        opacity="0.3"
      />
      <path
        d="M13 18 L32 29 L51 18"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Central V-Keystone / Apex Plunge */}
      <path
        d="M32 29 L22 41 L32 54 L42 41 Z"
        fill="none"
        stroke="url(#vg-primary-grad)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* WhatsApp / Chat Waveform Apex accent */}
      <path
        d="M26 38 Q32 33 38 38"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M28 43 Q32 40 36 43"
        fill="none"
        stroke="url(#vg-primary-grad)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Central Neural Synapse Core */}
      <circle
        cx="32"
        cy="29"
        r="6"
        fill="url(#vg-core-glow)"
        className={animated ? "animate-pulse" : ""}
      />
      <circle cx="32" cy="29" r="2.2" fill="#ffffff" />

      {/* Outer Constellation Nodes */}
      <circle cx="13" cy="18" r="2.5" fill="#ff7a2f" />
      <circle cx="51" cy="18" r="2.5" fill="#5b8bff" />
      <circle cx="32" cy="54" r="2.8" fill="#e0369f" />
      <circle cx="10" cy="43" r="1.8" fill="#ff3d6e" opacity="0.8" />
      <circle cx="54" cy="43" r="1.8" fill="#7b4dff" opacity="0.8" />
      <circle cx="32" cy="10" r="2" fill="#ff7a2f" opacity="0.8" />

      {/* Orbit ring connection lines */}
      <line
        x1="13"
        y1="18"
        x2="32"
        y2="29"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <line
        x1="51"
        y1="18"
        x2="32"
        y2="29"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  size = 32,
  showTagline = false,
}: {
  className?: string;
  size?: number;
  showTagline?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-95 ${className}`}
      aria-label="Vendor-GPT — Home"
    >
      <div className="relative flex items-center justify-center">
        {/* Ambient Back-Glow */}
        <div
          className="pointer-events-none absolute -inset-1 rounded-xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-75"
          style={{
            background:
              "radial-gradient(circle, rgba(224, 54, 159, 0.45) 0%, rgba(123, 77, 255, 0.2) 60%, transparent 80%)",
          }}
        />
        <div className="relative flex items-center justify-center rounded-xl border border-hairline bg-white/[0.03] p-1 shadow-[0_4px_20px_-4px_rgba(224,54,159,0.3)] backdrop-blur-md transition-transform duration-300 group-hover:scale-105 group-hover:border-white/20">
          <LogoIcon size={size} />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-[17px] font-semibold tracking-tight text-fg transition-colors">
            Vendor
          </span>
          <span
            className="text-[17px] font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(100deg, #ff7a2f, #ff3d6e 35%, #e0369f 70%, #7b4dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GPT
          </span>
          <span className="ml-1 inline-flex items-center rounded-full border border-glow-fuchsia/40 bg-glow-fuchsia/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-glow-fuchsia">
            RAG
          </span>
        </div>
        {showTagline && (
          <span className="mt-0.5 text-[10px] tracking-wide text-fg-faint">
            AI Vendor Intelligence
          </span>
        )}
      </div>
    </Link>
  );
}
