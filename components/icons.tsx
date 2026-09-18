import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Trowel over a mound — scoring. */
export function IconScore(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3v7" />
      <path d="M8.5 10h7l-3.5 5.5L8.5 10Z" />
      <path d="M3 20h18" />
      <path d="M6.5 20a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

export function IconClock(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </svg>
  );
}

export function IconRules(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v14.5" />
      <path d="M5 4.5V19a2 2 0 0 0 2 2h12" />
      <path d="M19 18.5H7a2 2 0 0 0-2 2" />
      <path d="M9 8h6M9 11.5h4" />
    </svg>
  );
}

export function IconLogs(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5h16M4 5v14M4 19h16M20 5v14" />
      <path d="M4 10h16M4 14.5h16" />
      <path d="M10 5v14" />
    </svg>
  );
}

export function IconSetup(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="2" fill="var(--color-panel)" />
      <circle cx="15" cy="12" r="2" fill="var(--color-panel)" />
      <circle cx="8" cy="17" r="2" fill="var(--color-panel)" />
    </svg>
  );
}

export function IconUndo(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 8h9a5 5 0 0 1 0 10H8" />
      <path d="M7.5 4.5 4 8l3.5 3.5" />
    </svg>
  );
}

export function IconRedo(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 8h-9a5 5 0 0 0 0 10h5" />
      <path d="m16.5 4.5 3.5 3.5-3.5 3.5" />
    </svg>
  );
}

export function IconPlay(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M7 4.5 19.5 12 7 19.5V4.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause(p: P) {
  return (
    <svg {...base} {...p}>
      <rect
        x="6.5"
        y="4.5"
        width="4"
        height="15"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="13.5"
        y="4.5"
        width="4"
        height="15"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function IconReset(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4.5h-4.5" />
    </svg>
  );
}

export function IconSearch(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

export function IconChevron(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function IconSound(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
      <path d="M15.5 9.5a4 4 0 0 1 0 5" />
      <path d="M18 7a7.5 7.5 0 0 1 0 10" />
    </svg>
  );
}

export function IconMuted(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
      <path d="m16 10 4 4M20 10l-4 4" />
    </svg>
  );
}
