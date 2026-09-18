"use client";

/**
 * The primary scoring control. The whole tile adds one, so the tap never has
 * to be accurate; the small corner button is the only thing that subtracts.
 * On a phone these grow to fill the screen.
 */
export function Tile({
  label,
  worth,
  value,
  points,
  onAdd,
  onSubtract,
  active,
  shortcut,
  wide,
}: {
  label: string;
  worth: string;
  value: number;
  points: string;
  onAdd: () => void;
  onSubtract: () => void;
  active: boolean;
  shortcut?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`counter panel relative flex min-h-[96px] overflow-hidden transition-colors ${
        wide ? "col-span-2" : ""
      }`}
      style={
        active
          ? {
              borderColor:
                "color-mix(in oklab, var(--accent) 50%, var(--color-line))",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--accent) 9%, var(--color-panel)), var(--color-panel))",
            }
          : undefined
      }
    >
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add one ${label}`}
        className="add-zone absolute inset-0 z-0"
      />

      <div className="tile-body pointer-events-none relative z-10 flex w-full flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className="font-mono text-[11px] font-bold uppercase leading-none tracking-[0.13em]"
            style={{
              color: active ? "var(--accent)" : "var(--color-ink-muted)",
            }}
          >
            {label}
          </span>
          {shortcut ? (
            <kbd className="hidden shrink-0 rounded border border-line bg-shell px-1.5 py-0.5 font-mono text-[10px] text-ink-dim lg:block">
              {shortcut}
            </kbd>
          ) : null}
        </div>

        <span className="mt-0.5 text-[11px] font-medium text-ink-dim">
          {worth}
        </span>

        <div className="flex flex-1 items-center">
          <span
            className={`tile-num tnum font-mono font-bold leading-none tracking-tighter ${
              wide
                ? "text-[clamp(2.5rem,14vw,4.5rem)]"
                : "text-[clamp(2rem,12vw,3.5rem)]"
            }`}
          >
            {value}
          </span>
        </div>

        <div className="flex items-end justify-between gap-2">
          <span className="tnum font-mono text-[12px] font-medium text-ink-muted">
            {points}
          </span>
          <button
            type="button"
            onClick={onSubtract}
            disabled={value === 0}
            aria-label={`Remove one ${label}`}
            className="tile-minus tap pointer-events-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line bg-shell text-[22px] font-semibold text-ink-muted hover:text-ink disabled:opacity-20"
          >
            &minus;
          </button>
        </div>
      </div>
    </div>
  );
}

/** Once-per-match objectives, as a row of three wide chips. */
export function Objective({
  label,
  worth,
  on,
  onToggle,
  note,
  shortcut,
}: {
  label: string;
  worth: number;
  on: boolean;
  onToggle: () => void;
  note?: string;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="objective tap panel flex min-h-[60px] flex-col justify-center gap-1 px-3 py-2 text-left"
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
      <div className="flex items-center gap-1.5">
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors"
          style={{
            borderColor: on ? "var(--accent)" : "var(--color-line)",
            background: on ? "var(--accent)" : "transparent",
          }}
        >
          {on ? (
            <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
              <path
                d="M3.5 8.5 6.5 11.5 12.5 5"
                fill="none"
                stroke="#0b0c0f"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="font-mono text-[10px] font-bold uppercase leading-none tracking-[0.1em]">
          {label}
        </span>
        {shortcut ? (
          <kbd className="ml-auto hidden rounded border border-line bg-shell px-1 py-0.5 font-mono text-[9px] text-ink-dim lg:block">
            {shortcut}
          </kbd>
        ) : null}
      </div>

      <span
        className="tnum font-mono text-[20px] font-bold leading-none"
        style={{ color: on ? "var(--accent)" : "var(--color-ink-dim)" }}
      >
        {worth}
      </span>

      {note ? (
        <span className="hidden text-[11px] leading-snug text-ink-dim lg:block">
          {note}
        </span>
      ) : null}
    </button>
  );
}
