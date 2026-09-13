import type { ReactNode } from "react";
import { Logo, LogoIcon } from "./Logo";
import LoadingScreen from "./LoadingScreen";
import InteractiveBackground from "./InteractiveBackground";
import CustomCursor from "./CustomCursor";

export { Logo, LogoIcon, LoadingScreen, InteractiveBackground, CustomCursor };

export function Wordmark({ className = "" }: { className?: string }) {
  return <Logo className={className} />;
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  type?: "button" | "submit" | "reset";
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow-fuchsia focus-visible:ring-offset-2 focus-visible:ring-offset-ink cursor-pointer";
  const styles =
    variant === "primary"
      ? "text-white shadow-[0_8px_30px_-8px_rgba(226,54,159,0.6)] hover:shadow-[0_10px_40px_-6px_rgba(226,54,159,0.8)] hover:-translate-y-0.5"
      : "text-fg-dim border border-hairline hover:text-fg hover:border-white/25 backdrop-blur-sm";

  const customStyle =
    variant === "primary"
      ? {
          backgroundImage:
            "linear-gradient(100deg, #ff5a3c, #e0369f 55%, #7b4dff)",
        }
      : undefined;

  if (onClick || !href) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`${base} ${styles} ${className}`}
        style={customStyle}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={`${base} ${styles} ${className}`}
      style={customStyle}
    >
      {children}
    </a>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-fg-faint">
      <span className="h-1 w-1 rounded-full bg-glow-fuchsia" />
      {children}
    </span>
  );
}
