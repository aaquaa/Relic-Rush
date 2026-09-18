"use client";

import { useSyncExternalStore } from "react";
import {
  Alliance,
  MATCH_LENGTH,
  Phase,
  TIMING,
  Tally,
  emptyTally,
  score,
} from "./game";
import { CueId, haptic, play, setVolume } from "./sound";

const STORAGE_KEY = "relic-rush/v1";
const UNDO_DEPTH = 60;

export type LogEvent = {
  id: string;
  at: number;
  /** Seconds into the match, or null if the field clock was not running. */
  matchTime: number | null;
  phase: Phase;
  kind: string;
  label: string;
  delta: number;
  pointsAfter: number;
};

export type MatchRecord = {
  id: string;
  matchNumber: string;
  alliance: Alliance;
  teamName: string;
  opponentName: string;
  scorekeeper: string;
  tally: Tally;
  notes: string;
  events: LogEvent[];
  savedAt: number;
};

export type Settings = {
  alliance: Alliance;
  teamName: string;
  opponentName: string;
  scorekeeper: string;
  sound: boolean;
  volume: number;
  haptics: boolean;
  countdownTicks: boolean;
  keepAwake: boolean;
};

export type LiveMatch = {
  matchNumber: string;
  tally: Tally;
  notes: string;
  events: LogEvent[];
};

export type TimerState = {
  running: boolean;
  /** Epoch ms of the last resume, or null when stopped. */
  startedAt: number | null;
  /** Seconds banked before the last resume. */
  banked: number;
  /** Cue ids already fired this run, so they do not repeat. */
  fired: string[];
};

export type AppState = {
  hydrated: boolean;
  settings: Settings;
  live: LiveMatch;
  timer: TimerState;
  history: MatchRecord[];
  undo: LiveMatch[];
  redo: LiveMatch[];
};

const DEFAULT_SETTINGS: Settings = {
  alliance: "red",
  teamName: "",
  opponentName: "",
  scorekeeper: "",
  sound: true,
  volume: 0.8,
  haptics: true,
  countdownTicks: true,
  keepAwake: true,
};

function freshLive(matchNumber = "1"): LiveMatch {
  return { matchNumber, tally: emptyTally(), notes: "", events: [] };
}

const DEFAULT_STATE: AppState = {
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  live: freshLive(),
  timer: { running: false, startedAt: null, banked: 0, fired: [] },
  history: [],
  undo: [],
  redo: [],
};

let state: AppState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(next: Partial<AppState>, persist = true) {
  state = { ...state, ...next };
  if (persist) save();
  emit();
}

function save() {
  if (typeof window === "undefined") return;
  try {
    const { settings, live, history, timer } = state;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ settings, live, history, timer }),
    );
  } catch {
    // Storage full or blocked (private mode). The app keeps working in memory.
  }
}

export function hydrate() {
  if (state.hydrated || typeof window === "undefined") return;
  let loaded: Partial<AppState> = {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) loaded = JSON.parse(raw) as Partial<AppState>;
  } catch {
    loaded = {};
  }

  const settings = { ...DEFAULT_SETTINGS, ...(loaded.settings ?? {}) };
  const live = loaded.live
    ? {
        ...freshLive(),
        ...loaded.live,
        tally: { ...emptyTally(), ...loaded.live.tally },
      }
    : freshLive();

  setVolume(settings.sound ? settings.volume : 0);

  state = {
    ...state,
    hydrated: true,
    settings,
    live,
    history: loaded.history ?? [],
    timer: loaded.timer ?? DEFAULT_STATE.timer,
  };
  emit();
  if (state.timer.running) startTicking();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(DEFAULT_STATE),
  );
}

export function useApp(): AppState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => DEFAULT_STATE,
  );
}

export function snapshot(): AppState {
  return state;
}

/* ------------------------------------------------------------------ */
/* Field clock                                                         */
/* ------------------------------------------------------------------ */

let ticker: ReturnType<typeof setInterval> | null = null;

export function elapsedSeconds(t: TimerState = state.timer): number {
  if (!t.running || t.startedAt === null) return t.banked;
  return t.banked + (Date.now() - t.startedAt) / 1000;
}

export function phaseAt(elapsed: number): Phase {
  if (elapsed <= 0) return "pre";
  if (elapsed < TIMING.auto) return "auto";
  if (elapsed < TIMING.auto + TIMING.transition) return "transition";
  if (elapsed < MATCH_LENGTH) return "teleop";
  return "post";
}

export function currentPhase(): Phase {
  const t = state.timer;
  if (!t.running && t.banked === 0) return "pre";
  return phaseAt(elapsedSeconds(t));
}

/** Seconds left in the phase the clock is currently in. */
export function phaseRemaining(elapsed: number): number {
  const phase = phaseAt(elapsed);
  switch (phase) {
    case "pre":
      return TIMING.auto;
    case "auto":
      return TIMING.auto - elapsed;
    case "transition":
      return TIMING.auto + TIMING.transition - elapsed;
    case "teleop":
      return MATCH_LENGTH - elapsed;
    case "post":
      return 0;
  }
}

type ScheduledCue = { id: string; at: number; cue: CueId };

const CUE_SCHEDULE: ScheduledCue[] = [
  { id: "start", at: 0, cue: "start" },
  { id: "autoEnd", at: TIMING.auto, cue: "autoEnd" },
  {
    id: "teleopStart",
    at: TIMING.auto + TIMING.transition,
    cue: "teleopStart",
  },
  {
    id: "endgame",
    at: MATCH_LENGTH - TIMING.endgameCue,
    cue: "endgame",
  },
  { id: "matchEnd", at: MATCH_LENGTH, cue: "matchEnd" },
];

export function cue(c: CueId) {
  if (!state.settings.sound) return;
  play(c);
}

function startTicking() {
  if (ticker) return;
  ticker = setInterval(() => {
    const t = state.timer;
    if (!t.running) return;
    const elapsed = elapsedSeconds(t);
    const fired = new Set(t.fired);
    let changed = false;

    for (const s of CUE_SCHEDULE) {
      if (elapsed >= s.at && !fired.has(s.id)) {
        fired.add(s.id);
        changed = true;
        cue(s.cue);
        if (s.id === "matchEnd") haptic([200, 80, 200]);
        else haptic(30);
      }
    }

    if (state.settings.countdownTicks) {
      const left = MATCH_LENGTH - elapsed;
      for (let n = 5; n >= 1; n--) {
        const id = `tick${n}`;
        if (left <= n && left > n - 1 && !fired.has(id)) {
          fired.add(id);
          changed = true;
          cue("tick");
        }
      }
    }

    if (elapsed >= MATCH_LENGTH) {
      set({
        timer: {
          running: false,
          startedAt: null,
          banked: MATCH_LENGTH,
          fired: [...fired],
        },
      });
      stopTicking();
      return;
    }

    if (changed) {
      set({ timer: { ...t, fired: [...fired] } }, false);
    }
    emit();
  }, 100);
}

function stopTicking() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}

export const timer = {
  start() {
    if (state.timer.running) return;
    set({
      timer: { ...state.timer, running: true, startedAt: Date.now() },
    });
    startTicking();
  },
  pause() {
    if (!state.timer.running) return;
    set({
      timer: {
        ...state.timer,
        running: false,
        startedAt: null,
        banked: elapsedSeconds(),
      },
    });
    stopTicking();
  },
  toggle() {
    if (state.timer.running) timer.pause();
    else timer.start();
  },
  reset() {
    stopTicking();
    set({ timer: { running: false, startedAt: null, banked: 0, fired: [] } });
  },
  /** Jump straight to a phase boundary — useful when practising. */
  seek(seconds: number) {
    const fired = CUE_SCHEDULE.filter((s) => s.at <= seconds).map((s) => s.id);
    set({
      timer: {
        running: state.timer.running,
        startedAt: state.timer.running ? Date.now() : null,
        banked: seconds,
        fired,
      },
    });
  },
  abort() {
    timer.pause();
    cue("abort");
  },
};

/* ------------------------------------------------------------------ */
/* Scoring actions                                                     */
/* ------------------------------------------------------------------ */

function pushUndo() {
  const undo = [...state.undo, structuredClone(state.live)].slice(-UNDO_DEPTH);
  state = { ...state, undo, redo: [] };
}

function logEvent(
  kind: string,
  label: string,
  delta: number,
  tally: Tally,
): LogEvent {
  const running = state.timer.running || state.timer.banked > 0;
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    matchTime: running ? Math.round(elapsedSeconds() * 10) / 10 : null,
    phase: currentPhase(),
    kind,
    label,
    delta,
    pointsAfter: score(tally).earned,
  };
}

function applyTally(
  kind: string,
  label: string,
  delta: number,
  mutate: (t: Tally) => void,
) {
  pushUndo();
  const tally = structuredClone(state.live.tally);
  mutate(tally);
  const event = logEvent(kind, label, delta, tally);
  set({
    live: { ...state.live, tally, events: [...state.live.events, event] },
  });
  if (state.settings.haptics) haptic(delta > 0 ? 12 : [8, 30, 8]);
}

type CounterKey = "relicsAuto" | "relicsTeleop" | "artefacts" | "laps";

const COUNTER_LABEL: Record<CounterKey, string> = {
  relicsAuto: "RELIC (AUTO)",
  relicsTeleop: "RELIC (TELEOP)",
  artefacts: "ARTEFACT",
  laps: "LAP",
};

export const actions = {
  bump(key: CounterKey, delta: number) {
    if (state.live.tally[key] + delta < 0) return;
    applyTally(key, COUNTER_LABEL[key], delta, (t) => {
      t[key] = Math.max(0, t[key] + delta);
    });
  },

  /**
   * One RELIC button routes by phase: 40 points during AUTO, 10 after. Two
   * buttons that look identical is how a scorekeeper logs into the wrong one.
   */
  addRelic(isAuto: boolean) {
    actions.bump(isAuto ? "relicsAuto" : "relicsTeleop", 1);
  },

  /** Take the relic back off the bucket it most likely went into. */
  removeRelic(isAuto: boolean) {
    const t = state.live.tally;
    const preferred: CounterKey = isAuto ? "relicsAuto" : "relicsTeleop";
    const fallback: CounterKey = isAuto ? "relicsTeleop" : "relicsAuto";
    const key =
      t[preferred] > 0 ? preferred : t[fallback] > 0 ? fallback : null;
    if (key) actions.bump(key, -1);
  },

  toggleFlag(key: "mobilise" | "dock" | "camp") {
    const label =
      key === "mobilise" ? "MOBILISE" : key === "dock" ? "DOCK" : "SETUP CAMP";
    const next = !state.live.tally[key];
    applyTally(key, label, next ? 1 : -1, (t) => {
      t[key] = next;
      // SETUP CAMP cannot stand without a DOCK.
      if (key === "dock" && !next) t.camp = false;
      if (key === "camp" && next) t.dock = true;
    });
  },

  bumpFoul(id: string, delta: number, label: string) {
    const current = state.live.tally.fouls[id] ?? 0;
    if (current + delta < 0) return;
    applyTally(`foul:${id}`, `FOUL — ${label}`, delta, (t) => {
      const value = Math.max(0, (t.fouls[id] ?? 0) + delta);
      if (value === 0) delete t.fouls[id];
      else t.fouls[id] = value;
    });
  },

  setOpponentPenaltyPoints(points: number) {
    const value = Math.max(0, Math.round(points || 0));
    pushUndo();
    set({
      live: {
        ...state.live,
        tally: { ...state.live.tally, opponentPenaltyPoints: value },
      },
    });
  },

  setNotes(notes: string) {
    set({ live: { ...state.live, notes } });
  },

  setMatchNumber(matchNumber: string) {
    set({ live: { ...state.live, matchNumber } });
  },

  undo() {
    const prev = state.undo[state.undo.length - 1];
    if (!prev) return;
    set({
      live: prev,
      undo: state.undo.slice(0, -1),
      redo: [...state.redo, structuredClone(state.live)].slice(-UNDO_DEPTH),
    });
    if (state.settings.haptics) haptic([6, 24, 6]);
  },

  redo() {
    const next = state.redo[state.redo.length - 1];
    if (!next) return;
    set({
      live: next,
      redo: state.redo.slice(0, -1),
      undo: [...state.undo, structuredClone(state.live)].slice(-UNDO_DEPTH),
    });
  },

  /** Commit the live match to history and roll the match number forward. */
  commit(): MatchRecord | null {
    const { live, settings } = state;
    if (live.events.length === 0 && !live.notes.trim()) return null;
    const record: MatchRecord = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      matchNumber: live.matchNumber || "—",
      alliance: settings.alliance,
      teamName: settings.teamName,
      opponentName: settings.opponentName,
      scorekeeper: settings.scorekeeper,
      tally: structuredClone(live.tally),
      notes: live.notes,
      events: live.events,
      savedAt: Date.now(),
    };
    const nextNumber = String(Number(live.matchNumber) + 1);
    stopTicking();
    set({
      history: [record, ...state.history],
      live: freshLive(Number.isNaN(Number(live.matchNumber)) ? "" : nextNumber),
      undo: [],
      redo: [],
      timer: { running: false, startedAt: null, banked: 0, fired: [] },
    });
    return record;
  },

  clearLive() {
    pushUndo();
    stopTicking();
    set({
      live: freshLive(state.live.matchNumber),
      timer: { running: false, startedAt: null, banked: 0, fired: [] },
    });
  },

  deleteRecord(id: string) {
    set({ history: state.history.filter((r) => r.id !== id) });
  },

  updateRecordNotes(id: string, notes: string) {
    set({
      history: state.history.map((r) => (r.id === id ? { ...r, notes } : r)),
    });
  },

  clearHistory() {
    set({ history: [] });
  },

  updateSettings(patch: Partial<Settings>) {
    const settings = { ...state.settings, ...patch };
    setVolume(settings.sound ? settings.volume : 0);
    set({ settings });
  },
};
