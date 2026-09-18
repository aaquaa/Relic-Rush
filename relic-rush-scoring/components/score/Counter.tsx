"use client";

export function Counter({
  label,
  worth,
  value,
  points,
  onAdd,
  onSubtract,
  active,
  hint,
  shortcut,
}: {
  label: string;
  worth: string;
  value: number;
  points: string;
  onAdd: () => void;
  onSubtract: () => void;
  active: boolean;
  hint?: string;
  shortcut?: string;
}) {
  return (
    <div
      className="counter panel relative overflow-hidden transition-colors"
      style={
        active
          ? {
              borderColor:
                "color-mix(in oklab, var(--accent) 45%, var(--color-line))",
              background:
                "linear-gradient(180deg, color-mix(in oklab, var(--accent) 7%, var(--color-panel)), var(--color-panel))",
            }
          : undefined
      }
    >
      {/* The whole card is the add target, so the tap never has to be precise. */}
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add one ${label}`}
        className="add-zone absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative z-10 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="eyebrow"
              style={active ? { color: "var(--accent)" } : undefined}
            >
              {label}
            </div>
            <div className="mt-1 text-[11px] font-medium text-ink-dim">
              {worth}
            </div>
          </div>
          {shortcut ? (
            <kbd className="hidden rounded border border-line bg-shell px-1.5 py-0.5 font-mono text-[10px] text-ink-dim lg:block">
              {shortcut}
            </kbd>
          ) : null}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="tnum font-mono text-[46px] font-bold leading-none tracking-tight">
            {value}
          </span>
          <button
            type="button"
            onClick={onSubtract}
            disabled={value === 0}
            aria-label={`Remove one ${label}`}
            className="tap pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-shell text-[20px] font-semibold text-ink-muted hover:text-ink disabled:opacity-25"
          >
            &minus;
          </button>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-medium leading-snug text-ink-dim">
            {hint ?? "Tap anywhere to add"}
          </span>
          <span className="tnum shrink-0 font-mono text-[12px] font-medium text-ink-muted">
            {points}
          </span>
        </div>
      </div>
    </div>
  );
}
