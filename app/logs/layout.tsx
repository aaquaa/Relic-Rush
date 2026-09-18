import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Logs",
  description:
    "Saved Relic Rush matches with full score breakdowns, timestamped event logs, notes and CSV export.",
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
