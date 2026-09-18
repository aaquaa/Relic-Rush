import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rulebook",
  description:
    "Searchable game manual for the 2026 TDU Offseason Challenge: Relic Rush — scoring criteria, tasks, penalties and robot rules.",
};

export default function RulebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
