"use client";

import { useState } from "react";
import type { Alliance } from "@/lib/game";
import { actions, useApp } from "@/lib/store";
import { download, stamp } from "@/lib/export";
import { unlockAudio } from "@/lib/sound";
import { Button, Panel, Section } from "@/components/ui";

export default function Setup() {
  const app = useApp();
  const s = app.settings;
  const [confirmWipe, setConfirmWipe] = useState(false);

  return (
    <div className="grid gap-5 pt-5 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-5">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight">Setup</h1>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-dim">
            This device scores one robot. Set it to the alliance you are
            watching — the other scorekeeper sets theirs to the other side.
          </p>
        </header>

        <Section title="Alliance">
          <div className="grid grid-cols-2 gap-3">
            {(["red", "blue"] as Alliance[]).map((a) => {
              const on = s.alliance === a;
              const colour =
                a === "red"
                  ? "var(--color-red-alliance)"
                  : "var(--color-blue-alliance)";
              const deep =
                a === "red"
                  ? "var(--color-red-deep)"
                  : "var(--color-blue-deep)";
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => actions.updateSettings({ alliance: a })}
                  aria-pressed={on}
                  className="tap panel flex flex-col items-start gap-2 p-4"
                  style={
                    on
                      ? {
                          borderColor: `color-mix(in oklab, ${colour} 55%, transparent)`,
                          background: deep,
                        }
                      : undefined
                  }
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: on ? colour : "var(--color-line)" }}
                  />
                  <span
                    className="font-mono text-[15px] font-bold tracking-[0.1em]"
                    style={{ color: on ? colour : "var(--color-ink-dim)" }}
                  >
                    {a.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-ink-dim">
                    {on ? "Scoring this side" : "Tap to switch"}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Identification">
          <Panel className="grid gap-3.5">
            <Field
              label="Team you are scoring"
              value={s.teamName}
              placeholder="e.g. Team 3 — Diggers"
              onChange={(teamName) => actions.updateSettings({ teamName })}
            />
            <Field
              label="Opponent"
              value={s.opponentName}
              placeholder="e.g. Team 1 — Sandstorm"
              onChange={(opponentName) =>
                actions.updateSettings({ opponentName })
              }
            />
            <Field
              label="Scorekeeper"
              value={s.scorekeeper}
              placeholder="Your name — stored with each match"
              onChange={(scorekeeper) =>
                actions.updateSettings({ scorekeeper })
              }
            />
            <Field
              label="Current match number"
              value={app.live.matchNumber}
              placeholder="1"
              onChange={(n) => actions.setMatchNumber(n)}
              mono
            />
          </Panel>
        </Section>
      </div>

      <div className="grid gap-5">
        <Section title="Device behaviour">
          <Panel padded={false}>
            <div className="divide-y divide-line-soft">
              <Toggle
                label="Field audio"
                hint="Play the match cues on this device. Leave one device unmuted so the field hears one clock."
                on={s.sound}
                onChange={(sound) => {
                  unlockAudio();
                  actions.updateSettings({ sound });
                }}
              />
              <Toggle
                label="Countdown ticks"
                hint="A short tick for each of the last five seconds."
                on={s.countdownTicks}
                onChange={(countdownTicks) =>
                  actions.updateSettings({ countdownTicks })
                }
              />
              <Toggle
                label="Haptics"
                hint="Vibrate on each tap so you can score without looking down."
                on={s.haptics}
                onChange={(haptics) => actions.updateSettings({ haptics })}
              />
              <Toggle
                label="Keep screen awake"
                hint="Holds the screen on while the clock runs, where the browser allows it."
                on={s.keepAwake}
                onChange={(keepAwake) => actions.updateSettings({ keepAwake })}
              />
            </div>
          </Panel>
        </Section>

        <Section title="Data">
          <Panel className="grid gap-3">
            <p className="text-[12px] leading-relaxed text-ink-dim">
              Everything lives in this browser. Nothing is uploaded, and there
              is no account. Clearing site data or using a different browser
              starts over, so export after each event.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={() =>
                  download(
                    `relic-rush-backup-${stamp()}.json`,
                    JSON.stringify(
                      { settings: s, live: app.live, history: app.history },
                      null,
                      2,
                    ),
                    "application/json",
                  )
                }
              >
                Export everything
              </Button>
              <Button
                variant={confirmWipe ? "danger" : "ghost"}
                onClick={() => {
                  if (confirmWipe) {
                    actions.clearHistory();
                    actions.clearLive();
                    setConfirmWipe(false);
                  } else {
                    setConfirmWipe(true);
                    setTimeout(() => setConfirmWipe(false), 4000);
                  }
                }}
              >
                {confirmWipe ? "Tap again to erase" : "Erase all matches"}
              </Button>
            </div>
          </Panel>
        </Section>

        <Section title="Install">
          <Panel>
            <p className="text-[12px] leading-relaxed text-ink-dim">
              Add this page to your home screen and it opens full screen with no
              browser chrome, which is what you want on a phone at the field. In
              Safari use Share → Add to Home Screen; in Chrome use the menu →
              Add to Home screen.
            </p>
          </Panel>
        </Section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`field mt-1.5 w-full text-[13px] ${mono ? "font-mono tnum" : ""}`}
      />
    </label>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="tap flex w-full items-start gap-4 p-4 text-left"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="mt-1 block text-[12px] leading-relaxed text-ink-dim">
          {hint}
        </span>
      </span>
      <span
        className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors"
        style={{ background: on ? "var(--accent)" : "var(--color-line)" }}
      >
        <span
          className="absolute top-1 h-4 w-4 rounded-full bg-void transition-[left]"
          style={{ left: on ? "1.375rem" : "0.25rem" }}
        />
      </span>
    </button>
  );
}
