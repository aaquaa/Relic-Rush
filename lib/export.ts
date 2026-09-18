import { giftedPoints, score, totalGamePieces } from "./game";
import type { MatchRecord } from "./store";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS = [
  "match",
  "saved_at",
  "alliance",
  "team",
  "opponent",
  "scorekeeper",
  "mobilise",
  "relics_auto",
  "relics_teleop",
  "artefacts",
  "game_pieces",
  "laps",
  "dock",
  "camp",
  "game_piece_points",
  "excavation_points",
  "earned",
  "gifted_to_opponent",
  "opponent_penalty_points",
  "final",
  "notes",
] as const;

export function toCSV(records: MatchRecord[]): string {
  const lines = [COLUMNS.join(",")];
  for (const r of records) {
    const b = score(r.tally);
    lines.push(
      [
        r.matchNumber,
        new Date(r.savedAt).toISOString(),
        r.alliance,
        r.teamName,
        r.opponentName,
        r.scorekeeper,
        r.tally.mobilise ? 1 : 0,
        r.tally.relicsAuto,
        r.tally.relicsTeleop,
        r.tally.artefacts,
        totalGamePieces(r.tally),
        r.tally.laps,
        r.tally.dock ? 1 : 0,
        r.tally.camp ? 1 : 0,
        b.gamePiece,
        b.excavation,
        b.earned,
        giftedPoints(r.tally.fouls),
        r.tally.opponentPenaltyPoints,
        b.final,
        r.notes.replace(/\n/g, " "),
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

export function download(filename: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
