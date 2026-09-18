/**
 * The 2026 TDU Offseason Challenge: Relic Rush manual, transcribed so it can
 * be searched on the field without opening a PDF on a phone.
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "li"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "note"; text: string };

export type ManualSection = {
  id: string;
  title: string;
  tag: "Overview" | "Field" | "Tasks" | "Scoring" | "Penalties" | "Rules";
  blocks: Block[];
};

export const MANUAL: ManualSection[] = [
  {
    id: "mission",
    title: "The Mission",
    tag: "Overview",
    blocks: [
      {
        kind: "p",
        text: "Archaeologist Andrew wants to acquire ancient ARTEFACTS and RELICS, excavate the DIG SITE, and set up camp before nightfall.",
      },
      {
        kind: "p",
        text: "Robots, with help from their drivers, acquire ARTEFACTS and RELICS (both are 5in/127mm wicket balls from 2017 FRC Steamworks) and lap the DIG SITE to excavate it. You compete against one other team, rather than the usual 3v3, to collect the most game pieces and complete the most laps.",
      },
    ],
  },
  {
    id: "phases",
    title: "Match Phases",
    tag: "Overview",
    blocks: [
      {
        kind: "li",
        text: "Autonomous (0:15) — Robots operate without driver control. They can acquire RELICS for bonus points. You cannot cross the auto line.",
      },
      {
        kind: "li",
        text: "Teleoperated (2:15) — Drivers take control to remotely operate robots, acquiring ARTEFACTS and excavating the DIG SITE. RELICS reduce in value to equal that of ARTEFACTS.",
      },
      {
        kind: "li",
        text: "Endgame — Teams can earn bonus points for docking their robot at the DIG SITE, and setting up camp after, by extending the height of their robot to the top of the DIG SITE.",
      },
    ],
  },
  {
    id: "field",
    title: "The FIELD",
    tag: "Field",
    blocks: [
      {
        kind: "p",
        text: "The challenge takes place on an FRC FIELD with a DIG SITE (2026 HUB) in the centre. Robots must start with their bumpers in contact with their side of the DIG SITE.",
      },
      {
        kind: "p",
        text: "RELICS are placed at 1 metre intervals from the DIG SITE at the beginning of the match. A basket of ARTEFACTS is located at the human player stations and dropped onto the FIELD during the Teleoperated period.",
      },
      {
        kind: "p",
        text: "ROCKS (2023 Charged Up CUBE gamepieces) litter the FIELD and robots must navigate them while completing tasks.",
      },
    ],
  },
  {
    id: "auto",
    title: "Autonomous Period",
    tag: "Tasks",
    blocks: [
      {
        kind: "li",
        text: "MOBILISE from the DIG SITE — The robot's bumpers must not be in contact with the DIG SITE at the end of the autonomous period.",
      },
      {
        kind: "li",
        text: "ACQUIRE RELICS (ARTEFACTS with tape wrapped around them) — Each RELIC acquired in the autonomous period is worth 40 points. After this period, they are treated like regular ARTEFACTS.",
      },
      {
        kind: "li",
        text: "Dropping ARTEFACTS — Human players can drop up to 50 ARTEFACTS from their respective human player stations to collect in teleop.",
      },
    ],
  },
  {
    id: "teleop",
    title: "Teleoperated Period",
    tag: "Tasks",
    blocks: [
      {
        kind: "li",
        text: "Dropping ARTEFACTS — Human players can continue to drop up to 50 ARTEFACTS from their respective human player stations to collect.",
      },
      {
        kind: "li",
        text: "ACQUIRE ARTEFACTS — A game piece is “acquired” when it is fully supported by the robot and not touching the ground. Each ARTEFACT acquired is worth 10 points.",
      },
      {
        kind: "li",
        text: "EXCAVATE DIG SITE — Teams earn bonus points by driving clockwise around the DIG SITE. Excavations must include continuous driving (intaking ARTEFACTS on the way and brief stopping is allowed) but your path must be distinctively continuous, up to Vance and Archaeologist Andrew's discretion.",
      },
      {
        kind: "note",
        text: "The points for each lap are multiplied by the total number of ARTEFACTS (including RELICS) acquired by the end of the match.",
      },
    ],
  },
  {
    id: "endgame",
    title: "Endgame",
    tag: "Tasks",
    blocks: [
      {
        kind: "li",
        text: "DOCK at the DIG SITE — At the end of the match, the robot's bumpers must be touching the DIG SITE, earning 30 points.",
      },
      {
        kind: "li",
        text: "SETUP CAMP at the DIG SITE — After docking, robots may attempt to extend vertically to the top of the DIG SITE. The robot that holds their vertical extension highest at the end of the match receives the bonus points. If both robots have reached the top of the DIG SITE, the robot that was first receives the bonus points.",
      },
      {
        kind: "sub",
        text: "The top of the DIG SITE is the height limit, and height extensions must be held for at least 5 seconds once at maximum height.",
      },
      {
        kind: "sub",
        text: "You must DOCK first before attempting to SETUP CAMP.",
      },
    ],
  },
  {
    id: "scoring-notes",
    title: "Scoring Criteria Notes",
    tag: "Scoring",
    blocks: [
      {
        kind: "p",
        text: "A match is played with two robots competing against each other to score the most points.",
      },
      {
        kind: "note",
        text: "After the Autonomous period, RELICS are treated as ARTEFACTS. RELICS are scored at the end of Autonomous. ARTEFACTS are scored at the end of the match.",
      },
      {
        kind: "p",
        text: "EXCAVATION points are calculated by multiplying the total ARTEFACT points (including RELIC points) collected by 0.5 for each completed lap. For example, a team finishing with 200 points of ARTEFACTS and RELICS and 6 laps earns 200 × (0.5 × 6) = 600 EXCAVATION points, on top of their 200 ARTEFACT points.",
      },
    ],
  },
  {
    id: "penalties",
    title: "Penalties",
    tag: "Penalties",
    blocks: [
      {
        kind: "p",
        text: "Penalties will be credited to the other alliance's score.",
      },
    ],
  },
  {
    id: "rules",
    title: "Rules and Reminders",
    tag: "Rules",
    blocks: [
      {
        kind: "p",
        text: "Robots must abide by all (relevant) rules from G101 to G501 in the 2026 manual. “SCORING ELEMENT” refers to ARTEFACTS and RELICS.",
      },
      {
        kind: "li",
        text: "Build Time — With a month and a half to build, test and practice, this challenge requires a very fast build. The competition is planned for Week 10 term 3.",
      },
      {
        kind: "li",
        text: "Legal Parts — Only parts that were legal in the 2026 FRC competition can be used. You must only use mechanisms (not parts) that you have built.",
      },
      {
        kind: "li",
        text: "Resources — A kit base (including PDP, Roborio, etc.), prototyping wood, and a variety of motors and gearboxes are available. Be frugal with these shared resources.",
      },
      {
        kind: "li",
        text: "ARTEFACTS must be easy to remove — no sealed boxes or trash bags to hold ARTEFACTS.",
      },
    ],
  },
  {
    id: "robot-limits",
    title: "Robot Limitations",
    tag: "Rules",
    blocks: [
      { kind: "li", text: "No limit on the number of balls a robot can hold." },
      {
        kind: "li",
        text: "The robot perimeter is limited to the maximum kitbot dimensions plus two sides that can extend out 300mm each.",
      },
      {
        kind: "li",
        text: "Robots are limited to 650mm in height (measured from the ground) at the beginning of the match. Once the match begins they may extend further.",
      },
      {
        kind: "li",
        text: "The maximum height extension is limited to the top of the DIG SITE.",
      },
      {
        kind: "li",
        text: "All height extensions must be entirely robot supported (no helium balloons).",
      },
      {
        kind: "note",
        text: "Hoppers are permanently limited to 650mm in height even after the game begins.",
      },
    ],
  },
  {
    id: "strategy",
    title: "Strategy and Planning",
    tag: "Rules",
    blocks: [
      {
        kind: "li",
        text: "Look at 2017 FRC robots for inspiration. You do not have time to CAD your robot, so start prototyping as soon as you have a strategy.",
      },
      {
        kind: "li",
        text: "The most successful teams spend a lot of time driving and refining their robots, so plan to finish building well before the competition.",
      },
      {
        kind: "li",
        text: "Software — A cut-down version of this year's code will be made available, but it will still require significant effort to develop the necessary subsystems, sequences and autonomous routines.",
      },
      {
        kind: "li",
        text: "Autonomous can take a substantial amount of time to get right, so don't leave it until the end.",
      },
      {
        kind: "li",
        text: "Plan your time across drivebase assembly, intake prototyping and testing, the ARTEFACT container (hopper), software and autonomous, and a couple of nights of driver training.",
      },
    ],
  },
];

export const SCORING_TABLE: Array<{
  task: string;
  auto: string;
  teleop: string;
  endgame: string;
}> = [
  { task: "MOBILISE from DIG SITE", auto: "20", teleop: "—", endgame: "—" },
  { task: "COLLECT RELICS", auto: "40", teleop: "10", endgame: "—" },
  { task: "COLLECT ARTEFACTS", auto: "—", teleop: "10", endgame: "—" },
  {
    task: "EXCAVATE DIG SITE",
    auto: "—",
    teleop: "pts × (0.5 × laps)",
    endgame: "—",
  },
  { task: "DOCK at DIG SITE", auto: "—", teleop: "—", endgame: "30" },
  { task: "SETUP CAMP at DIG SITE", auto: "—", teleop: "—", endgame: "100" },
];

export function sectionText(s: ManualSection): string {
  return `${s.title} ${s.blocks.map((b) => b.text).join(" ")}`.toLowerCase();
}
