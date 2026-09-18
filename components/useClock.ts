"use client";

import { useEffect, useState } from "react";
import { MATCH_LENGTH } from "@/lib/game";
import { elapsedSeconds, phaseAt, phaseRemaining, useApp } from "@/lib/store";

/** Re-renders ~10x a second while the field clock runs, and not at all when it doesn't. */
export function useClock() {
  const app = useApp();
  const [, force] = useState(0);
  const running = app.timer.running;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = elapsedSeconds(app.timer);
  const started = running || app.timer.banked > 0;

  return {
    running,
    started,
    elapsed,
    remaining: Math.max(0, MATCH_LENGTH - elapsed),
    phase: started ? phaseAt(elapsed) : ("pre" as const),
    phaseRemaining: phaseRemaining(elapsed),
  };
}

/** Holds the screen on during a match, where the browser allows it. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      wakeLock?: { request(type: "screen"): Promise<{ release(): Promise<void> }> };
    };
    if (!nav.wakeLock) return;

    let sentinel: { release(): Promise<void> } | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const s = await nav.wakeLock!.request("screen");
        if (cancelled) void s.release();
        else sentinel = s;
      } catch {
        // Denied or unsupported — not worth surfacing to the user.
      }
    };

    void acquire();
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
    };
  }, [active]);
}
