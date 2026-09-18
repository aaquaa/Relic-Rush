"use client";

import { useMemo, useState } from "react";
import { MANUAL, SCORING_TABLE, sectionText, type Block } from "@/lib/manual";
import { PENALTIES, POINTS, TIMING, formatClock } from "@/lib/game";
import { Panel, Section } from "@/components/ui";
import { IconSearch } from "@/components/icons";

const TAGS = [
  "All",
  "Overview",
  "Field",
  "Tasks",
  "Scoring",
  "Penalties",
  "Rules",
] as const;

const QUICK = [
  { label: "Relic — auto", value: POINTS.relicAuto, unit: "each" },
  { label: "Relic — teleop", value: POINTS.relicTeleop, unit: "each" },
  { label: "Artefact", value: POINTS.artefact, unit: "each" },
  { label: "Mobilise", value: POINTS.mobilise, unit: "once" },
  { label: "Dock", value: POINTS.dock, unit: "once" },
  { label: "Setup camp", value: POINTS.camp, unit: "once" },
];

export default function Rulebook() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");

  const q = query.trim().toLowerCase();

  const sections = useMemo(
    () =>
      MANUAL.filter(
        (s) =>
          (tag === "All" || s.tag === tag) &&
          (!q || sectionText(s).includes(q)),
      ),
    [q, tag],
  );

  const penalties = useMemo(
    () => PENALTIES.filter((p) => !q || p.label.toLowerCase().includes(q)),
    [q],
  );

  const showPenalties =
    (tag === "All" || tag === "Penalties") && penalties.length > 0;
  const showScoring = tag === "All" || tag === "Scoring";

  return (
    <div className="grid gap-5 pt-5">
      <header>
        <h1 className="text-[22px] font-bold tracking-tight">Game manual</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          2026 TDU Offseason Challenge: Relic Rush · AUTO{" "}
          {formatClock(TIMING.auto)} · TELEOP {formatClock(TIMING.teleop)}
        </p>
      </header>

      <div className="sticky top-[3.6rem] z-20 -mx-4 bg-void/92 px-4 py-2.5 backdrop-blur">
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the manual — dock, relic, pinning, height…"
            className="field w-full pl-9 text-[13px]"
            type="search"
          />
        </div>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className="tap shrink-0 rounded-lg border px-2.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em]"
              style={
                tag === t
                  ? {
                      borderColor:
                        "color-mix(in oklab, var(--accent) 45%, transparent)",
                      background: "var(--accent-deep)",
                      color: "var(--accent)",
                    }
                  : {
                      borderColor: "var(--color-line)",
                      color: "var(--color-ink-dim)",
                    }
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {!q && tag === "All" ? (
        <Section title="Quick reference">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {QUICK.map((item) => (
              <div key={item.label} className="panel p-3">
                <div className="eyebrow">{item.label}</div>
                <div className="tnum mt-2 font-mono text-[24px] font-bold leading-none">
                  {item.value}
                </div>
                <div className="mt-1.5 text-[11px] text-ink-dim">
                  pts {item.unit}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
            EXCAVATE multiplies your total ARTEFACT and RELIC points by{" "}
            {POINTS.lapFactor} for every completed lap, so laps are worth more
            the more game pieces you hold.
          </p>
        </Section>
      ) : null}

      {showScoring ? (
        <Section title="Scoring criteria">
          <Panel padded={false}>
            <div className="hidden grid-cols-[1.6fr_repeat(3,0.8fr)] border-b border-line px-4 py-2.5 sm:grid">
              {["Task", "Autonomous", "Teleop", "Endgame"].map((h) => (
                <span key={h} className="eyebrow">
                  {h}
                </span>
              ))}
            </div>
            <div className="divide-y divide-line-soft">
              {SCORING_TABLE.map((r) => (
                <div
                  key={r.task}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[1.6fr_repeat(3,0.8fr)] sm:items-baseline sm:gap-0"
                >
                  <span className="text-[13px] font-medium">{r.task}</span>
                  <Cell head="Auto" value={r.auto} />
                  <Cell head="Teleop" value={r.teleop} />
                  <Cell head="Endgame" value={r.endgame} />
                </div>
              ))}
            </div>
          </Panel>
        </Section>
      ) : null}

      {sections.map((s) => (
        <Section
          key={s.id}
          title={s.title}
          aside={<span className="eyebrow">{s.tag}</span>}
        >
          <Panel>
            <div className="grid gap-2.5">
              {s.blocks.map((b, i) => (
                <BlockView key={i} block={b} highlight={q} />
              ))}
            </div>
          </Panel>
        </Section>
      ))}

      {showPenalties ? (
        <Section
          title="Penalties"
          aside={
            <span className="eyebrow">credited to the other alliance</span>
          }
        >
          <Panel padded={false}>
            <div className="divide-y divide-line-soft">
              {penalties.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium leading-snug">
                      <Highlighted text={p.label} query={q} />
                    </div>
                    {p.note ? (
                      <div className="mt-1 text-[11px] text-ink-dim">
                        {p.note}
                      </div>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className="tnum font-mono text-[16px] font-bold"
                      style={{ color: "var(--color-signal)" }}
                    >
                      {p.points}
                    </div>
                    <div className="eyebrow mt-1">
                      {p.unit === "incident" ? "flat" : `per ${p.unit}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Section>
      ) : null}

      {sections.length === 0 && !showPenalties && !showScoring ? (
        <Panel className="py-12 text-center">
          <p className="text-[14px] font-semibold">No matches for “{query}”</p>
          <p className="mt-1 text-[13px] text-ink-dim">
            Try dock, relic, excavate, pinning or height.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}

function Cell({ head, value }: { head: string; value: string }) {
  const empty = value === "—";
  return (
    <span className="flex items-baseline gap-2 sm:block">
      <span className="eyebrow w-16 sm:hidden">{head}</span>
      <span
        className={`tnum font-mono text-[13px] ${empty ? "text-ink-dim" : "font-semibold"}`}
      >
        {value}
      </span>
    </span>
  );
}

function BlockView({ block, highlight }: { block: Block; highlight: string }) {
  if (block.kind === "li") {
    return (
      <div className="flex gap-2.5">
        <span
          className="mt-[9px] h-1 w-1 shrink-0 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        <p className="text-[13px] leading-relaxed text-ink-muted">
          <Highlighted text={block.text} query={highlight} />
        </p>
      </div>
    );
  }
  if (block.kind === "sub") {
    return (
      <p className="ml-5 border-l border-line pl-3 text-[12px] leading-relaxed text-ink-dim">
        <Highlighted text={block.text} query={highlight} />
      </p>
    );
  }
  if (block.kind === "note") {
    return (
      <p
        className="rounded-lg border px-3 py-2.5 text-[12px] leading-relaxed"
        style={{
          borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
          background: "var(--accent-deep)",
          color: "var(--accent-ink)",
        }}
      >
        <Highlighted text={block.text} query={highlight} />
      </p>
    );
  }
  return (
    <p className="text-[13px] leading-relaxed text-ink-muted">
      <Highlighted text={block.text} query={highlight} />
    </p>
  );
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const i = text.toLowerCase().indexOf(query);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark
        className="rounded px-0.5"
        style={{
          background: "color-mix(in oklab, var(--accent) 30%, transparent)",
          color: "inherit",
        }}
      >
        {text.slice(i, i + query.length)}
      </mark>
      {text.slice(i + query.length)}
    </>
  );
}
