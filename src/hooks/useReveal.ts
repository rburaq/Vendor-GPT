import { useEffect } from "react";
import { initFlowScroll } from "../lib/flowScroll";

/**
 * Wires the flow-scroll engine (data-flow reveals + data-parallax) and the
 * legacy `.reveal` fade used by existing sections. Runs once after mount so the
 * DOM is populated, and tears everything down on unmount.
 */
export function useReveal() {
  useEffect(() => {
    // Legacy `.reveal` support (kept so existing sections keep animating).
    const legacy = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not([data-flow])"),
    );
    let legacyIo: IntersectionObserver | undefined;
    if (legacy.length && "IntersectionObserver" in window) {
      legacyIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              legacyIo!.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
      );
      legacy.forEach((el) => legacyIo!.observe(el));
    } else {
      legacy.forEach((el) => el.classList.add("is-visible"));
    }

    // New data-attribute engine (reveals + parallax).
    const cleanupFlow = initFlowScroll();

    return () => {
      legacyIo?.disconnect();
      cleanupFlow();
    };
  }, []);
}
