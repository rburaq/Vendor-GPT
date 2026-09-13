type OrbProps = {
  className?: string;
  /** 0-1, controls overall intensity */
  intensity?: number;
};

/**
 * The signature Vendor-GPT visual: a large glowing orb whose rim transitions
 * from warm orange-red through magenta/fuchsia into violet, sitting on a dark
 * indigo ground. Built from stacked radial/conic gradients + blur so it stays
 * crisp at any size and can be reused as an ambient motif behind sections.
 */
export default function Orb({ className = "", intensity = 1 }: OrbProps) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 aspect-square w-[130vw] max-w-[1200px] -translate-x-1/2 select-none ${className}`}
      style={{ opacity: intensity }}
      aria-hidden="true"
    >
      {/* orb-parallax = scroll-linked vertical drift; animate-orb = ambient drift */}
      <div className="orb-parallax absolute inset-0" data-parallax="0.12">
        <div className="animate-orb absolute inset-0">
      {/* Outer diffuse bloom */}
      <div
        className="absolute inset-0 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle at 50% 62%, rgba(226,54,159,0.55), rgba(123,77,255,0.35) 42%, rgba(21,15,52,0) 70%)",
        }}
      />
      {/* The rim: conic sweep of the full gradient */}
      <div
        className="absolute inset-0 rounded-full blur-[26px]"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 50%, #7b4dff, #5b8bff, #c23be0, #e0369f, #ff3d6e, #ff7a2f, #ff3d6e, #c23be0, #7b4dff)",
          maskImage:
            "radial-gradient(circle at 50% 50%, transparent 58%, #000 63%, #000 71%, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 50%, transparent 58%, #000 63%, #000 71%, transparent 78%)",
        }}
      />
      {/* Inner body glow — soft violet/magenta fill */}
      <div
        className="absolute inset-[8%] rounded-full blur-[40px]"
        style={{
          background:
            "radial-gradient(circle at 50% 58%, rgba(194,59,224,0.5), rgba(91,50,120,0.25) 55%, rgba(13,10,28,0) 75%)",
        }}
      />
      {/* Warm base pool at the bottom */}
      <div
        className="absolute inset-x-[20%] bottom-[6%] h-[38%] rounded-full blur-[50px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255,168,90,0.55), rgba(255,61,110,0.3) 55%, rgba(13,10,28,0) 80%)",
        }}
      />
        </div>
      </div>
    </div>
  );
}
