"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  POINTS,
  giftedPoints,
  phaseLabel,
  score,
  totalGamePieces,
} from "@/lib/game";
import { actions, timer, useApp } from "@/lib/store";
import { useClock } from "@/components/useClock";
import { Button, Panel, Row, Section } from "@/components/ui";
import { Counter } from "@/components/score/Counter";
import { Flag } from "@/components/score/Flags";
import { Fouls } from "@/components/score/Fouls";
import { IconPause, IconPlay, IconRedo, IconUndo } from "@/components/icons";

export default function ScoreConsole() {
  const app = useApp();
  const clock = useClock();
  const t = app.live.tally;
  const b = score(t);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const inAuto = clock.phase === "auto" || clock.phase === "pre";
  const inTeleop = clock.phase === "teleop" || clock.phase === "transition";
  const inEndgame = clock.phase === "teleop" && clock.remaining <= 30;

  // Keyboard shortcuts — a scorekeeper on a laptop should never need the mouse.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key.toLowerCase();
      const map: Record<string, () => void> = {
        a: () => actions.bump("artefacts", 1),
        r: () => actions.bump(inAuto ? "relicsAuto" : "relicsTeleop", 1),
        l: () => actions.bump("laps", 1),
        m: () => actions.toggleFlag("mobilise"),
        d: () => actions.toggleFlag("dock"),
        c: () => actions.toggleFlag("camp"),
        z: () => (e.shiftKey ? actions.redo() : actions.undo()),
        " ": () => timer.toggle(),
      };
      const fn = map[k];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inAuto]);

  const handleSave = () => {
    if (!confirmSave) {
      setConfirmSave(true);
      setTimeout(() => setConfirmSave(false), 4000);
      return;
    }
    const record = actions.commit();
    setConfirmSave(false);
    if (record) {
      setSaved(record.matchNumber);
      setTimeout(() => setSaved(null), 3500);
    }
  };

  return (
    <div className="grid gap-5 pt-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      {/* ---------------- Primary column ---------------- */}
      <div className="grid gap-5">
        {/* Live score */}
        <Panel className="hatch relative overflow-hidden" padded={false}>
          <div className="flex flex-wrap items-end justify-between gap-6 p-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="eyebrow" style={{ color: "var(--accent)" }}>
                  Live score
                </span>
                <span className="eyebrow">· {phaseLabel(clock.phase)}</span>
              </div>
              <div className="tnum mt-1 font-mono text-[68px] font-bold leading-none tracking-tighter sm:text-[84px]">
                {b.final}
              </div>
              <div className="mt-2 text-[12px] text-ink-dim">
                {b.earned} earned
                {t.opponentPenaltyPoints > 0
                  ? ` + ${t.opponentPenaltyPoints} from opponent fouls`
                  : ""}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-7 gap-y-3 pb-1">
              <Mini label="Game pieces" value={totalGamePieces(t)} />
              <Mini label="Laps" value={t.laps} />
              <Mini
                label="Next lap"
                value={`+${b.nextLapValue}`}
                accent={b.nextLapValue > 0}
              />
              <Mini
                label="Next artefact"
                value={`+${b.nextArtefactValue}`}
                accent={t.laps > 0}
              />
            </dl>
          </div>

          {/* The excavation multiplier is the whole strategy of this game, so
              it gets its own readout rather than hiding in a total. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line-soft px-5 py-3 font-mono text-[12px]">
            <span className="eyebrow">Excavate</span>
            <span className="tnum text-ink-muted">{b.gamePiece}</span>
            <span className="text-ink-dim">×</span>
            <span className="tnum text-ink-muted">{POINTS.lapFactor}</span>
            <span className="text-ink-dim">×</span>
            <span className="tnum text-ink-muted">{t.laps} laps</span>
            <span className="text-ink-dim">=</span>
            <span className="tnum font-bold" style={{ color: "var(--accent)" }}>
              {b.excavation}
            </span>
          </div>
        </Panel>

        {/* Clock control + undo */}
        <div className="flex items-center gap-2">
          <Button
            variant={clock.running ? "solid" : "accent"}
            size="lg"
            onClick={() => timer.toggle()}
            className="min-w-0 flex-1 sm:flex-none sm:min-w-[140px]"
          >
            {clock.running ? (
              <IconPause className="h-4 w-4" />
            ) : (
              <IconPlay className="h-4 w-4" />
            )}
            <span className="truncate">
              {clock.running
                ? "Pause"
                : clock.started
                  ? "Resume"
                  : "Start match"}
            </span>
          </Button>
          <Link href="/timer" className="contents">
            <Button variant="ghost" size="lg" className="shrink-0">
              <span className="hidden sm:inline">Full clock</span>
              <span className="sm:hidden">Clock</span>
            </Button>
          </Link>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => actions.undo()}
              disabled={app.undo.length === 0}
              title="Undo (Z)"
            >
              <IconUndo className="h-4 w-4" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => actions.redo()}
              disabled={app.redo.length === 0}
              title="Redo (Shift+Z)"
            >
              <IconRedo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Counters */}
        <Section title="Game pieces">
          <div className="grid gap-3 sm:grid-cols-2">
            <Counter
              label="Relic — auto"
              worth={`${POINTS.relicAuto} pts each`}
              value={t.relicsAuto}
              points={`${b.relicsAuto} pts`}
              onAdd={() => actions.bump("relicsAuto", 1)}
              onSubtract={() => actions.bump("relicsAuto", -1)}
              active={inAuto}
              shortcut="R"
              hint="Taped balls, acquired before AUTO ends"
            />
            <Counter
              label="Artefact"
              worth={`${POINTS.artefact} pts each`}
              value={t.artefacts}
              points={`${b.artefacts} pts`}
              onAdd={() => actions.bump("artefacts", 1)}
              onSubtract={() => actions.bump("artefacts", -1)}
              active={inTeleop}
              shortcut="A"
              hint="Fully supported, off the ground"
            />
            <Counter
              label="Relic — teleop"
              worth={`${POINTS.relicTeleop} pts each`}
              value={t.relicsTeleop}
              points={`${b.relicsTeleop} pts`}
              onAdd={() => actions.bump("relicsTeleop", 1)}
              onSubtract={() => actions.bump("relicsTeleop", -1)}
              active={inTeleop}
              hint="After AUTO, relics score as artefacts"
            />
            <Counter
              label="Excavation lap"
              worth={`× ${POINTS.lapFactor} of game piece points`}
              value={t.laps}
              points={`${b.excavation} pts`}
              onAdd={() => actions.bump("laps", 1)}
              onSubtract={() => actions.bump("laps", -1)}
              active={inTeleop}
              shortcut="L"
              hint="Continuous clockwise lap of the DIG SITE"
            />
          </div>
        </Section>

        {/* Flags */}
        <Section title="Objectives">
          <div className="grid gap-2.5">
            <Flag
              label="MOBILISE from DIG SITE"
              worth={`${POINTS.mobilise}`}
              on={t.mobilise}
              onToggle={() => actions.toggleFlag("mobilise")}
              note="Bumpers clear of the DIG SITE when AUTO ends"
              shortcut="M"
            />
            <Flag
              label="DOCK at DIG SITE"
              worth={`${POINTS.dock}`}
              on={t.dock}
              onToggle={() => actions.toggleFlag("dock")}
              note="Bumpers touching the DIG SITE at match end"
              shortcut="D"
            />
            <Flag
              label="SETUP CAMP"
              worth={`${POINTS.camp}`}
              on={t.camp}
              onToggle={() => actions.toggleFlag("camp")}
              note={
                t.dock
                  ? "Highest extension at match end, held 5 seconds"
                  : "Requires a DOCK — toggling this will set DOCK too"
              }
              shortcut="C"
            />
          </div>
          {inEndgame ? (
            <p
              className="enter mt-2.5 rounded-lg border px-3 py-2 text-[12px]"
              style={{
                borderColor:
                  "color-mix(in oklab, var(--color-signal) 30%, transparent)",
                background:
                  "color-mix(in oklab, var(--color-signal) 10%, transparent)",
                color: "var(--color-signal)",
              }}
            >
              Endgame window — watch for DOCK and the 5 second CAMP hold.
            </p>
          ) : null}
        </Section>
      </div>

      {/* ---------------- Secondary column ---------------- */}
      <div className="grid gap-5 lg:sticky lg:top-[4.5rem]">
        <Section title="Breakdown">
          <Panel>
            <Row label="MOBILISE" value={b.mobilise} muted={!t.mobilise} />
            <Row
              label="RELICS — auto"
              sub={
                t.relicsAuto
                  ? `${t.relicsAuto} × ${POINTS.relicAuto}`
                  : undefined
              }
              value={b.relicsAuto}
              muted={!b.relicsAuto}
            />
            <Row
              label="RELICS — teleop"
              sub={
                t.relicsTeleop
                  ? `${t.relicsTeleop} × ${POINTS.relicTeleop}`
                  : undefined
              }
              value={b.relicsTeleop}
              muted={!b.relicsTeleop}
            />
            <Row
              label="ARTEFACTS"
              sub={
                t.artefacts ? `${t.artefacts} × ${POINTS.artefact}` : undefined
              }
              value={b.artefacts}
              muted={!b.artefacts}
            />
            <div className="my-1 border-t border-line-soft" />
            <Row label="Game piece points" value={b.gamePiece} strong />
            <Row
              label="EXCAVATE"
              sub={t.laps ? `${t.laps} laps` : undefined}
              value={b.excavation}
              muted={!b.excavation}
              accent={b.excavation > 0}
            />
            <div className="my-1 border-t border-line-soft" />
            <Row label="DOCK" value={b.dock} muted={!b.dock} />
            <Row label="SETUP CAMP" value={b.camp} muted={!b.camp} />
            <div className="my-1 border-t border-line" />
            <Row label="Earned" value={b.earned} strong />
            <Row
              label="Opponent fouls"
              value={`+${t.opponentPenaltyPoints}`}
              muted={t.opponentPenaltyPoints === 0}
            />
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-[13px] font-semibold">Final</span>
              <span
                className="tnum font-mono text-[26px] font-bold leading-none"
                style={{ color: "var(--accent)" }}
              >
                {b.final}
              </span>
            </div>
          </Panel>
        </Section>

        <Section title="Penalties">
          <div className="grid gap-3">
            <Fouls counts={t.fouls} gifted={giftedPoints(t.fouls)} />
            <Panel>
              <label className="eyebrow block" htmlFor="opp-pen">
                Opponent penalty points
              </label>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
                Fouls the other robot committed are credited to us. Ask the
                other scorekeeper for their gifted total and enter it here.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="opp-pen"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={t.opponentPenaltyPoints || ""}
                  placeholder="0"
                  onChange={(e) =>
                    actions.setOpponentPenaltyPoints(Number(e.target.value))
                  }
                  className="field tnum w-full font-mono"
                />
                <Button
                  variant="ghost"
                  onClick={() => actions.setOpponentPenaltyPoints(0)}
                  disabled={t.opponentPenaltyPoints === 0}
                >
                  Clear
                </Button>
              </div>
            </Panel>
          </div>
        </Section>

        <Section
          title="Match notes"
          aside={
            <span className="eyebrow">
              {app.live.notes.length} chars · autosaved
            </span>
          }
        >
          <textarea
            value={app.live.notes}
            onChange={(e) => actions.setNotes(e.target.value)}
            rows={5}
            placeholder="Defence, breakdowns, contested calls, anything the drive team should know…"
            className="field w-full resize-y text-[13px] leading-relaxed"
          />
        </Section>

        <Section title="End of match">
          <div className="grid gap-2">
            <Button
              variant={confirmSave ? "accent" : "solid"}
              size="lg"
              onClick={handleSave}
              disabled={app.live.events.length === 0 && !app.live.notes.trim()}
            >
              {confirmSave
                ? "Tap again to confirm"
                : `Save match ${app.live.matchNumber || ""} to logs`}
            </Button>
            {saved ? (
              <p
                className="enter text-center text-[12px] font-medium"
                style={{ color: "var(--color-go)" }}
              >
                Match {saved} saved. Clock and score reset.
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => actions.clearLive()}
              >
                Reset without saving
              </Button>
              <Link href="/logs" className="contents">
                <Button variant="ghost" className="flex-1">
                  View logs
                </Button>
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd
        className="tnum mt-1.5 font-mono text-[19px] font-bold leading-none"
        style={accent ? { color: "var(--accent)" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
