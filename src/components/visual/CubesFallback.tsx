/** Static CSS-3D stand-in used while the WebGL scene loads, without WebGL, or with reduced motion. */
const cubes = [
  { x: "8%", y: "14%", c: "from-neon-pink/80 via-violet-800 to-card", r: "rotate-[-14deg]" },
  { x: "52%", y: "6%", c: "from-violet-200 via-violet-900 to-card", r: "rotate-[10deg]" },
  { x: "30%", y: "44%", c: "from-neon-blue/80 via-violet-900 to-card", r: "rotate-[-6deg]" },
  { x: "62%", y: "50%", c: "from-neon-amber/70 via-violet-900 to-card", r: "rotate-[16deg]" },
  { x: "6%", y: "62%", c: "from-neon-green/60 via-violet-900 to-card", r: "rotate-[8deg]" },
];

export default function CubesFallback() {
  return (
    <div className="relative size-full" aria-hidden="true" style={{ perspective: "900px" }}>
      <div className="absolute inset-0 animate-float" style={{ transformStyle: "preserve-3d" }}>
        {cubes.map((q, i) => (
          <div
            key={i}
            className={`absolute size-[28%] rounded-[18%] border border-white/20 bg-gradient-to-br shadow-[inset_0_0_30px_rgb(255_255_255/0.12)] ${q.c} ${q.r}`}
            style={{ insetInlineStart: q.x, top: q.y }}
          />
        ))}
      </div>
    </div>
  );
}
