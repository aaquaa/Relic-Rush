/**
 * Field audio, synthesised.
 *
 * Every cue is generated with oscillators at runtime, so the app ships no
 * audio files: nothing to download, nothing to host, and it still works with
 * the venue wifi switched off.
 */

export type CueId =
  | "start"
  | "autoEnd"
  | "teleopStart"
  | "endgame"
  | "matchEnd"
  | "abort"
  | "tick";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.8;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Browsers block audio until a gesture. Call this from a click. */
export function unlockAudio(): void {
  const c = audio();
  if (!c) return;
  void c.resume();
}

export function setVolume(v: number): void {
  volume = Math.min(1, Math.max(0, v));
  if (master) master.gain.value = volume;
}

export function getVolume(): number {
  return volume;
}

type ToneOptions = {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  peak?: number;
  /** Frequency to glide to across the tone. */
  glideTo?: number;
  detune?: number;
};

function tone(c: AudioContext, o: ToneOptions): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t0 = c.currentTime + o.start;
  const peak = o.peak ?? 0.3;
  const attack = Math.min(0.012, o.duration * 0.2);
  const release = Math.min(0.14, o.duration * 0.6);

  osc.type = o.type ?? "triangle";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.glideTo)
    osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + o.duration);
  if (o.detune) osc.detune.setValueAtTime(o.detune, t0);

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
  gain.gain.setValueAtTime(peak, t0 + Math.max(attack, o.duration - release));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);

  osc.connect(gain);
  gain.connect(master!);
  osc.start(t0);
  osc.stop(t0 + o.duration + 0.05);
}

/** Buzzer: detuned saw stack with a short bite at the front. */
function buzzer(c: AudioContext, start: number, duration: number): void {
  for (const detune of [-9, 0, 9]) {
    tone(c, {
      freq: 196,
      start,
      duration,
      type: "sawtooth",
      peak: 0.22,
      detune,
    });
  }
  tone(c, { freq: 392, start, duration: 0.09, type: "square", peak: 0.16 });
}

const N = {
  G4: 392.0,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
} as const;

export function play(cue: CueId): void {
  const c = audio();
  if (!c) return;

  switch (cue) {
    // Bugle "Charge!" — the call that starts every match.
    case "start": {
      const seq: Array<[number, number, number]> = [
        [N.G4, 0.0, 0.11],
        [N.C5, 0.13, 0.11],
        [N.E5, 0.26, 0.11],
        [N.G5, 0.39, 0.22],
        [N.E5, 0.64, 0.1],
        [N.G5, 0.76, 0.5],
      ];
      for (const [freq, start, duration] of seq) {
        tone(c, { freq, start, duration, type: "square", peak: 0.2 });
        tone(c, {
          freq: freq * 2,
          start,
          duration,
          type: "triangle",
          peak: 0.09,
        });
      }
      break;
    }

    // End of AUTONOMOUS — three settling tones.
    case "autoEnd": {
      tone(c, { freq: N.E5, start: 0, duration: 0.14, peak: 0.26 });
      tone(c, { freq: N.C5, start: 0.15, duration: 0.14, peak: 0.26 });
      tone(c, { freq: N.G4, start: 0.3, duration: 0.3, peak: 0.26 });
      break;
    }

    // Drivers take control.
    case "teleopStart": {
      tone(c, { freq: N.C5, start: 0, duration: 0.1, peak: 0.26 });
      tone(c, { freq: N.E5, start: 0.1, duration: 0.1, peak: 0.26 });
      tone(c, { freq: N.G5, start: 0.2, duration: 0.1, peak: 0.26 });
      tone(c, { freq: N.C6, start: 0.3, duration: 0.34, peak: 0.28 });
      break;
    }

    // ENDGAME cue — urgent rising triple chirp.
    case "endgame": {
      for (let i = 0; i < 3; i++) {
        const at = i * 0.17;
        tone(c, {
          freq: N.A5,
          glideTo: N.E6,
          start: at,
          duration: 0.13,
          type: "square",
          peak: 0.24,
        });
      }
      tone(c, { freq: N.D6, start: 0.55, duration: 0.3, peak: 0.2 });
      break;
    }

    // End of match.
    case "matchEnd": {
      buzzer(c, 0, 1.4);
      break;
    }

    // Field fault / emergency stop.
    case "abort": {
      for (let i = 0; i < 6; i++) {
        tone(c, {
          freq: i % 2 ? 880 : 620,
          start: i * 0.14,
          duration: 0.12,
          type: "square",
          peak: 0.26,
        });
      }
      break;
    }

    // Final-seconds countdown tick.
    case "tick": {
      tone(c, {
        freq: N.C6,
        start: 0,
        duration: 0.05,
        type: "square",
        peak: 0.14,
      });
      break;
    }
  }
}

export const CUE_LABEL: Record<CueId, string> = {
  start: "Match start",
  autoEnd: "AUTO end",
  teleopStart: "TELEOP start",
  endgame: "ENDGAME cue",
  matchEnd: "Match end",
  abort: "Field fault",
  tick: "Countdown tick",
};

/** Short pulse of haptic feedback where the device supports it. */
export function haptic(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate === "function") navigator.vibrate(pattern);
}
