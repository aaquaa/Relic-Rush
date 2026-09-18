"use client";

import { useState } from "react";
import { PENALTIES, type PenaltyUnit } from "@/lib/game";
import { actions } from "@/lib/store";
import { Panel } from "@/components/ui";

const UNIT_SUFFIX: Record<PenaltyUnit, string> = {
  artefact: "per ARTEFACT",
  second: "per second",
  incident: "flat",
};

const SCOPE_LABEL = {
  auto: "Autonomous",
  match: "Robot",
  human: "Human / station",
} as const;

export function Fouls({
  counts,
  gifted,
}: {
  counts: Record<string, number>;
  gifted: number;
}) {
  const [open, setOpen] = useState(false);
  const active = PENALTIES.filter((p) => (counts[p.id] ?? 0) > 0);

  return (
    <Panel padded={false}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tap flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="eyebrow block">Fouls committed by this robot</span>
          <span className="mt-1.5 block text-[12px] text-ink-dim">
            {active.length === 0
              ? "None recorded — points here go to the opponent"
              : `${active.length} type${active.length > 1 ? "s" : ""} recorded`}
          </span>
        </span>
        <span
          className="tnum font-mono text-[20px] font-bold"
          style={{
            color: gifted > 0 ? "var(--color-signal)" : "var(--color-ink-dim)",
          }}
        >
          {gifted > 0 ? `+${gifted}` : "0"}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-ink-dim transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>

      {!open && active.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-4">
          {active.map((p) => (
            <span
              key={p.id}
              className="rounded-md border border-signal/25 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal"
            >
              {counts[p.id]}× {p.id.toUpperCase()}
            </span>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="enter border-t border-line-soft">
          <p className="px-4 pt-3 text-[12px] leading-relaxed text-ink-dim">
            Penalties are credited to the other alliance. Record them here for
            the robot you are watching; the other scorekeeper enters this figure
            on their device as opponent penalty points.
          </p>
          <div className="divide-y divide-line-soft">
            {PENALTIES.map((p) => {
              const count = counts[p.id] ?? 0;
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium leading-snug">
                        {p.label}
                      </span>
                    </div>
                    <div className="eyebrow mt-1.5">
                      {p.points} pts {UNIT_SUFFIX[p.unit]} ·{" "}
                      {SCOPE_LABEL[p.scope]}
                    </div>
                    {p.note ? (
                      <div className="mt-1 text-[11px] text-ink-dim">
                        {p.note}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => actions.bumpFoul(p.id, -1, p.label)}
                      disabled={count === 0}
                      aria-label={`Remove one ${p.label}`}
                      className="tap flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-shell text-ink-muted disabled:opacity-25"
                    >
                      &minus;
                    </button>
                    <span
                      className="tnum w-7 text-center font-mono text-[15px] font-bold"
                      style={
                        count > 0 ? { color: "var(--color-signal)" } : undefined
                      }
                    >
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => actions.bumpFoul(p.id, 1, p.label)}
                      aria-label={`Add one ${p.label}`}
                      className="tap flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-raised text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
