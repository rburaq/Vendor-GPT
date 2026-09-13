import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const [isHoveringText, setIsHoveringText] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const posRef = useRef({
    currentX: -100,
    currentY: -100,
    targetX: -100,
    targetY: -100,
  });

  useEffect(() => {
    // Only enable on pointer-fine devices (mouse/trackpad, not touch)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let isMounted = true;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current.targetX = e.clientX;
      posRef.current.targetY = e.clientY;

      if (!isVisible && isMounted) {
        setIsVisible(true);
      }

      // Check element under cursor for smart hover styles
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest(
            'a, button, input, textarea, select, [role="button"], [tabindex="0"], label, summary'
          )
        );
        setIsHoveringClickable(isInteractive);

        const isTextElement = Boolean(
          target.closest("p, h1, h2, h3, h4, h5, h6, blockquote, dt, dd") &&
            !isInteractive
        );
        setIsHoveringText(isTextElement);
      }
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    // High performance RAF loop for buttery-smooth lerp cursor movement
    const updatePosition = () => {
      if (!isMounted) return;

      const pos = posRef.current;
      // Damping factor: ring trails smoothly behind the dot
      pos.currentX += (pos.targetX - pos.currentX) * 0.18;
      pos.currentY += (pos.targetY - pos.currentY) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pos.targetX}px, ${pos.targetY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0) translate(-50%, -50%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(updatePosition);
    };

    animId = requestAnimationFrame(updatePosition);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Ambient Diffuse Core Glow */}
      <div
        ref={glowRef}
        className="fixed top-0 left-0 h-28 w-28 rounded-full opacity-35 blur-xl transition-[opacity,width,height] duration-300"
        style={{
          background:
            isHoveringClickable
              ? "radial-gradient(circle, #e0369f 0%, #7b4dff 60%, transparent 80%)"
              : "radial-gradient(circle, #ff7a2f 0%, #ff3d6e 50%, transparent 80%)",
          opacity: isHoveringClickable ? 0.65 : 0.28,
        }}
      />

      {/* Smooth Outer Reticle Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,border-color,background-color,transform] duration-200 ease-out ${
          isHoveringClickable
            ? "h-11 w-11 border-glow-fuchsia/80 bg-glow-fuchsia/15 shadow-[0_0_20px_rgba(224,54,159,0.4)] backdrop-blur-[1px]"
            : isMouseDown
            ? "h-5 w-5 border-white/90 bg-white/20"
            : isHoveringText
            ? "h-8 w-2 rounded-sm border-glow-orange/70 bg-glow-orange/10"
            : "h-8 w-8 border-white/40 bg-white/[0.03] shadow-[0_0_12px_rgba(255,255,255,0.1)]"
        }`}
      />

      {/* Sharp Center Pointer Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full transition-[width,height,opacity,transform] duration-150 ${
          isHoveringClickable
            ? "h-2 w-2 opacity-0"
            : isMouseDown
            ? "h-3 w-3 opacity-100"
            : "h-1.5 w-1.5 opacity-100"
        }`}
        style={{
          backgroundImage:
            "linear-gradient(135deg, #ff7a2f, #ff3d6e, #e0369f, #7b4dff)",
          boxShadow: "0 0 8px rgba(255, 122, 47, 0.9)",
        }}
      />
    </div>
  );
}
