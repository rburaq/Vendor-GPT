import aazanPhoto from "@/imports/file_0000000084b07208a89995fdb2ace260.png";
import qadeerPhoto from "@/imports/WhatsApp_Image_2026-09-12_at_8.36.24_PM.jpeg";
import Orb from "../ui/Orb";
import { Eyebrow } from "../ui";

/**
 * About / team section. Folded into the Home scroll (anchor #about) alongside
 * the other sections. Swap names, bios, photos and links when the real details
 * are ready; avatars fall back to a brand gradient monogram when no photo.
 */

interface Dev {
  name: string;
  role: string;
  initials: string;
  location: string;
  bio: string;
  skills: string[];
  gradient: string;
  photo?: string;
  socials: { label: string; href: string }[];
}

const developers: Dev[] = [
  {
    name: "Aazan Khan",
    role: "Co-founder · Full-Stack Engineer",
    initials: "AK",
    photo: aazanPhoto,
    location: "Lagos, NG",
    bio: "Builds the product end to end — the React front end you're looking at, the Node APIs behind it, and the WhatsApp integration that ties it to real conversations. Previously shipped messaging tools for local commerce.",
    skills: ["TypeScript", "React", "Node.js", "WhatsApp API", "Design systems"],
    gradient: "linear-gradient(135deg, #ff7a2f, #e0369f 55%, #7b4dff)",
    socials: [
      { label: "GitHub", href: "https://github.com/aazank2006-tech" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/aazan-khan-7098b53a7" },
    ],
  },
  {
    name: "Muhammad Ali Qadeer",
    role: "Co-founder · AI / ML Engineer",
    initials: "MAQ",
    photo: qadeerPhoto,
    location: "Remote",
    bio: "Owns the intelligence layer — the RAG retrieval, guardrails and model orchestration that keep replies grounded in each vendor's own knowledge base. Obsessed with answers that are accurate first, fast second.",
    skills: ["RAG", "LLMs", "Python", "Retrieval", "Prompt design"],
    gradient: "linear-gradient(135deg, #5b8bff, #c23be0 55%, #ff3d6e)",
    socials: [
      { label: "GitHub", href: "https://github.com/rburaq" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/buraqxr/" },
    ],
  },
];

const stack = [
  "React 19",
  "Vite",
  "Tailwind CSS v4",
  "Node.js",
  "RAG + Groq",
  "TF-IDF retrieval",
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden px-6 py-24 md:py-32">
      <Orb className="top-[10%]" intensity={0.55} />

      {/* Intro */}
      <div data-flow="up" className="reveal relative mx-auto max-w-3xl text-center">
        <Eyebrow>The people behind it</Eyebrow>
        <h2 className="mt-6 text-4xl leading-[1.08] tracking-tight md:text-5xl">
          Two builders on a mission to make{" "}
          <span className="text-gradient">great support universal.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-fg-dim">
          Vendor-GPT started with a simple frustration: the businesses that most
          need fast, personal customer support are the ones that can least afford
          an enterprise messaging suite. So we built the intelligence layer that
          lets a single vendor reply like a full team.
        </p>
      </div>

      {/* Developer cards */}
      <div className="relative mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
        {developers.map((d, i) => (
          <article
            key={d.name}
            data-flow="up"
            data-flow-delay={i * 110}
            className="group relative flex flex-col rounded-3xl border border-hairline bg-white/[0.02] p-8 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-4">
              {d.photo ? (
                <img
                  src={d.photo}
                  alt={d.name}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-[0_10px_30px_-10px_rgba(226,54,159,0.6)]"
                />
              ) : (
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-lg text-white shadow-[0_10px_30px_-10px_rgba(226,54,159,0.6)]"
                  style={{ backgroundImage: d.gradient }}
                  aria-hidden="true"
                >
                  {d.initials}
                </div>
              )}
              <div>
                <h3 className="text-xl tracking-tight">{d.name}</h3>
                <p className="mt-1 text-[12.5px] text-glow-fuchsia">{d.role}</p>
              </div>
            </div>

            <p className="mt-6 flex-1 text-[13.5px] leading-relaxed text-fg-dim">
              {d.bio}
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {d.skills.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-hairline px-3 py-1 text-[11px] text-fg-dim"
                >
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex gap-5 border-t border-hairline pt-5">
              {d.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-fg-dim transition-colors hover:text-fg"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Behind the build */}
      <div
        data-flow="up"
        data-flow-delay="100"
        className="reveal relative mx-auto mt-20 max-w-5xl rounded-3xl border border-hairline bg-white/[0.02] p-10 md:p-14"
      >
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <Eyebrow>Behind the build</Eyebrow>
            <h3 className="mt-5 text-2xl leading-tight tracking-tight md:text-3xl">
              A small stack, chosen for speed and honesty.
            </h3>
            <p className="mt-5 text-[13.5px] leading-relaxed text-fg-dim">
              No sprawling infrastructure — just a focused stack that keeps
              answers grounded and costs low. The retrieval layer refuses
              anything outside a vendor's knowledge base rather than guessing,
              so customers get facts, not hallucinations.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {stack.map((s) => (
              <li
                key={s}
                className="rounded-2xl border border-hairline bg-white/[0.02] px-4 py-3 text-[12.5px] text-fg-dim"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
