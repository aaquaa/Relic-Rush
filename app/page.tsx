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
import { Objective, Tile } from "@/components/score/Tile";
import { Fouls } from "@/components/score/Fouls";
import { IconPause, IconPlay, IconRedo, IconUndo } from "@/components/icons";

export default function ScoreConsole() {
  const app = useApp();
  const clock = useClock();
  const t = app.live.tally;
  const b = score(t);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // Before the clock starts we assume autonomous, so a practice tap on RELIC
  // lands on the 40 point bucket rather than the 10 point one.
  const inAuto = clock.phase === "auto" || clock.phase === "pre";
  const inTeleop = clock.phase === "teleop" || clock.phase === "transition";
  const inEndgame = clock.phase === "teleop" && clock.remaining <= 30;

  const relics = t.relicsAuto + t.relicsTeleop;
  const relicPoints = b.relicsAuto + b.relicsTeleop;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const map: Record<string, () => void> = {
        a: () => actions.bump("artefacts", 1),
        r: () => actions.addRelic(inAuto),
        l: () => actions.bump("laps", 1),
        m: () => actions.toggleFlag("mobilise"),
        d: () => actions.toggleFlag("dock"),
        c: () => actions.toggleFlag("camp"),
        z: () => (e.shiftKey ? actions.redo() : actions.undo()),
        " ": () => timer.toggle(),
      };
      const fn = map[e.key.toLowerCase()];
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
    <div className="lg:grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start lg:gap-5 lg:pt-5">
      {/* ------------------------------------------------------------- */}
      {/* Scoring deck — sized to fill the phone screen with no scroll   */}
      {/* ------------------------------------------------------------- */}
      <div className="deck flex flex-col gap-2 pt-3 sm:gap-2.5 lg:gap-4 lg:pt-0">
        {/* Score strip */}
        <Panel className="hatch shrink-0" padded={false}>
          <div className="flex items-start justify-between gap-4 px-4 pb-2.5 pt-2.5">
            <div className="min-w-0">
              <div className="eyebrow" style={{ color: "var(--accent)" }}>
                Live score
              </div>
              <div className="tnum mt-1 font-mono text-[clamp(2.25rem,11vw,4.25rem)] font-bold leading-none tracking-tighter">
                {b.final}
              </div>
            </div>
            <dl className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-2 text-right">
              <Mini label="Pieces" value={totalGamePieces(t)} />
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

          {/* The excavation multiplier decides matches, so it is never hidden. */}
          <div className="flex flex-wrap items-center gap-x-1.5 border-t border-line-soft px-4 py-2 font-mono text-[11px]">
            <span className="eyebrow">Excavate</span>
            <span className="tnum text-ink-muted">{b.gamePiece}</span>
            <span className="text-ink-dim">×</span>
            <span className="tnum text-ink-muted">{POINTS.lapFactor}</span>
            <span className="text-ink-dim">×</span>
            <span className="tnum text-ink-muted">{t.laps}</span>
            <span className="text-ink-dim">=</span>
            <span className="tnum font-bold" style={{ color: "var(--accent)" }}>
              {b.excavation}
            </span>
          </div>
        </Panel>

        {/* The three things you actually tap during a match */}
        <div className="grid flex-1 grid-cols-2 gap-2 sm:gap-2.5 lg:flex-none">
          <Tile
            wide
            label="Artefact"
            worth={`${POINTS.artefact} pts each`}
            value={t.artefacts}
            points={`${b.artefacts} pts`}
            onAdd={() => actions.bump("artefacts", 1)}
            onSubtract={() => actions.bump("artefacts", -1)}
            active={inTeleop}
            shortcut="A"
          />
          <Tile
            label="Relic"
            worth={
              inAuto
                ? `${POINTS.relicAuto} pts in auto`
                : `${POINTS.relicTeleop} pts after auto`
            }
            value={relics}
            points={`${relicPoints} pts`}
            onAdd={() => actions.addRelic(inAuto)}
            onSubtract={() => actions.removeRelic(inAuto)}
            active={inAuto}
            shortcut="R"
          />
          <Tile
            label="Lap"
            worth={`× ${POINTS.lapFactor} per lap`}
            value={t.laps}
            points={`${b.excavation} pts`}
            onAdd={() => actions.bump("laps", 1)}
            onSubtract={() => actions.bump("laps", -1)}
            active={inTeleop}
            shortcut="L"
          />
        </div>

        {/* Once-per-match objectives */}
        <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-2.5">
          <Objective
            label="Mobilise"
            worth={POINTS.mobilise}
            on={t.mobilise}
            onToggle={() => actions.toggleFlag("mobilise")}
            note="Bumpers clear of the DIG SITE when AUTO ends"
            shortcut="M"
          />
          <Objective
            label="Dock"
            worth={POINTS.dock}
            on={t.dock}
            onToggle={() => actions.toggleFlag("dock")}
            note="Bumpers touching the DIG SITE at match end"
            shortcut="D"
          />
          <Objective
            label="Camp"
            worth={POINTS.camp}
            on={t.camp}
            onToggle={() => actions.toggleFlag("camp")}
            note={
              t.dock
                ? "Highest extension at match end, held 5 seconds"
                : "Requires a DOCK — this sets DOCK too"
            }
            shortcut="C"
          />
        </div>

        {inEndgame ? (
          <p
            className="enter shrink-0 rounded-lg border px-3 py-2 text-center text-[12px] font-medium"
            style={{
              borderColor:
                "color-mix(in oklab, var(--color-signal) 30%, transparent)",
              background:
                "color-mix(in oklab, var(--color-signal) 10%, transparent)",
              color: "var(--color-signal)",
            }}
          >
            Endgame — watch for DOCK and the 5 second CAMP hold.
          </p>
        ) : null}

        {/* Transport */}
        <div className="flex shrink-0 items-stretch gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => timer.toggle()}
            className="tap flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border text-[15px] font-semibold"
            style={
              clock.running
                ? {
                    borderColor: "var(--color-line)",
                    background: "var(--color-raised)",
                    color: "var(--color-ink)",
                  }
                : {
                    borderColor:
                      "color-mix(in oklab, var(--accent) 45%, transparent)",
                    background: "var(--accent-deep)",
                    color: "var(--accent)",
                  }
            }
          >
            {clock.running ? (
              <IconPause className="h-4 w-4" />
            ) : (
              <IconPlay className="h-4 w-4" />
            )}
            {clock.running
              ? `Pause · ${phaseLabel(clock.phase).toLowerCase()}`
              : clock.started
                ? "Resume"
                : "Start match"}
          </button>
          <button
            type="button"
            onClick={() => actions.undo()}
            disabled={app.undo.length === 0}
            title="Undo (Z)"
            aria-label="Undo"
            className="tap flex h-14 w-16 items-center justify-center rounded-xl border border-line bg-panel text-ink-muted disabled:opacity-30"
          >
            <IconUndo className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => actions.redo()}
            disabled={app.redo.length === 0}
            title="Redo (Shift+Z)"
            aria-label="Redo"
            className="tap hidden h-14 w-16 items-center justify-center rounded-xl border border-line bg-panel text-ink-muted disabled:opacity-30 sm:flex"
          >
            <IconRedo className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Between-matches detail — below the fold on a phone             */}
      {/* ------------------------------------------------------------- */}
      <div className="grid gap-5 pb-2 pt-7 lg:sticky lg:top-[4.5rem] lg:pt-0">
        <Section title="Breakdown">
          <Panel>
            <Row label="MOBILISE" value={b.mobilise} muted={!t.mobilise} />
            <StepRow
              label="RELICS — auto"
              sub={`${t.relicsAuto} × ${POINTS.relicAuto}`}
              value={b.relicsAuto}
              count={t.relicsAuto}
              onStep={(d) => actions.bump("relicsAuto", d)}
            />
            <StepRow
              label="RELICS — teleop"
              sub={`${t.relicsTeleop} × ${POINTS.relicTeleop}`}
              value={b.relicsTeleop}
              count={t.relicsTeleop}
              onStep={(d) => actions.bump("relicsTeleop", d)}
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
          <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
            The RELIC button follows the clock — 40 points during AUTO, 10
            after. Use the steppers above to move one between periods if the
            phase was wrong.
          </p>
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
                  className="field tnum h-12 w-full font-mono"
                />
                <Button
                  variant="ghost"
                  size="lg"
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
              className="h-14"
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
                size="lg"
                className="flex-1"
                onClick={() => actions.clearLive()}
              >
                Reset without saving
              </Button>
              <Link href="/logs" className="contents">
                <Button variant="ghost" size="lg" className="flex-1">
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
        className="tnum mt-1 font-mono text-[17px] font-bold leading-none"
        style={accent ? { color: "var(--accent)" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}

/** A breakdown row that can also be corrected in place. */
function StepRow({
  label,
  sub,
  value,
  count,
  onStep,
}: {
  label: string;
  sub: string;
  value: number;
  count: number;
  onStep: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className={`shrink-0 text-[13px] ${count ? "text-ink-muted" : "text-ink-dim"}`}
      >
        {label}
      </span>
      <span className="h-px min-w-3 flex-1 bg-line-soft" />
      <span className="eyebrow shrink-0">{sub}</span>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={count === 0}
          aria-label={`Remove one ${label}`}
          className="tap flex h-7 w-7 items-center justify-center rounded-md border border-line bg-shell text-[13px] text-ink-muted disabled:opacity-25"
        >
          &minus;
        </button>
        <button
          type="button"
          onClick={() => onStep(1)}
          aria-label={`Add one ${label}`}
          className="tap flex h-7 w-7 items-center justify-center rounded-md border border-line bg-shell text-[13px] text-ink-muted"
        >
          +
        </button>
      </div>
      <span
        className={`tnum w-10 shrink-0 text-right font-mono text-[13px] font-medium ${
          count ? "" : "text-ink-dim"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
