"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ComponentType, type SVGProps } from "react";
import { formatClock, phaseLabel } from "@/lib/game";
import { actions, hydrate, useApp } from "@/lib/store";
import { unlockAudio } from "@/lib/sound";
import { useClock, useWakeLock } from "./useClock";
import {
  IconClock,
  IconLogs,
  IconMuted,
  IconRules,
  IconScore,
  IconSetup,
  IconSound,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  hint: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const NAV: NavItem[] = [
  { href: "/", label: "Score", hint: "Match console", Icon: IconScore },
  { href: "/timer", label: "Clock", hint: "Field timer", Icon: IconClock },
  { href: "/rulebook", label: "Rules", hint: "Game manual", Icon: IconRules },
  { href: "/logs", label: "Logs", hint: "Match history", Icon: IconLogs },
  { href: "/settings", label: "Setup", hint: "Preferences", Icon: IconSetup },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const app = useApp();
  const pathname = usePathname();
  const clock = useClock();

  useEffect(() => hydrate(), []);
  useWakeLock(app.settings.keepAwake && clock.running);

  // The first real interaction is what lets us make sound later.
  useEffect(() => {
    const on = () => unlockAudio();
    window.addEventListener("pointerdown", on, { once: true });
    window.addEventListener("keydown", on, { once: true });
    return () => {
      window.removeEventListener("pointerdown", on);
      window.removeEventListener("keydown", on);
    };
  }, []);

  const alliance = app.settings.alliance;
  // The field display counts down the period you are in, not the whole match.
  const urgent =
    clock.running &&
    clock.phaseRemaining <= 10 &&
    (clock.phase === "auto" || clock.phase === "teleop");

  return (
    <div data-alliance={alliance} className="min-h-dvh bg-void">
      {/* Left rail — desktop */}
      <nav className="fixed inset-y-0 left-0 z-40 hidden w-[86px] flex-col border-r border-line bg-shell lg:flex">
        <Link
          href="/"
          className="flex h-14 items-center justify-center border-b border-line"
          aria-label="Relic Rush home"
        >
          <Mark />
        </Link>
        <div className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((item) => (
            <RailLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>
        <div className="p-2">
          <SoundToggle on={app.settings.sound} />
        </div>
      </nav>

      {/* Status strip */}
      <header className="fixed inset-x-0 top-0 z-30 h-14 border-b border-line bg-shell/95 backdrop-blur lg:left-[86px]">
        <div className="flex h-full items-center gap-3 px-4">
          <span
            className="rounded-md px-2 py-1 text-[11px] font-bold tracking-[0.16em]"
            style={{
              background: "var(--accent-deep)",
              color: "var(--accent)",
              boxShadow:
                "inset 0 0 0 1px color-mix(in oklab, var(--accent) 30%, transparent)",
            }}
          >
            {alliance.toUpperCase()}
          </span>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-semibold">
              {app.settings.teamName || "Unnamed team"}
              {app.settings.opponentName ? (
                <span className="text-ink-dim font-normal">
                  {" "}
                  vs {app.settings.opponentName}
                </span>
              ) : null}
            </div>
            <div className="eyebrow mt-0.5">
              Match {app.live.matchNumber || "—"} · {phaseLabel(clock.phase)}
            </div>
          </div>

          <div className="text-right leading-none">
            <div
              className={`tnum font-mono text-[22px] font-bold ${urgent ? "urgent" : ""}`}
              style={{ color: urgent ? "var(--color-fault)" : undefined }}
            >
              {formatClock(clock.phaseRemaining)}
            </div>
            <div className="eyebrow mt-1">{COUNTDOWN_LABEL[clock.phase]}</div>
          </div>

          <div className="lg:hidden">
            <SoundToggle on={app.settings.sound} compact />
          </div>
        </div>
        {clock.started ? <ProgressRule fraction={clock.elapsed / 153} /> : null}
      </header>

      <main className="px-4 pb-28 pt-[4.5rem] lg:pb-10 lg:pl-[102px] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>

      {/* Bottom bar — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-shell/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => (
            <TabLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

const COUNTDOWN_LABEL: Record<string, string> = {
  pre: "until auto",
  auto: "left in auto",
  transition: "until teleop",
  teleop: "left in teleop",
  post: "match over",
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function Mark() {
  return (
    <span className="flex items-center gap-[3px]" aria-hidden>
      <span className="block h-5 w-[3px] rounded-full accent-bg" />
      <span className="block h-3.5 w-[3px] rounded-full bg-ink-dim" />
      <span className="block h-2.5 w-[3px] rounded-full bg-ink-dim/50" />
    </span>
  );
}

function RailLink({ item, active }: { item: NavItem; active: boolean }) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      title={item.hint}
      aria-current={active ? "page" : undefined}
      className={`tap group relative flex flex-col items-center gap-1.5 rounded-xl py-3 ${
        active ? "text-ink" : "text-ink-dim hover:text-ink-muted"
      }`}
      style={active ? { background: "var(--accent-deep)" } : undefined}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r"
          style={{ background: "var(--accent)" }}
        />
      ) : null}
      <Icon
        className="h-[18px] w-[18px]"
        style={active ? { color: "var(--accent)" } : undefined}
      />
      <span className="text-[10px] font-semibold tracking-wide">
        {item.label}
      </span>
    </Link>
  );
}

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`tap flex flex-col items-center gap-1 py-2.5 ${
        active ? "text-ink" : "text-ink-dim"
      }`}
    >
      <Icon
        className="h-[19px] w-[19px]"
        style={active ? { color: "var(--accent)" } : undefined}
      />
      <span className="text-[10px] font-semibold tracking-wide">
        {item.label}
      </span>
      <span
        className="h-[2px] w-5 rounded-full"
        style={{ background: active ? "var(--accent)" : "transparent" }}
      />
    </Link>
  );
}

function SoundToggle({ on, compact }: { on: boolean; compact?: boolean }) {
  const Icon = on ? IconSound : IconMuted;
  return (
    <button
      type="button"
      onClick={() => {
        unlockAudio();
        actions.updateSettings({ sound: !on });
      }}
      aria-pressed={on}
      aria-label={on ? "Mute field audio" : "Unmute field audio"}
      className={`tap flex items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink ${
        compact ? "h-9 w-9" : "h-11 w-full"
      }`}
      style={on ? undefined : { color: "var(--color-signal)" }}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}

function ProgressRule({ fraction }: { fraction: number }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-line-soft">
      <div
        className="h-full transition-[width] duration-100 ease-linear"
        style={{
          width: `${Math.min(100, Math.max(0, fraction * 100))}%`,
          background: "var(--accent)",
        }}
      />
    </div>
  );
}
