// Purely decorative network of dots and thin lines. Deterministic (seeded) so
// server and client render identical markup.
const W = 1440;
const H = 760;

function buildNetwork() {
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const points = Array.from({ length: 46 }, () => ({
    x: Math.round(rand() * W),
    y: Math.round(rand() * H),
    r: 1.2 + rand() * 1.8,
  }));

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (Math.hypot(dx, dy) < 150 && lines.length < 40) {
        lines.push({ x1: points[i].x, y1: points[i].y, x2: points[j].x, y2: points[j].y });
      }
    }
  }
  return { points, lines };
}

const { points, lines } = buildNetwork();

export default function NetworkBackground() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-(--network) opacity-30 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
    >
      <g stroke="currentColor" strokeWidth="0.6" opacity="0.5">
        {lines.map((l, i) => (
          <line key={i} {...l} />
        ))}
      </g>
      <g fill="currentColor">
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} />
        ))}
      </g>
    </svg>
  );
}
