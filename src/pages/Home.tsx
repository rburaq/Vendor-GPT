import Nav from "../components/layout/Nav";
import Footer from "../components/layout/Footer";
import Hero from "../components/sections/Hero";
import ProblemSolution from "../components/sections/ProblemSolution";
import Features from "../components/sections/Features";
import UseCases from "../components/sections/UseCases";
import About from "../components/sections/About";
import Pricing from "../components/sections/Pricing";
import CTA from "../components/sections/CTA";
import { useReveal } from "../hooks/useReveal";
import InteractiveBackground from "../components/ui/InteractiveBackground";

export default function Home() {
  useReveal();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-fg">
      {/* Interactive dynamic background layer */}
      <InteractiveBackground />

      {/* Flow-scroll progress indicator */}
      <div
        className="scroll-progress fixed inset-x-0 top-0 z-[60] h-[2px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, #ff7a2f, #ff3d6e, #e0369f, #c23be0, #7b4dff)",
        }}
        aria-hidden="true"
      />
      <Nav />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <UseCases />
        <Pricing />
        <About />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
