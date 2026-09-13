import { Link } from "react-router";
import { Wordmark } from "../ui";
import { useQueryModal } from "../../context/QueryModalContext";

type FooterLink = { label: string; to?: string; href?: string; onClick?: () => void };

export default function Footer() {
  const { openQueryModal } = useQueryModal();

  const cols: { title: string; links: FooterLink[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Use cases", href: "/#use-cases" },
        { label: "Assistant", to: "/chat" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/#about" },
        { label: "Customers", href: "/#use-cases" },
        { label: "Careers", href: "#" },
        { label: "Contact", onClick: () => openQueryModal("Starter") },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#" },
        { label: "Setup guide", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-t border-hairline px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-fg-dim">
            The RAG intelligence layer for WhatsApp business communication.
            Reply faster, spend less, scale without limits.
          </p>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-fg-faint">
              {c.title}
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.onClick ? (
                    <button
                      type="button"
                      onClick={l.onClick}
                      className="text-[13px] text-fg-dim transition-colors hover:text-fg text-left cursor-pointer"
                    >
                      {l.label}
                    </button>
                  ) : l.to ? (
                    <Link
                      to={l.to}
                      className="text-[13px] text-fg-dim transition-colors hover:text-fg"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-[13px] text-fg-dim transition-colors hover:text-fg"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-hairline pt-8 text-[12px] text-fg-faint sm:flex-row">
        <span>© {new Date().getFullYear()} Vendor-GPT. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-fg">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-fg">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
