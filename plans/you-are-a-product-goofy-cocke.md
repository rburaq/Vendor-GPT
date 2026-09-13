# WhatsApp AI Automation — Marketing & Onboarding Site

## Context
The project is an empty Vite + React 19 + Tailwind v4 scaffold (`src/App.tsx` renders a blank
centered div). The user wants a professional, conversion-focused single-page marketing site for an
AI-powered WhatsApp business-automation platform that uses RAG to auto-reply to client messages —
cutting response time, WhatsApp API costs, and the need to hire as you scale.

The product is branded **Vendor-GPT**.

The visual language is set by `src/imports/image.png`: a dark indigo→purple field with a large,
soft glowing orb whose rim transitions from warm orange-red through magenta/fuchsia into violet.
Mood: sleek, futuristic, minimalist, serene — smooth gradients and diffused light. Typography is
**DM Mono** throughout, reinforcing the AI/automation positioning.

## Approach
Build a single-page, scroll-guided landing site directly in `src/App.tsx`, extracting section
components into `src/components/` as they grow. No routing needed (one page, anchor-scroll nav).

### Setup
- Invoke `aesthetic-stance` skill before writing code (no Make Kit present); call `create_make_theme`
  with a 1–2 sentence brief for page-level art direction.
- Wire **DM Mono** in `src/index.css` via Google Fonts CSS2 `@import` (must be first statement,
  before `@import 'tailwindcss';` — actually place font @import first, then tailwind import).
- Define design tokens (background indigo/violet, gradient stops orange-red→magenta→fuchsia→violet,
  glass-surface, text tints) in `src/index.css` using Tailwind v4 `@theme`.

### The signature visual
- Recreate the orb/arc from `image.png` as CSS radial/conic gradients + heavy blur (not a raster),
  so it scales crisply and can be reused as an ambient motif behind sections.
- Soft diffused glows, thin light rims, glassmorphic cards over dark ground.

### Sections (top → bottom, "architecture" flow-scroll pacing)
1. **Nav** — Vendor-GPT wordmark, anchor links, "Book a demo" / "Start free" CTA.
2. **Hero** — headline positioning the product as an intelligence solution; subcopy on time saved,
   cost cut, scale without hiring; dual CTA; the glowing orb as the centerpiece. Optional floating
   WhatsApp-chat mock showing an AI auto-reply.
3. **Problem / Solution** — three pains (high WhatsApp API cost, repetitive-reply time drain,
   can't scale support without hiring) paired with the RAG-based fix for each.
4. **Key Features** — RAG intelligent auto-replies, cost savings vs. traditional API, scale from
   vendor→enterprise, per-client personalization, local-vendor accessibility.
5. **Use Cases / Social Proof** — local vendor, small agency, mid-market company; testimonial(s)
   and success metrics (illustrative, clearly plausible).
6. **Pricing / Value** — ROI framing: reduced API spend, saved labor hours, more clients per rep;
   simple tiered pricing (Starter / Growth / Enterprise).
7. **Final CTA** — trial / demo / contact.
8. **Footer**.

### Interaction & responsiveness
- Scroll-reveal transitions (IntersectionObserver or a small lib) for the guided journey; ambient
  orb parallax/drift kept subtle and performant.
- Mobile-first responsive: single-column stacks on mobile, grids on tablet/desktop; nav collapses.

## Critical files
- `src/App.tsx` — page composition (replace blank scaffold).
- `src/index.css` — DM Mono `@import`, `@theme` tokens, base background.
- `src/components/*.tsx` — section components (Nav, Hero, ProblemSolution, Features, UseCases,
  Pricing, CTA, Footer) plus a reusable `Orb`/ambient-glow component.

## Verification
- Dev server is already running on `$PORT`; confirm the page renders and scrolls with no console
  errors (`figma logs` only if a failure appears).
- Check hero, all sections, and CTAs at desktop / tablet / mobile widths.
- Confirm DM Mono is applied everywhere and the orb visual matches the reference mood.
