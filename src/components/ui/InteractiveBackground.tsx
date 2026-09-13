import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Eye, EyeOff, Sliders } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
  pulseAngle: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

const BRAND_COLORS = [
  "#ff7a2f", // glow orange
  "#ff3d6e", // glow red
  "#e0369f", // glow magenta
  "#c23be0", // glow fuchsia
  "#7b4dff", // glow violet
  "#5b8bff", // glow blue
];

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<"mesh" | "particles" | "aurora">("mesh");
  const [isEnabled, setIsEnabled] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Mouse / Pointer State
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    radius: 140,
    isHovering: false,
  });

  const ripplesRef = useRef<Ripple[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Particles based on viewport dimensions
  const initParticles = useCallback((width: number, height: number) => {
    const count = Math.min(Math.floor((width * height) / 18000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
      particles.push({
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.25,
        alpha: Math.random() * 0.45 + 0.25,
        color,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseAngle: Math.random() * Math.PI * 2,
      });
    }

    particlesRef.current = particles;
  }, []);

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      initParticles(width, height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initParticles]);

  // Global Pointer Listeners (Non-blocking)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.isHovering = true;
    };

    const handlePointerLeave = () => {
      mouseRef.current.isHovering = false;
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Create an expanding ripple ring
      const color = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.38,
        alpha: 0.85,
        color,
      });

      // Cap active ripples
      if (ripplesRef.current.length > 8) {
        ripplesRef.current.shift();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  // Main Render Loop
  useEffect(() => {
    if (!isEnabled) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear frame with transparent slate
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation (lerp)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // 1. Draw Mouse Follower Aura Glow (if hovering within viewport)
      if (mouse.isHovering && mouse.x > -100 && mouse.y > -100) {
        const radial = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          260
        );
        radial.addColorStop(0, "rgba(224, 54, 159, 0.14)");
        radial.addColorStop(0.35, "rgba(123, 77, 255, 0.08)");
        radial.addColorStop(0.7, "rgba(91, 139, 255, 0.03)");
        radial.addColorStop(1, "rgba(8, 6, 15, 0)");

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 260, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render & Update Interactive Click Ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 4.5;
        r.alpha *= 0.94;

        if (r.alpha < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha * 0.6;
        ctx.lineWidth = Math.max(1, 2.5 * (1 - r.radius / r.maxRadius));
        ctx.stroke();

        // Inner secondary soft glow
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius - 12), 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = r.alpha * 0.25;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Render Particles & Mesh Connections
      const particles = particlesRef.current;
      const connectionDist = interactiveMode === "mesh" ? 120 : 0;
      const mouseDist = mouse.radius;

      // Update particle positions & interactions
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic oscillation
        p.pulseAngle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        // Base velocity drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap-around borders
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Interactive Mouse Force (Gentle repel & spring)
        if (mouse.isHovering) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseDist && dist > 0) {
            const force = (1 - dist / mouseDist) * 3.5;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force;
            p.y += Math.sin(angle) * force;
          }
        }

        // Interactive Ripples Shockwave push
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const rdx = p.x - rip.x;
          const rdy = p.y - rip.y;
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
          const diff = Math.abs(rdist - rip.radius);

          if (diff < 30) {
            const push = (1 - diff / 30) * rip.alpha * 4.5;
            const angle = Math.atan2(rdy, rdx);
            p.x += Math.cos(angle) * push;
            p.y += Math.sin(angle) * push;
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
        ctx.fill();

        // Node subtle glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.02, Math.min(0.2, p.alpha * 0.25));
        ctx.fill();

        // 4. Mesh lines between neighbor particles
        if (connectionDist > 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
              const lineAlpha = (1 - dist / connectionDist) * 0.18;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = lineAlpha;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        // 5. Line connections to cursor
        if (mouse.isHovering) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseDist + 20) {
            const lineAlpha = (1 - dist / (mouseDist + 20)) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isEnabled, interactiveMode]);

  return (
    <>
      {/* Interactive HTML5 Canvas Layer (Strictly non-blocking) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none"
        aria-hidden="true"
      />

      {/* Floating Interactive Background Utility Menu */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
        {showControls && (
          <div className="flex flex-col gap-2 rounded-2xl border border-hairline bg-ink-2/90 p-3 shadow-2xl backdrop-blur-xl animate-fadeIn text-[12px]">
            <div className="flex items-center justify-between gap-3 border-b border-hairline pb-2 font-medium text-fg">
              <span className="flex items-center gap-1.5 text-glow-fuchsia">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Canvas FX</span>
              </span>
              <button
                onClick={() => setIsEnabled(!isEnabled)}
                className="text-[11px] text-fg-dim hover:text-white transition-colors"
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(
                [
                  { id: "mesh", label: "Neural" },
                  { id: "particles", label: "Dust" },
                  { id: "aurora", label: "Minimal" },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setInteractiveMode(mode.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                    interactiveMode === mode.id
                      ? "bg-glow-fuchsia/20 text-glow-fuchsia border border-glow-fuchsia/40"
                      : "bg-white/[0.04] text-fg-faint hover:text-fg hover:bg-white/[0.08]"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="text-[10px] text-fg-faint pt-1 leading-tight">
              • Move cursor to attract neural mesh
              <br />• Click or tap anywhere to send energy pulse
            </div>
          </div>
        )}

        <button
          onClick={() => setShowControls(!showControls)}
          className="group flex items-center gap-2 rounded-full border border-hairline bg-ink/80 px-3.5 py-2 text-[12px] font-mono text-fg-dim shadow-lg backdrop-blur-md transition-all hover:border-white/30 hover:bg-white/[0.06] hover:text-fg"
          aria-label="Toggle interactive background menu"
          title="Customize interactive background animation"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glow-fuchsia opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-glow-fuchsia" />
          </span>
          <span className="hidden sm:inline">Interactive Grid</span>
          <Sliders className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </>
  );
}
