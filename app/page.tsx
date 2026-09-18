"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { POINTS, giftedPoints, score } from "@/lib/game";
import { actions, timer, useApp } from "@/lib/store";
import { useClock } from "@/components/useClock";
import { Button, Panel, Row, Section } from "@/components/ui";
import { Counter, Objective } from "@/components/score/Controls";
import { Fouls } from "@/components/score/Fouls";
import { IconPause, IconPlay, IconUndo } from "@/components/icons";

export default function ScoreConsole() {
  const app = useApp();
  const clock = useClock();
  const t = app.live.tally;
  const b = score(t);
  const [confirmSave, setConfirmSave] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // RELICS only score during AUTO. Once the clock passes AUTO the button locks
  // so nobody logs a 10 point ball as a 40 point one.
  const relicsOpen = clock.phase === "pre" || clock.phase === "auto";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const map: Record<string, () => void> = {
        a: () => actions.bump("artefacts", 1),
        r: () => relicsOpen && actions.addRelic(),
        l: () => actions.bump("laps", 1),
        m: () => actions.toggleFlag("mobilise"),
        d: () => actions.toggleFlag("dock"),
        c: () => actions.toggleFlag("camp"),
        z: () => actions.undo(),
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
  }, [relicsOpen]);

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
    <div className="lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start lg:gap-6 lg:pt-5">
      {/* ------------------------------------------------------------ */}
      {/* Everything a scorer touches during a match, and nothing else  */}
      {/* ------------------------------------------------------------ */}
      <div className="deck flex flex-col gap-2.5 pt-3 lg:gap-3 lg:pt-0">
        <div className="flex shrink-0 items-baseline justify-center gap-3 py-1">
          <span className="tnum font-mono text-[clamp(2.75rem,14vw,4rem)] font-bold leading-none tracking-tighter">
            {b.final}
          </span>
          <span className="eyebrow">points</span>
        </div>

        <Counter
          label="Artefact"
          worth={`${POINTS.artefact}`}
          value={t.artefacts}
          onAdd={() => actions.bump("artefacts", 1)}
          onSubtract={() => actions.bump("artefacts", -1)}
        />
        <Counter
          label="Relic"
          worth={`${POINTS.relicAuto}`}
          value={t.relicsAuto}
          onAdd={() => actions.addRelic()}
          onSubtract={() => actions.removeRelic()}
          locked={!relicsOpen}
          lockNote="Auto only — now count as artefacts"
        />
        <Counter
          label="Lap"
          value={t.laps}
          onAdd={() => actions.bump("laps", 1)}
          onSubtract={() => actions.bump("laps", -1)}
        />

        <div className="grid shrink-0 grid-cols-3 gap-2.5">
          <Objective
            label="Mobilise"
            worth={POINTS.mobilise}
            on={t.mobilise}
            onToggle={() => actions.toggleFlag("mobilise")}
          />
          <Objective
            label="Dock"
            worth={POINTS.dock}
            on={t.dock}
            onToggle={() => actions.toggleFlag("dock")}
          />
          <Objective
            label="Camp"
            worth={POINTS.camp}
            on={t.camp}
            onToggle={() => actions.toggleFlag("camp")}
          />
        </div>

        <div className="flex shrink-0 items-stretch gap-2.5">
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
            {clock.running ? "Pause" : clock.started ? "Resume" : "Start match"}
          </button>
          <button
            type="button"
            onClick={() => actions.undo()}
            disabled={app.undo.length === 0}
            aria-label="Undo"
            className="tap flex h-14 w-[104px] shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-panel text-[14px] font-semibold text-ink-muted disabled:opacity-30 sm:w-[128px]"
          >
            <IconUndo className="h-4 w-4" />
            Undo
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Between matches — below the fold on a phone                   */}
      {/* ------------------------------------------------------------ */}
      <div className="grid gap-5 pb-2 pt-8 lg:pt-0">
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
                Match {saved} saved. Score and clock reset.
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => actions.clearLive()}
              >
                Reset
              </Button>
              <Link href="/logs" className="contents">
                <Button variant="ghost" size="lg" className="flex-1">
                  View logs
                </Button>
              </Link>
            </div>
          </div>
        </Section>

        <Section title="Notes">
          <textarea
            value={app.live.notes}
            onChange={(e) => actions.setNotes(e.target.value)}
            rows={4}
            placeholder="Anything worth remembering about this match…"
            className="field w-full resize-y text-[13px] leading-relaxed"
          />
        </Section>

        <Section title="Where the points came from">
          <Panel>
            <Row label="Artefacts" value={b.artefacts} muted={!b.artefacts} />
            <Row
              label="Relics (auto)"
              value={b.relicsAuto + b.relicsTeleop}
              muted={!b.relicsAuto && !b.relicsTeleop}
            />
            <Row
              label={`Excavate · ${t.laps} lap${t.laps === 1 ? "" : "s"}`}
              value={b.excavation}
              muted={!b.excavation}
              accent={b.excavation > 0}
            />
            <Row label="Mobilise" value={b.mobilise} muted={!b.mobilise} />
            <Row label="Dock" value={b.dock} muted={!b.dock} />
            <Row label="Setup camp" value={b.camp} muted={!b.camp} />
            {t.opponentPenaltyPoints > 0 ? (
              <Row
                label="Opponent fouls"
                value={`+${t.opponentPenaltyPoints}`}
              />
            ) : null}
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-[13px] font-semibold">Total</span>
              <span
                className="tnum font-mono text-[24px] font-bold leading-none"
                style={{ color: "var(--accent)" }}
              >
                {b.final}
              </span>
            </div>
          </Panel>
        </Section>

        <Section title="Penalties">
          <Fouls
            counts={t.fouls}
            gifted={giftedPoints(t.fouls)}
            opponentPoints={t.opponentPenaltyPoints}
          />
        </Section>
      </div>
    </div>
  );
}
