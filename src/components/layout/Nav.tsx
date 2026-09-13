import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button, Wordmark } from "../ui";
import { useQueryModal } from "../../context/QueryModalContext";

// Prefixed with "/" so the anchors also work from other routes (e.g. /about,
// /chat) — the browser loads home, then scrolls to the section.
const links = [
  { label: "Problem", href: "/#problem" },
  { label: "Features", href: "/#features" },
  { label: "Use cases", href: "/#use-cases" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/#about" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { openQueryModal } = useQueryModal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 p-0 transition-all duration-500 ${
        scrolled
          ? "border-b border-hairline bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Wordmark />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] text-fg-dim transition-colors hover:text-fg"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/chat"
            className="text-[13px] text-fg-dim transition-colors hover:text-fg"
          >
            Assistant
          </Link>
          <Button href="/chat">Try the assistant</Button>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-fg md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <div className="flex flex-col gap-1">
            <span
              className={`h-px w-4 bg-current transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-4 bg-current transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-hairline bg-ink/90 px-6 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-fg-dim"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <Button href="/chat" variant="ghost">
                Try the assistant
              </Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  openQueryModal("Starter");
                }}
              >
                Start free
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
