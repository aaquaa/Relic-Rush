/**
 * Relic Rush scoring model.
 *
 * Every number in this file is lifted straight from the
 * "2026 TDU Offseason Challenge: Relic Rush" manual. If the manual is
 * amended, change it here and the whole app follows.
 */

export type Alliance = "red" | "blue";

export type Phase = "pre" | "auto" | "transition" | "teleop" | "post";

export const POINTS = {
  /** MOBILISE from DIG SITE — bumpers clear of the DIG SITE when AUTO ends. */
  mobilise: 20,
  /** A RELIC acquired during AUTO. */
  relicAuto: 40,
  /** A RELIC acquired after AUTO — scored as an ARTEFACT. */
  relicTeleop: 10,
  /** An ARTEFACT acquired during TELEOP. */
  artefact: 10,
  /** DOCK at DIG SITE — bumpers touching the DIG SITE at match end. */
  dock: 30,
  /** SETUP CAMP — highest vertical extension, held 5s. Requires DOCK. */
  camp: 100,
  /** EXCAVATE: gamePiecePoints x (lapFactor x LAPS). */
  lapFactor: 0.5,
} as const;

export const TIMING = {
  auto: 15,
  /** Field reset between AUTO and TELEOP. */
  transition: 3,
  teleop: 135,
  /** Seconds remaining in TELEOP when the ENDGAME cue fires. */
  endgameCue: 30,
} as const;

export const MATCH_LENGTH = TIMING.auto + TIMING.transition + TIMING.teleop;

export type PenaltyUnit = "artefact" | "second" | "incident";

export type Penalty = {
  id: string;
  label: string;
  points: number;
  unit: PenaltyUnit;
  /** Phase where this is realistically called; used for grouping only. */
  scope: "auto" | "match" | "human";
  note?: string;
};

/**
 * "Penalties will be credited to the other alliance's score."
 * Counts recorded here are fouls committed BY the robot this device is
 * scoring, so their points are gifted to the opponent.
 */
export const PENALTIES: Penalty[] = [
  {
    id: "pour",
    label: "Pouring ARTEFACTS into your robot",
    points: 50,
    unit: "artefact",
    scope: "human",
    note: "From the HUMAN PLAYER STATION. Drops are legal, pours are not.",
  },
  {
    id: "throw",
    label: "Throwing ARTEFACTS onto the FIELD",
    points: 50,
    unit: "artefact",
    scope: "human",
    note: "Throwing, as opposed to dropping.",
  },
  {
    id: "pin",
    label: "Pinning beyond 3 seconds",
    points: 10,
    unit: "second",
    scope: "match",
    note: "Counts each second past the 3 second grace.",
  },
  {
    id: "remove",
    label: "Intentionally removing ARTEFACTS from the FIELD",
    points: 20,
    unit: "artefact",
    scope: "match",
  },
  {
    id: "autoline",
    label: "Crossing the AUTO LINE during AUTO",
    points: 200,
    unit: "incident",
    scope: "auto",
  },
  {
    id: "hands",
    label: "HUMAN PLAYER hands over the FIELD barrier",
    points: 300,
    unit: "incident",
    scope: "human",
  },
  {
    id: "barrier",
    label: "Robot significantly altering the FIELD barrier",
    points: 100,
    unit: "incident",
    scope: "match",
  },
  {
    id: "leavefield",
    label: "Robot leaving the FIELD",
    points: 3132,
    unit: "incident",
    scope: "match",
  },
  {
    id: "stepover",
    label: "Team member stepping over the FIELD barrier",
    points: 5331,
    unit: "incident",
    scope: "human",
  },
];

export const PENALTY_BY_ID = Object.fromEntries(
  PENALTIES.map((p) => [p.id, p]),
) as Record<string, Penalty>;

export type Tally = {
  mobilise: boolean;
  relicsAuto: number;
  relicsTeleop: number;
  artefacts: number;
  laps: number;
  dock: boolean;
  camp: boolean;
  fouls: Record<string, number>;
  /** Penalty points gifted to us by the other scorekeeper's robot. */
  opponentPenaltyPoints: number;
};

export function emptyTally(): Tally {
  return {
    mobilise: false,
    relicsAuto: 0,
    relicsTeleop: 0,
    artefacts: 0,
    laps: 0,
    dock: false,
    camp: false,
    fouls: {},
    opponentPenaltyPoints: 0,
  };
}

export type Breakdown = {
  mobilise: number;
  relicsAuto: number;
  relicsTeleop: number;
  artefacts: number;
  /** ARTEFACT + RELIC points. This is what EXCAVATE multiplies. */
  gamePiece: number;
  excavation: number;
  dock: number;
  camp: number;
  /** Everything this robot earned on its own. */
  earned: number;
  /** Points this robot handed to the opponent via fouls. */
  gifted: number;
  /** earned + penalty points the opponent gifted us. */
  final: number;
  /** What one more completed lap would be worth right now. */
  nextLapValue: number;
  /** What one more ARTEFACT would be worth right now, laps included. */
  nextArtefactValue: number;
};

export function score(t: Tally): Breakdown {
  const mobilise = t.mobilise ? POINTS.mobilise : 0;
  const relicsAuto = t.relicsAuto * POINTS.relicAuto;
  const relicsTeleop = t.relicsTeleop * POINTS.relicTeleop;
  const artefacts = t.artefacts * POINTS.artefact;

  const gamePiece = relicsAuto + relicsTeleop + artefacts;
  const excavation = Math.round(gamePiece * POINTS.lapFactor * t.laps);

  const dock = t.dock ? POINTS.dock : 0;
  // SETUP CAMP is only available after a DOCK.
  const camp = t.dock && t.camp ? POINTS.camp : 0;

  const earned = mobilise + gamePiece + excavation + dock + camp;
  const gifted = giftedPoints(t.fouls);

  const nextLapValue = Math.round(gamePiece * POINTS.lapFactor);
  const nextArtefactValue = Math.round(
    POINTS.artefact * (1 + POINTS.lapFactor * t.laps),
  );

  return {
    mobilise,
    relicsAuto,
    relicsTeleop,
    artefacts,
    gamePiece,
    excavation,
    dock,
    camp,
    earned,
    gifted,
    final: earned + t.opponentPenaltyPoints,
    nextLapValue,
    nextArtefactValue,
  };
}

export function giftedPoints(fouls: Record<string, number>): number {
  let total = 0;
  for (const [id, count] of Object.entries(fouls)) {
    const p = PENALTY_BY_ID[id];
    if (p && count > 0) total += p.points * count;
  }
  return total;
}

export function totalGamePieces(t: Tally): number {
  return t.relicsAuto + t.relicsTeleop + t.artefacts;
}

export const ALLIANCE_LABEL: Record<Alliance, string> = {
  red: "RED",
  blue: "BLUE",
};

export function phaseLabel(p: Phase): string {
  switch (p) {
    case "pre":
      return "PRE-MATCH";
    case "auto":
      return "AUTONOMOUS";
    case "transition":
      return "TRANSITION";
    case "teleop":
      return "TELEOPERATED";
    case "post":
      return "MATCH OVER";
  }
}

export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${m}:${String(rest).padStart(2, "0")}`;
}
