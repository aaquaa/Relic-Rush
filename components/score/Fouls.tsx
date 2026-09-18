"use client";

import { useState } from "react";
import { PENALTIES, type PenaltyUnit } from "@/lib/game";
import { actions } from "@/lib/store";
import { Panel } from "@/components/ui";

const UNIT: Record<PenaltyUnit, string> = {
  artefact: "each",
  second: "per sec",
  incident: "",
};

export function Fouls({
  counts,
  gifted,
  opponentPoints,
}: {
  counts: Record<string, number>;
  gifted: number;
  opponentPoints: number;
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
          <span className="block text-[13px] font-semibold">
            {active.length === 0
              ? "No penalties recorded"
              : `${active.length} recorded`}
          </span>
          <span className="mt-1 block text-[12px] text-ink-dim">
            Only open this if a referee calls something
          </span>
        </span>
        {gifted > 0 ? (
          <span
            className="tnum font-mono text-[18px] font-bold"
            style={{ color: "var(--color-signal)" }}
          >
            &minus;{gifted}
          </span>
        ) : null}
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

      {open ? (
        <div className="enter border-t border-line-soft">
          <p className="px-4 pt-3 text-[12px] leading-relaxed text-ink-dim">
            Record fouls committed by the robot you are watching. Their points
            go to the other alliance.
          </p>

          <div className="divide-y divide-line-soft">
            {PENALTIES.map((p) => {
              const count = counts[p.id] ?? 0;
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] leading-snug">{p.label}</div>
                    <div className="eyebrow mt-1">
                      {p.points} {UNIT[p.unit]}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => actions.bumpFoul(p.id, -1, p.label)}
                      disabled={count === 0}
                      aria-label={`Remove one ${p.label}`}
                      className="tap flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-shell text-ink-muted disabled:opacity-25"
                    >
                      &minus;
                    </button>
                    <span
                      className="tnum w-6 text-center font-mono text-[15px] font-bold"
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
                      className="tap flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-raised text-ink"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-line-soft p-4">
            <label className="eyebrow block" htmlFor="opp-pen">
              Points from the other robot&apos;s fouls
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="opp-pen"
                type="number"
                inputMode="numeric"
                min={0}
                value={opponentPoints || ""}
                placeholder="0"
                onChange={(e) =>
                  actions.setOpponentPenaltyPoints(Number(e.target.value))
                }
                className="field tnum h-12 w-full font-mono"
              />
              <button
                type="button"
                onClick={() => actions.setOpponentPenaltyPoints(0)}
                disabled={opponentPoints === 0}
                className="tap h-12 shrink-0 rounded-xl border border-line px-4 text-[13px] font-semibold text-ink-muted disabled:opacity-30"
              >
                Clear
              </button>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
              Ask the other scorekeeper for their total and enter it here.
            </p>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}
