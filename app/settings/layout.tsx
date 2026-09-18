import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Setup",
  description:
    "Choose an alliance, name the teams and tune field audio for Relic Rush.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
