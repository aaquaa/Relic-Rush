import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Field Clock",
  description:
    "Match timer for Relic Rush with synthesised FRC field audio: match start, end of autonomous, teleop start, endgame cue and the end-of-match buzzer.",
};

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
