"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MATCH_LENGTH, TIMING, formatClock, phaseLabel } from "@/lib/game";
import { actions, cue, timer, useApp } from "@/lib/store";
import { CUE_LABEL, type CueId, unlockAudio } from "@/lib/sound";
import { useClock } from "@/components/useClock";
import { Button, Panel, Section } from "@/components/ui";
import { IconPause, IconPlay, IconReset } from "@/components/icons";

const SEGMENTS = [
  { key: "auto", label: "Auto", seconds: TIMING.auto },
  { key: "transition", label: "Reset", seconds: TIMING.transition },
  { key: "teleop", label: "Teleop", seconds: TIMING.teleop },
] as const;

const JUMPS = [
  { label: "Start of AUTO", at: 0 },
  { label: "Start of TELEOP", at: TIMING.auto + TIMING.transition },
  { label: "Endgame (0:30)", at: MATCH_LENGTH - TIMING.endgameCue },
  { label: "Last 10s", at: MATCH_LENGTH - 10 },
];

const CUE_TIMING: Array<{ id: CueId; when: string }> = [
  { id: "start", when: `T+${formatClock(0)}` },
  { id: "autoEnd", when: `T+${formatClock(TIMING.auto)}` },
  {
    id: "teleopStart",
    when: `T+${formatClock(TIMING.auto + TIMING.transition)}`,
  },
  {
    id: "endgame",
    when: `T+${formatClock(MATCH_LENGTH - TIMING.endgameCue)}`,
  },
  { id: "matchEnd", when: `T+${formatClock(MATCH_LENGTH)}` },
  { id: "abort", when: "manual" },
];

export default function FieldClock() {
  const app = useApp();
  const clock = useClock();
  const [presenting, setPresenting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  // A real FRC field counts down the current period, not the whole match.
  const periodLeft = clock.phaseRemaining;
  const matchLeft = clock.started ? clock.remaining : MATCH_LENGTH;
  const urgent =
    clock.running &&
    periodLeft <= 10 &&
    (clock.phase === "auto" || clock.phase === "teleop");

  const togglePresent = useCallback(async () => {
    const el = stageRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      // Fullscreen refused — fall back to the in-page presentation layout.
      setPresenting((p) => !p);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setPresenting(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        unlockAudio();
        timer.toggle();
      }
      if (e.key.toLowerCase() === "f") void togglePresent();
      if (e.key.toLowerCase() === "x") timer.abort();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePresent]);

  return (
    <div className="grid gap-5 pt-5">
      {/* Stage */}
      <div
        ref={stageRef}
        className={`panel hatch relative flex flex-col justify-center overflow-hidden ${
          presenting ? "h-dvh rounded-none bg-void p-8" : "p-6 sm:p-8"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <span
            className="rounded-md px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.18em]"
            style={{
              background: "var(--accent-deep)",
              color: "var(--accent)",
            }}
          >
            {phaseLabel(clock.phase)}
          </span>
          <span className="eyebrow">
            {clock.running ? "Running" : clock.started ? "Paused" : "Ready"}
          </span>
        </div>

        <div
          className={`tnum my-5 text-center font-mono font-bold leading-[0.85] tracking-tighter ${
            urgent ? "urgent" : ""
          } ${presenting ? "text-[clamp(6rem,26vw,22rem)]" : "text-[clamp(4.5rem,18vw,11rem)]"}`}
          style={{ color: urgent ? "var(--color-fault)" : undefined }}
          aria-live="off"
        >
          {formatClock(periodLeft)}
        </div>

        <div className="text-center">
          <div className="eyebrow">
            {clock.phase === "post"
              ? "Match complete"
              : `${formatClock(matchLeft)} until the match ends`}
          </div>
        </div>

        {/* Segmented phase track */}
        <div className="mt-6 flex gap-1" aria-hidden>
          {SEGMENTS.map((seg, i) => {
            const before = SEGMENTS.slice(0, i).reduce(
              (n, s) => n + s.seconds,
              0,
            );
            const fill = Math.min(
              1,
              Math.max(0, (clock.elapsed - before) / seg.seconds),
            );
            return (
              <div
                key={seg.key}
                className="relative h-2 overflow-hidden rounded-full bg-line-soft"
                style={{ flexGrow: seg.seconds }}
              >
                <div
                  className="h-full transition-[width] duration-100 ease-linear"
                  style={{
                    width: `${fill * 100}%`,
                    background:
                      seg.key === "transition"
                        ? "var(--color-ink-dim)"
                        : "var(--accent)",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-1" aria-hidden>
          {SEGMENTS.map((seg) => (
            <div
              key={seg.key}
              className="eyebrow"
              style={{ flexGrow: seg.seconds }}
            >
              {seg.label}
            </div>
          ))}
        </div>

        {presenting ? (
          <button
            type="button"
            onClick={() => void togglePresent()}
            className="tap absolute right-5 top-5 rounded-lg border border-line px-3 py-1.5 text-[12px] text-ink-dim"
          >
            Exit
          </button>
        ) : null}
      </div>

      {/* Transport */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={clock.running ? "solid" : "accent"}
          size="lg"
          className="min-w-[150px] flex-1 sm:flex-none"
          onClick={() => {
            unlockAudio();
            timer.toggle();
          }}
        >
          {clock.running ? (
            <IconPause className="h-4 w-4" />
          ) : (
            <IconPlay className="h-4 w-4" />
          )}
          {clock.running ? "Pause" : clock.started ? "Resume" : "Start match"}
        </Button>
        <Button variant="ghost" size="lg" onClick={() => timer.reset()}>
          <IconReset className="h-4 w-4" />
          Reset
        </Button>
        <Button
          variant="danger"
          size="lg"
          onClick={() => timer.abort()}
          title="X"
        >
          Field fault
        </Button>
        <div className="hidden flex-1 sm:block" />
        <Button
          variant="ghost"
          size="lg"
          onClick={() => void togglePresent()}
          title="F"
        >
          Present
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-5">
          <Section title="Jump to">
            <Panel padded={false}>
              <div className="divide-y divide-line-soft">
                {JUMPS.map((j) => (
                  <button
                    key={j.label}
                    type="button"
                    onClick={() => timer.seek(j.at)}
                    className="tap flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-medium hover:bg-raised"
                  >
                    {j.label}
                    <span className="tnum font-mono text-[12px] text-ink-dim">
                      T+{formatClock(j.at)}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-dim">
              Jumping marks every cue before that point as already played, so
              practising the endgame does not replay the start fanfare.
            </p>
          </Section>
          <Section title="Shortcuts">
            <Panel>
              <div className="grid gap-2">
                {[
                  ["Space", "Start / pause"],
                  ["F", "Presentation mode"],
                  ["X", "Field fault siren"],
                ].map(([key, what]) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd className="w-14 rounded border border-line bg-shell py-0.5 text-center font-mono text-[11px] text-ink-muted">
                      {key}
                    </kbd>
                    <span className="text-[13px] text-ink-muted">{what}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </Section>
        </div>

        <Section
          title="Field audio"
          aside={
            <span className="eyebrow">
              {app.settings.sound ? "On" : "Muted"}
            </span>
          }
        >
          <Panel>
            <p className="text-[12px] leading-relaxed text-ink-dim">
              Every cue is generated in the browser — no audio files, so the
              clock works with the venue wifi off. Tap one to preview it.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CUE_TIMING.map(({ id, when }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    cue(id);
                  }}
                  className="tap rounded-xl border border-line bg-shell px-3 py-3 text-left"
                >
                  <span className="block text-[12px] font-semibold">
                    {CUE_LABEL[id]}
                  </span>
                  <span className="eyebrow mt-1 block">{when}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-line-soft pt-4">
              <div className="flex items-center justify-between">
                <label className="eyebrow" htmlFor="vol">
                  Volume
                </label>
                <span className="tnum font-mono text-[12px] text-ink-muted">
                  {Math.round(app.settings.volume * 100)}%
                </span>
              </div>
              <input
                id="vol"
                type="range"
                min={0}
                max={100}
                value={Math.round(app.settings.volume * 100)}
                onChange={(e) => {
                  unlockAudio();
                  actions.updateSettings({
                    volume: Number(e.target.value) / 100,
                  });
                }}
                className="mt-2 w-full accent-[var(--accent)]"
              />
              <label className="mt-3 flex items-center gap-2.5 text-[13px]">
                <input
                  type="checkbox"
                  checked={app.settings.countdownTicks}
                  onChange={(e) =>
                    actions.updateSettings({ countdownTicks: e.target.checked })
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                Tick for the final five seconds
              </label>
            </div>
          </Panel>
        </Section>
      </div>
    </div>
  );
}
