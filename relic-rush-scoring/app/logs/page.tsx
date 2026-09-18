"use client";

import { useMemo, useState } from "react";
import {
  PENALTY_BY_ID,
  formatClock,
  giftedPoints,
  phaseLabel,
  score,
  totalGamePieces,
} from "@/lib/game";
import { actions, useApp, type LogEvent, type MatchRecord } from "@/lib/store";
import { download, stamp, toCSV } from "@/lib/export";
import { Button, Empty, Panel, Row, Section } from "@/components/ui";

export default function Logs() {
  const app = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const records = app.history;

  const stats = useMemo(() => summarise(records), [records]);
  const liveEvents = app.live.events;

  return (
    <div className="grid gap-5 pt-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">Match logs</h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            {records.length === 0
              ? "Saved matches appear here. Everything stays on this device."
              : `${records.length} saved ${records.length === 1 ? "match" : "matches"} on this device`}
          </p>
        </div>
        {records.length > 0 ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                download(
                  `relic-rush-${stamp()}.csv`,
                  toCSV(records),
                  "text/csv",
                )
              }
            >
              Export CSV
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                download(
                  `relic-rush-${stamp()}.json`,
                  JSON.stringify(records, null, 2),
                  "application/json",
                )
              }
            >
              JSON
            </Button>
          </div>
        ) : null}
      </header>

      {records.length > 0 ? (
        <Section title="Across all saved matches">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Matches" value={stats.count} />
            <Stat label="Best final" value={stats.best} accent />
            <Stat label="Average final" value={stats.avg} />
            <Stat label="Game pieces" value={stats.pieces} />
            <Stat label="Laps" value={stats.laps} />
            <Stat
              label="Points gifted"
              value={stats.gifted}
              warn={stats.gifted > 0}
            />
          </div>
        </Section>
      ) : null}

      {liveEvents.length > 0 ? (
        <Section
          title={`Live match ${app.live.matchNumber} — event log`}
          aside={<span className="eyebrow">{liveEvents.length} entries</span>}
        >
          <Timeline events={liveEvents} />
        </Section>
      ) : null}

      <Section
        title="History"
        aside={
          records.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (confirmClear) {
                  actions.clearHistory();
                  setConfirmClear(false);
                } else {
                  setConfirmClear(true);
                  setTimeout(() => setConfirmClear(false), 4000);
                }
              }}
              className="eyebrow hover:text-fault"
              style={confirmClear ? { color: "var(--color-fault)" } : undefined}
            >
              {confirmClear ? "Tap again to erase all" : "Clear history"}
            </button>
          ) : null
        }
      >
        {records.length === 0 ? (
          <Empty
            title="No saved matches yet"
            hint="Score a match on the console, then use “Save match to logs”. Logs live in this browser only — export CSV to keep a copy."
          />
        ) : (
          <div className="grid gap-2">
            {records.map((r) => (
              <RecordCard
                key={r.id}
                record={r}
                open={open === r.id}
                onToggle={() => setOpen(open === r.id ? null : r.id)}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function summarise(records: MatchRecord[]) {
  if (records.length === 0) {
    return { count: 0, best: 0, avg: 0, pieces: 0, laps: 0, gifted: 0 };
  }
  const finals = records.map((r) => score(r.tally).final);
  return {
    count: records.length,
    best: Math.max(...finals),
    avg: Math.round(finals.reduce((a, b) => a + b, 0) / records.length),
    pieces: records.reduce((n, r) => n + totalGamePieces(r.tally), 0),
    laps: records.reduce((n, r) => n + r.tally.laps, 0),
    gifted: records.reduce((n, r) => n + giftedPoints(r.tally.fouls), 0),
  };
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="panel p-3">
      <div className="eyebrow">{label}</div>
      <div
        className="tnum mt-2 font-mono text-[24px] font-bold leading-none"
        style={{
          color: warn
            ? "var(--color-signal)"
            : accent
              ? "var(--accent)"
              : undefined,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function RecordCard({
  record,
  open,
  onToggle,
}: {
  record: MatchRecord;
  open: boolean;
  onToggle: () => void;
}) {
  const b = score(record.tally);
  const gifted = giftedPoints(record.tally.fouls);
  const fouls = Object.entries(record.tally.fouls);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Panel padded={false} className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="tap flex w-full items-center gap-4 p-4 text-left"
      >
        <span
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl font-mono"
          style={{
            background:
              record.alliance === "red"
                ? "var(--color-red-deep)"
                : "var(--color-blue-deep)",
            color:
              record.alliance === "red"
                ? "var(--color-red-alliance)"
                : "var(--color-blue-alliance)",
          }}
        >
          <span className="text-[9px] leading-none opacity-70">M</span>
          <span className="tnum text-[15px] font-bold leading-tight">
            {record.matchNumber}
          </span>
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">
            {record.teamName || "Unnamed team"}
            {record.opponentName ? (
              <span className="font-normal text-ink-dim">
                {" "}
                vs {record.opponentName}
              </span>
            ) : null}
          </span>
          <span className="eyebrow mt-1 block">
            {totalGamePieces(record.tally)} pieces · {record.tally.laps} laps ·{" "}
            {new Date(record.savedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span
            className="tnum block font-mono text-[22px] font-bold leading-none"
            style={{
              color:
                record.alliance === "red"
                  ? "var(--color-red-alliance)"
                  : "var(--color-blue-alliance)",
            }}
          >
            {b.final}
          </span>
          <span className="eyebrow mt-1 block">final</span>
        </span>
      </button>

      {open ? (
        <div className="enter grid gap-4 border-t border-line-soft p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow mb-1">Breakdown</h3>
              <Row label="MOBILISE" value={b.mobilise} muted={!b.mobilise} />
              <Row
                label="RELICS — auto"
                sub={
                  record.tally.relicsAuto
                    ? `${record.tally.relicsAuto}×`
                    : undefined
                }
                value={b.relicsAuto}
                muted={!b.relicsAuto}
              />
              <Row
                label="RELICS — teleop"
                sub={
                  record.tally.relicsTeleop
                    ? `${record.tally.relicsTeleop}×`
                    : undefined
                }
                value={b.relicsTeleop}
                muted={!b.relicsTeleop}
              />
              <Row
                label="ARTEFACTS"
                sub={
                  record.tally.artefacts
                    ? `${record.tally.artefacts}×`
                    : undefined
                }
                value={b.artefacts}
                muted={!b.artefacts}
              />
              <Row
                label="EXCAVATE"
                sub={
                  record.tally.laps ? `${record.tally.laps} laps` : undefined
                }
                value={b.excavation}
                muted={!b.excavation}
                accent={b.excavation > 0}
              />
              <Row label="DOCK" value={b.dock} muted={!b.dock} />
              <Row label="SETUP CAMP" value={b.camp} muted={!b.camp} />
              <Row label="Earned" value={b.earned} strong />
              <Row
                label="Opponent fouls"
                value={`+${record.tally.opponentPenaltyPoints}`}
                muted={record.tally.opponentPenaltyPoints === 0}
              />
            </div>

            <div className="grid content-start gap-4">
              <div>
                <h3 className="eyebrow mb-2">
                  Fouls committed ({gifted} pts gifted)
                </h3>
                {fouls.length === 0 ? (
                  <p className="text-[12px] text-ink-dim">None recorded.</p>
                ) : (
                  <ul className="grid gap-1.5">
                    {fouls.map(([id, count]) => (
                      <li
                        key={id}
                        className="flex items-baseline gap-2 text-[12px]"
                      >
                        <span
                          className="tnum font-mono font-bold"
                          style={{ color: "var(--color-signal)" }}
                        >
                          {count}×
                        </span>
                        <span className="text-ink-muted">
                          {PENALTY_BY_ID[id]?.label ?? id}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="eyebrow mb-2">Notes</h3>
                <textarea
                  value={record.notes}
                  onChange={(e) =>
                    actions.updateRecordNotes(record.id, e.target.value)
                  }
                  rows={4}
                  placeholder="Add a note after the fact…"
                  className="field w-full resize-y text-[12px] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {record.events.length > 0 ? (
            <div>
              <h3 className="eyebrow mb-2">
                Event log ({record.events.length})
              </h3>
              <Timeline events={record.events} dense />
            </div>
          ) : null}

          <div className="flex justify-end border-t border-line-soft pt-3">
            <Button
              variant={confirmDelete ? "danger" : "ghost"}
              size="sm"
              onClick={() => {
                if (confirmDelete) actions.deleteRecord(record.id);
                else {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 4000);
                }
              }}
            >
              {confirmDelete ? "Tap again to delete" : "Delete match"}
            </Button>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

function Timeline({ events, dense }: { events: LogEvent[]; dense?: boolean }) {
  const ordered = [...events].reverse();
  return (
    <Panel padded={false} className={dense ? "" : ""}>
      <ol className="max-h-80 divide-y divide-line-soft overflow-y-auto">
        {ordered.map((e) => (
          <li key={e.id} className="flex items-center gap-3 px-3.5 py-2">
            <span className="tnum w-12 shrink-0 font-mono text-[11px] text-ink-dim">
              {e.matchTime === null ? "—" : formatClock(e.matchTime)}
            </span>
            <span
              className="w-1 shrink-0 self-stretch rounded-full"
              style={{
                background: e.kind.startsWith("foul:")
                  ? "var(--color-signal)"
                  : e.delta > 0
                    ? "var(--accent)"
                    : "var(--color-line)",
              }}
            />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
              {e.label}
            </span>
            <span className="eyebrow shrink-0">
              {phaseLabel(e.phase).slice(0, 4)}
            </span>
            <span
              className="tnum w-8 shrink-0 text-right font-mono text-[12px] font-bold"
              style={{
                color: e.delta > 0 ? undefined : "var(--color-ink-dim)",
              }}
            >
              {e.delta > 0 ? `+${e.delta}` : e.delta}
            </span>
            <span className="tnum w-10 shrink-0 text-right font-mono text-[11px] text-ink-dim">
              {e.pointsAfter}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
