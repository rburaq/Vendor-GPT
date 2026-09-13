import { useEffect, useState } from "react";
import { LogoIcon } from "./Logo";

interface LoadingScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export default function LoadingScreen({
  onComplete,
  minDisplayTime = 1200,
}: LoadingScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      const removeTimer = setTimeout(() => {
        setIsDone(true);
        onComplete?.();
      }, 500);
      return () => clearTimeout(removeTimer);
    }, minDisplayTime);

    return () => clearTimeout(fadeTimer);
  }, [minDisplayTime, onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-ink p-6 transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
      aria-label="Loading Vendor-GPT"
      role="status"
    >
      {/* Ambient background aura glow */}
      <div
        className="pointer-events-none absolute h-[380px] w-[380px] rounded-full opacity-40 blur-[100px] animate-pulse"
        style={{
          background:
            "radial-gradient(circle, #e0369f 0%, #7b4dff 50%, transparent 80%)",
        }}
      />
      <div
        className="pointer-events-none absolute h-[240px] w-[240px] rounded-full opacity-30 blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, #ff7a2f 0%, #ff3d6e 60%, transparent 80%)",
        }}
      />

      {/* Centered Logo Presentation */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Glowing Logo Card */}
        <div className="relative mb-6 flex items-center justify-center">
          {/* Subtle breathing ripple */}
          <div
            className="absolute -inset-4 rounded-3xl opacity-35 animate-ping"
            style={{
              background:
                "radial-gradient(circle, #e0369f 0%, #7b4dff 60%, transparent 80%)",
              animationDuration: "2.8s",
            }}
          />
          <div className="relative flex items-center justify-center rounded-3xl border border-hairline bg-white/[0.04] p-5 shadow-[0_0_60px_-10px_rgba(224,54,159,0.55)] backdrop-blur-2xl">
            <LogoIcon size={64} animated={true} />
          </div>
        </div>

        {/* Brand Lockup */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold tracking-tight text-white">
            Vendor
          </span>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{
              background:
                "linear-gradient(100deg, #ff7a2f, #ff3d6e 35%, #e0369f 70%, #7b4dff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            GPT
          </span>
          <span className="inline-flex items-center rounded-full border border-glow-fuchsia/40 bg-glow-fuchsia/10 px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider text-glow-fuchsia">
            RAG
          </span>
        </div>

        <p className="mt-2 text-[12px] tracking-wide text-fg-faint font-mono">
          AI Vendor Intelligence
        </p>
      </div>
    </div>
  );
}
