import type { SVGProps } from "react";

const base = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

/** Diagonal arrow; mirrored automatically in RTL. */
export function ArrowUpEnd(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props} className={`rtl:-scale-x-100 ${props.className ?? ""}`}>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  );
}

export function ArrowDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 3v10M3.5 8.5L8 13l4.5-4.5" />
    </svg>
  );
}

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2 3h28v13.5L21 8 2 21V3z" />
      <path d="M2 24l11-9 8 7 9-7v10H2v-1z" />
    </svg>
  );
}
