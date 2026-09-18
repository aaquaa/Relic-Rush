# Relic Rush — Scoring Console

A field scoring app for the **2026 TDU Offseason Challenge: Relic Rush**.

Two scorekeepers, one per robot. Each device scores one alliance, keeps its own
match log, runs the field clock with audio cues, and carries the whole game
manual so nobody has to open a PDF on their phone mid-match.

---

## Deploy it (no downloads, free tier)

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and **Import** the repository.
3. Leave every setting as-is — Vercel detects Next.js on its own — and click
   **Deploy**.

That's it. There is no database, no environment variable and no paid add-on.
Every page is prerendered as static HTML, so it runs inside the Vercel Hobby
(free) plan with room to spare.

To run it locally instead: `npm install && npm run dev`.

---

## Using it at a competition

**Set each device up once** — open **Setup**, pick RED or BLUE, and type the
team names. The whole app re-themes to the alliance you picked, which makes it
obvious at a glance that you are on the right device.

**Score from the console.** Every counter card is one big tap target: tap
anywhere on the card to add one, and use the small `−` to correct. The running
total, the excavation multiplier and the full breakdown update as you go.

**Run the clock from either page.** The clock is shared, so starting it on the
Score page also starts it on the Clock page, and it keeps running while you
move between them. The status strip at the top always shows the period
countdown.

**Save at the end of the match.** "Save match to logs" writes the match to this
device's history, bumps the match number and resets the console for the next
one.

### Penalties, with two independent devices

The manual credits penalties to the *other* alliance. Each scorekeeper records
the fouls committed by **the robot they are watching** — that panel shows the
points being gifted away. At the end of the match, tell the other scorekeeper
your gifted total and enter theirs in **Opponent penalty points**. That single
number is the only thing the two devices need to exchange.

### Keyboard shortcuts

On a laptop you never need the mouse.

| Key | Action |
| --- | --- |
| `A` | Add an ARTEFACT |
| `R` | Add a RELIC (auto or teleop, based on the phase) |
| `L` | Add an EXCAVATION lap |
| `M` / `D` / `C` | Toggle MOBILISE / DOCK / SETUP CAMP |
| `Z` / `Shift+Z` | Undo / redo |
| `Space` | Start or pause the clock |
| `F` | Presentation mode (Clock page) |
| `X` | Field fault siren (Clock page) |

---

## Scoring model

Straight from the manual, and all of it lives in [`lib/game.ts`](lib/game.ts).

| Task | Auto | Teleop | Endgame |
| --- | --- | --- | --- |
| MOBILISE from DIG SITE | 20 | — | — |
| COLLECT RELICS | 40 each | 10 each | — |
| COLLECT ARTEFACTS | — | 10 each | — |
| EXCAVATE DIG SITE | — | game piece points × (0.5 × laps) | — |
| DOCK at DIG SITE | — | — | 30 |
| SETUP CAMP at DIG SITE | — | — | 100 |

Game piece points are ARTEFACT points plus RELIC points, and EXCAVATE
multiplies that whole figure — so a lap is worth more the more you are
carrying. The console shows what the next lap and the next artefact are
currently worth, because that trade-off decides matches.

SETUP CAMP requires a DOCK, so toggling CAMP sets DOCK too, and clearing DOCK
clears CAMP.

**If the manual is amended**, change the numbers in `lib/game.ts` and the
scoring, the breakdown, the rulebook's quick reference and the exports all
follow. Penalty definitions live in the same file; the manual prose is in
[`lib/manual.ts`](lib/manual.ts).

---

## Field audio

Every cue — the start fanfare, end of auto, teleop start, the endgame warning
and the end-of-match buzzer — is synthesised with the Web Audio API at runtime.
There are no audio files to host or download, and nothing to load, so the clock
works with the venue wifi switched off. Preview any cue from the Clock page.

Browsers block audio until you interact with the page, so tap anything once
before you rely on the sound.

---

## Where the data lives

Everything is stored in the browser's `localStorage` on that device. Nothing is
uploaded and there is no account, which is why it works offline — but it also
means clearing site data, or switching browser or device, starts over.

**Export after each event.** The Logs page exports every saved match as CSV or
JSON, and Setup can export the whole store as a backup.

Add the page to your home screen (Safari: Share → Add to Home Screen; Chrome:
menu → Add to Home screen) and it opens full screen with no browser chrome,
which is what you want on a phone at the field.

---

## Project layout

```
app/
  page.tsx        Scoring console
  timer/          Field clock and audio cues
  rulebook/       Searchable game manual
  logs/           Match history, stats and export
  settings/       Alliance, team names, device preferences
lib/
  game.ts         Scoring rules — every point value from the manual
  manual.ts       Manual prose, for the rulebook
  store.ts        App state, shared clock and localStorage persistence
  sound.ts        Synthesised field audio
  export.ts       CSV / JSON export
components/       Shell, UI primitives and the scoring controls
```

Built with Next.js (App Router), TypeScript and Tailwind CSS v4.
