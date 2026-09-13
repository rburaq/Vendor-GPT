/**
 * Flow-scroll engine — vanilla, dependency-free, performance-first.
 *
 * Two independent mechanisms:
 *   1. REVEALS   — elements with `[data-flow]` animate in once when they enter
 *                  the viewport, via IntersectionObserver (no scroll listener,
 *                  so it never blocks the main thread).
 *   2. PARALLAX  — elements with `[data-parallax]` translate at a fraction of
 *                  scroll speed, updated inside a single rAF loop that only runs
 *                  while the page is actually scrolling and only touches
 *                  elements currently on screen (no layout thrashing — we read
 *                  scrollY once and write transforms only).
 *
 * Call `initFlowScroll()` once on mount; it returns a cleanup function.
 */

type Cleanup = () => void;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------ reveals */

function initReveals(): Cleanup {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-flow]"));
  if (els.length === 0) return () => {};

  // Fallback / reduced-motion: show everything immediately.
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-inview"));
    return () => {};
  }

  // Apply per-element timing hints (data-flow-delay / data-flow-duration in ms)
  // as CSS custom properties the stylesheet reads.
  els.forEach((el) => {
    const delay = el.dataset.flowDelay;
    const duration = el.dataset.flowDuration;
    if (delay) {
      const delayVal = delay.endsWith("ms") || delay.endsWith("s") ? delay : `${delay}ms`;
      el.style.setProperty("--flow-delay", delayVal);
    }
    if (duration) {
      const durationVal = duration.endsWith("ms") || duration.endsWith("s") ? duration : `${duration}ms`;
      el.style.setProperty("--flow-duration", durationVal);
    }
  });

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add("is-inview");
        // `data-flow-repeat` re-arms the animation each time it re-enters.
        if (el.dataset.flowRepeat === undefined) io.unobserve(el);
      }
      // Handle re-arm for repeatable elements that have scrolled out.
    },
    {
      // Start a touch before the element is fully on screen for a natural feel.
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  // Separate observer to clear the class when repeatable elements leave view.
  const repeatEls = els.filter((el) => el.dataset.flowRepeat !== undefined);
  let repeatIo: IntersectionObserver | undefined;
  if (repeatEls.length) {
    repeatIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            (entry.target as HTMLElement).classList.remove("is-inview");
          }
        }
      },
      { threshold: 0 },
    );
    repeatEls.forEach((el) => repeatIo!.observe(el));
  }

  els.forEach((el) => io.observe(el));

  return () => {
    io.disconnect();
    repeatIo?.disconnect();
  };
}

/* ----------------------------------------------------------------- parallax */

function initParallax(): Cleanup {
  const els = Array.from(
    document.querySelectorAll<HTMLElement>("[data-parallax]"),
  );
  if (els.length === 0 || prefersReducedMotion()) return () => {};

  // Cache each element's speed (positive = moves slower/up, higher = stronger).
  const items = els.map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax || "0.2"),
    axis: el.dataset.parallaxAxis === "x" ? "x" : "y",
  }));

  let ticking = false;
  const viewportH = () => window.innerHeight;

  const update = () => {
    ticking = false;
    const vh = viewportH();
    // Single read of scroll position, then write-only loop → no thrashing.
    for (const { el, speed, axis } of items) {
      const rect = el.getBoundingClientRect();
      // Skip work for anything comfortably off-screen.
      if (rect.bottom < -vh || rect.top > vh * 2) continue;
      // Progress: how far the element's center is from viewport center.
      const offset = rect.top + rect.height / 2 - vh / 2;
      const shift = -offset * speed;
      el.style.transform =
        axis === "x"
          ? `translate3d(${shift.toFixed(2)}px,0,0)`
          : `translate3d(0,${shift.toFixed(2)}px,0)`;
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  update(); // initial position
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

/* -------------------------------------------------------------------- entry */

export function initFlowScroll(): Cleanup {
  const cleanups = [initReveals(), initParallax()];
  return () => cleanups.forEach((fn) => fn());
}
