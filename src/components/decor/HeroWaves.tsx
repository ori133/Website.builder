// Purely decorative chrome-like waves. No text, hidden from assistive tech.
export default function HeroWaves() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-56 w-full max-w-[1500px] overflow-hidden rounded-t-[2rem] sm:h-72 lg:h-80"
    >
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="absolute inset-x-[-4%] bottom-0 h-full w-[108%]"
      >
        <defs>
          <linearGradient id="wave-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="35%" stopColor="#14b8a6" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="wave-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="45%" stopColor="#d6246e" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="wave-c" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="40%" stopColor="#be185d" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
          {/* Outermost wave shape; sheen is clipped to it so it never tints the background */}
          <clipPath id="wave-clip">
            <path d="M0 120 C180 40 360 40 540 110 S900 190 1080 100 S1320 30 1440 90 L1440 320 L0 320 Z" />
          </clipPath>
        </defs>

        <g className="wave-layer">
          <path
            fill="url(#wave-a)"
            d="M0 120 C180 40 360 40 540 110 S900 190 1080 100 S1320 30 1440 90 L1440 320 L0 320 Z"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="1.5"
            d="M0 128 C180 48 360 48 540 118 S900 198 1080 108 S1320 38 1440 98"
          />
        </g>
        <g className="wave-layer">
          <path
            fill="url(#wave-b)"
            d="M0 185 C200 110 380 120 560 190 S920 250 1100 170 S1340 110 1440 160 L1440 320 L0 320 Z"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth="1.2"
            d="M0 195 C200 120 380 130 560 200 S920 260 1100 180 S1340 120 1440 170"
          />
        </g>
        <g className="wave-layer">
          <path
            fill="url(#wave-c)"
            d="M0 245 C220 190 420 200 620 250 S1000 292 1200 232 S1380 205 1440 222 L1440 320 L0 320 Z"
          />
          <path
            fill="none"
            stroke="#fff"
            strokeOpacity="0.5"
            strokeWidth="1"
            d="M0 255 C220 200 420 210 620 260 S1000 302 1200 242 S1380 215 1440 232"
          />
        </g>
        <rect width="1440" height="320" fill="url(#sheen)" clipPath="url(#wave-clip)" />
      </svg>
    </div>
  );
}
