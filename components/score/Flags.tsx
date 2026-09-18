"use client";

export function Flag({
  label,
  worth,
  on,
  onToggle,
  disabled,
  note,
  shortcut,
}: {
  label: string;
  worth: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  note?: string;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      className="tap panel flex w-full items-center gap-3 p-3.5 text-left disabled:opacity-40"
      style={
        on
          ? {
              borderColor:
                "color-mix(in oklab, var(--accent) 50%, transparent)",
              background: "var(--accent-deep)",
            }
          : undefined
      }
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors"
        style={{
          borderColor: on ? "var(--accent)" : "var(--color-line)",
          background: on ? "var(--accent)" : "transparent",
        }}
      >
        {on ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
            <path
              d="M3.5 8.5 6.5 11.5 12.5 5"
              fill="none"
              stroke="#0b0c0f"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold tracking-tight">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] text-ink-dim">
          {note ?? worth}
        </span>
      </span>

      <span
        className="tnum shrink-0 font-mono text-[13px] font-bold"
        style={{ color: on ? "var(--accent)" : "var(--color-ink-dim)" }}
      >
        {worth}
      </span>

      {shortcut ? (
        <kbd className="hidden rounded border border-line bg-shell px-1.5 py-0.5 font-mono text-[10px] text-ink-dim lg:block">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}
