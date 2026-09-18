"use client";

import type { ReactNode } from "react";

export function Section({
  title,
  aside,
  children,
  className = "",
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="eyebrow">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`panel ${padded ? "p-4" : ""} ${className}`}>
      {children}
    </div>
  );
}

/** A label/value row with a leader rule, as in a printed score sheet. */
export function Row({
  label,
  value,
  sub,
  muted,
  accent,
  strong,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  muted?: boolean;
  accent?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3 py-2">
      <span
        className={`shrink-0 text-[13px] ${
          muted ? "text-ink-dim" : strong ? "font-semibold" : "text-ink-muted"
        }`}
      >
        {label}
      </span>
      <span className="h-px min-w-3 flex-1 translate-y-[-3px] bg-line-soft" />
      {sub ? <span className="eyebrow shrink-0">{sub}</span> : null}
      <span
        className={`tnum shrink-0 font-mono text-[13px] ${
          strong ? "font-bold" : "font-medium"
        } ${muted ? "text-ink-dim" : ""}`}
        style={accent ? { color: "var(--accent)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "ghost",
  size = "md",
  disabled,
  className = "",
  title,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: "button" | "submit";
}) {
  const sizes = {
    sm: "h-8 px-2.5 text-[12px] rounded-lg",
    md: "h-10 px-3.5 text-[13px] rounded-xl",
    lg: "h-12 px-5 text-[14px] rounded-xl",
  }[size];

  const variants: Record<string, string> = {
    ghost:
      "border border-line bg-panel text-ink-muted hover:text-ink hover:border-ink-dim/40",
    solid: "border border-line bg-raised text-ink hover:bg-line",
    accent: "border text-ink",
    danger: "border border-fault/30 bg-fault/10 text-fault hover:bg-fault/20",
  };

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`tap inline-flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed disabled:opacity-35 ${sizes} ${variants[variant]} ${className}`}
      style={
        variant === "accent"
          ? {
              background: "var(--accent-deep)",
              borderColor:
                "color-mix(in oklab, var(--accent) 40%, transparent)",
              color: "var(--accent)",
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="panel flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="h-8 w-8 rounded-full border border-dashed border-line" />
      <p className="text-[14px] font-semibold">{title}</p>
      {hint ? (
        <p className="max-w-xs text-[13px] text-ink-dim">{hint}</p>
      ) : null}
    </div>
  );
}
