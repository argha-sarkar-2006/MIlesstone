export const CLIENT_DATA = {
  header: {
    greeting: "Welcome back, Ethan",
    subtitle: "Helio Commerce · 3 active projects with 2 organizations",
  },
  waitingForReview: [
    {
      id: "rev-m3",
      title: "M3 · Cart & tax engine",
      project: "Helio Checkout Rebuild",
      freelancer: "Marco Bellini",
      submittedText: "submitted 2 days ago",
      progressPercent: 58,
      metaText: "3 days left to review · 4 criteria · 6 files",
      amount: "$16,800",
      criteria: [
        "Dynamic regional tax calculation for US, EU, and AU",
        "Cart state persistence across guest-to-auth checkout",
        "Promo code stacking guardrails and unit coverage",
        "Zero P0/P1 regressions in checkout regression suite",
      ],
      attachments: ["tax-engine-v3.diff", "checkout-e2e-report.pdf", "4 additional files"],
    },
    {
      id: "rev-m1",
      title: "M1 · Loyalty UX flows",
      project: "Loyalty App MVP",
      freelancer: "Owen Price",
      submittedText: "submitted Today, 08:12",
      progressPercent: 28,
      metaText: "5 days left to review · 3 criteria · Figma link",
      amount: "$13,500",
      criteria: [
        "Tier progression and points redemption mobile wireframes",
        "Empty, pending, and reward-unlocked states",
        "Design system token handoff in Figma",
      ],
      attachments: ["Figma prototype · Loyalty MVP v1.4"],
    },
  ],
  funds: {
    heldAmount: "$69,000",
    segments: [
      { percent: 25.8, color: "#0F9D6E" },
      { percent: 42.5, color: "#1D5CE5" },
      { percent: 31.7, color: "#E2E8F0" },
    ],
    breakdown: [
      { label: "Total committed", amount: "$162,500", color: "#94A3B8" },
      { label: "Released to freelancers", amount: "$42,000", color: "#0F9D6E" },
      { label: "Funded and held", amount: "$69,000", color: "#1D5CE5" },
      { label: "Still to fund", amount: "$51,500", color: "#D97706" },
    ],
    alertTitle: "2 agreements need funding",
    alertSubtitle: "Work starts once milestones are funded",
  },
  projects: [
    {
      name: "Helio Checkout Rebuild",
      organization: "Northstar Studio",
      avatars: 2,
      segments: ["done", "done", "active", "empty"],
      percent: "58%",
      current: "M3 · Cart & tax engine",
      nextDeadline: "Dec 2",
      status: { label: "Fully funded", tone: "green" },
      fundingText: "$84.0k / $84.0k",
    },
    {
      name: "Loyalty App MVP",
      organization: "Kestrel Digital",
      avatars: 1,
      segments: ["active", "empty", "empty", "empty"],
      percent: "22%",
      current: "M1 · Loyalty UX flows",
      nextDeadline: "Dec 12",
      status: { label: "$27,000 to fund", tone: "amber" },
      fundingText: "$27.0k / $54.0k",
    },
    {
      name: "Product Photography Q1",
      organization: "Northstar Studio",
      avatars: 1,
      segments: ["empty", "empty", "empty"],
      percent: "0%",
      current: "Starts after funding",
      nextDeadline: "Jan 15",
      status: { label: "Not funded", tone: "neutral" },
      fundingText: "$0 / $24.5k",
    },
  ],
  upcomingDeadlines: [
    {
      date: "Nov 26",
      title: "Review M3 · Cart & tax engine",
      project: "Helio Checkout Rebuild",
      owner: { label: "On you", tone: "blue" },
    },
    {
      date: "Nov 30",
      title: "Fund M3–M4 · $27,000",
      project: "Loyalty App MVP",
      owner: { label: "On you", tone: "blue" },
    },
    {
      date: "Dec 2",
      title: "M4 · Payment flow QA due",
      project: "Helio Checkout Rebuild",
      owner: { label: "Freelancer", tone: "neutral" },
    },
    {
      date: "Dec 12",
      title: "M2 · Rewards engine due",
      project: "Loyalty App MVP",
      owner: { label: "Freelancer", tone: "neutral" },
    },
  ],
  recentActivity: [
    {
      time: "2h",
      segments: [
        { text: "Owen Price", bold: true },
        { text: " submitted " },
        { text: "M1 · Loyalty UX flows", bold: true },
      ],
    },
    {
      time: "1d",
      segments: [
        { text: "Payment partner", bold: true },
        { text: " confirmed your funding of " },
        { text: "$27,000", bold: true },
      ],
    },
    {
      time: "2d",
      segments: [
        { text: "Marco Bellini", bold: true },
        { text: " submitted " },
        { text: "M3 · Cart & tax engine", bold: true },
      ],
    },
    {
      time: "6d",
      segments: [
        { text: "You approved " },
        { text: "M2 · Checkout UI", bold: true },
      ],
    },
    {
      time: "1w",
      segments: [
        { text: "Northstar Studio", bold: true },
        { text: " sent agreement" },
      ],
    },
  ],
};
