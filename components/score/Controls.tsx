"use client";

/**
 * A counter row: a big minus, the count, and a bigger plus. Both targets are
 * explicit — nothing on this screen changes the score when you did not mean
 * it to.
 */
export function Counter({
  label,
  worth,
  value,
  onAdd,
  onSubtract,
  locked,
  lockNote,
}: {
  label: string;
  worth?: string;
  value: number;
  onAdd: () => void;
  onSubtract: () => void;
  locked?: boolean;
  lockNote?: string;
}) {
  return (
    <div
      className={`panel flex min-h-[84px] flex-1 items-stretch overflow-hidden ${
        locked ? "opacity-55" : ""
      }`}
    >
      <button
        type="button"
        onClick={onSubtract}
        disabled={value === 0}
        aria-label={`Remove one ${label}`}
        className="tap flex w-[68px] shrink-0 items-center justify-center border-r border-line text-ink-muted disabled:opacity-30 sm:w-[84px]"
      >
        <Glyph minus />
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-2">
        <span className="flex items-baseline gap-1.5 text-center">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
            {label}
          </span>
          {worth ? (
            <span className="font-mono text-[11px] text-ink-dim">{worth}</span>
          ) : null}
        </span>
        <span className="tnum font-mono text-[clamp(2rem,10vw,3rem)] font-bold leading-none">
          {value}
        </span>
        {locked && lockNote ? (
          <span className="text-center text-[10px] leading-tight text-ink-dim">
            {lockNote}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={locked}
        aria-label={`Add one ${label}`}
        className="tap flex w-[104px] shrink-0 items-center justify-center border-l disabled:opacity-30 sm:w-[128px]"
        style={{
          borderColor:
            "color-mix(in oklab, var(--accent) 35%, var(--color-line))",
          background: locked ? "transparent" : "var(--accent-deep)",
          color: "var(--accent)",
        }}
      >
        <Glyph />
      </button>
    </div>
  );
}

function Glyph({ minus }: { minus?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 12h16" />
      {minus ? null : <path d="M12 4v16" />}
    </svg>
  );
}

/** A once-per-match objective. */
export function Objective({
  label,
  worth,
  on,
  onToggle,
}: {
  label: string;
  worth: number;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="tap panel flex min-h-[64px] flex-col items-center justify-center gap-1.5 px-2 py-2"
      style={
        on
          ? {
              borderColor:
                "color-mix(in oklab, var(--accent) 55%, transparent)",
              background: "var(--accent-deep)",
            }
          : undefined
      }
    >
      <span
        className="font-mono text-[10px] font-bold uppercase tracking-[0.1em]"
        style={{ color: on ? "var(--accent)" : "var(--color-ink-muted)" }}
      >
        {label}
      </span>
      <span
        className="tnum font-mono text-[19px] font-bold leading-none"
        style={{ color: on ? "var(--accent)" : "var(--color-ink-dim)" }}
      >
        {on ? `+${worth}` : worth}
      </span>
    </button>
  );
}
