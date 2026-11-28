import { ADMIN_DATA } from "../../../data/adminData";
import { CLIENT_DATA } from "../../../data/clientData";
import type { WorkspacePageDefinition } from "../../../components/views/PageFrame";

const metric = (label: string, value: string, note: string) => ({ label, value, note });
const row = (primary: string, secondary: string, status: string, amount?: string, detail?: string, actionLabel?: string) =>
  ({ primary, secondary, status, amount, detail, actionLabel });

export const clientPages: Record<string, WorkspacePageDefinition> = {
  projects: {
    title: "My Projects", description: "Review assigned projects, teams, progress, upcoming milestones, and funding status.", icon: "folder",
    metrics: [metric("Active projects", "3", "Across 2 organizations"), metric("Committed", "$162,500", "Agreement value"), metric("Awaiting review", "2", "Submitted milestones")],
    records: CLIENT_DATA.projects.map((project) => row(project.name, project.organization, project.status.label, project.fundingText, project.percent + " complete · " + project.current, "Open")),
    rowAction: { title: "Project: {record}", description: "Review current progress and upcoming milestones for {record}.", confirmLabel: "Open project" },
  },
  agreements: {
    title: "Agreements", description: "Review project scope, milestone terms, acceptance criteria, and agreement status.", icon: "fileText",
    metrics: [metric("Active agreements", "3", "Across your projects"), metric("Awaiting acceptance", "1", "Review terms"), metric("Revisions", "2", "Terms pending review")],
    records: [
      row("AGR-2192 · Helio Checkout Rebuild", "Northstar Studio · Marco Bellini", "Active", "$84,000", "5 milestones · fully funded", "Review"),
      row("AGR-2204 · Loyalty App MVP", "Kestrel Digital · Owen Price", "Awaiting funding", "$54,000", "Acceptance criteria listed per milestone", "Review"),
      row("AGR-2214 · Product Photography Q1", "Northstar Studio", "Needs acceptance", "$24,500", "Review deliverables and funding terms", "Review"),
    ],
    rowAction: { title: "Agreement: {record}", description: "Review terms, milestones, participants, and acceptance criteria for {record}.", confirmLabel: "Open agreement" },
  },
  milestones: {
    title: "Milestones", description: "Track milestone progress, deadlines, deliverables, and payment states.", icon: "flag",
    metrics: [metric("In progress", "5", "Across active projects"), metric("Submitted", "2", "Waiting for review"), metric("Upcoming", "3", "Next 14 days")],
    records: [
      ...CLIENT_DATA.waitingForReview.map((item) => row(item.title, item.project + " · " + item.freelancer, "Submitted for review", item.amount, item.metaText, "View")),
      ...CLIENT_DATA.upcomingDeadlines.map((item) => row(item.title, item.project, item.owner.label, "", item.date, "View")),
    ],
    rowAction: { title: "Milestone: {record}", description: "Review due dates, acceptance criteria, deliverables, and funding state for {record}.", confirmLabel: "Open milestone" },
  },
  reviews: {
    title: "Deliverable Reviews", description: "Compare submitted work with the agreed acceptance criteria. Approval does not authorize payment.", icon: "clipboardCheck",
    metrics: [metric("Awaiting review", "2", "Client action needed"), metric("Review window", "3 days", "Check each deadline"), metric("Settlement", "Separate", "Independent authorization")],
    records: CLIENT_DATA.waitingForReview.map((item) => row(item.title, item.project + " · " + item.freelancer, item.submittedText, item.amount, item.criteria.join(" · "), "Review")),
    primaryAction: { label: "Open review queue", title: "Deliverable review queue", description: "Inspect submitted files, evidence, and criteria before you approve, request a revision, or raise a dispute.", confirmLabel: "Open queue" },
    rowAction: { title: "Review {record}", description: "Compare the submission with the recorded acceptance criteria. A milestone approval does not itself release or authorize funds.", confirmLabel: "Open review" },
  },
  funding: {
    title: "Escrow & Funding", description: "Fund accepted agreements and confirm the payment provider status before work begins.", icon: "landmark",
    metrics: [metric("Total committed", CLIENT_DATA.funds.breakdown[0].amount, "Agreement value"), metric("Funded and held", CLIENT_DATA.funds.heldAmount, "Demo balance only"), metric("Still to fund", "$51,500", "Work waits for confirmation")],
    records: CLIENT_DATA.funds.breakdown.map((item) => row(item.label, "Client agreement balance", "Demo balance", item.amount, "Confirm provider funding before treating this as funded", item.label === "Still to fund" ? "Fund" : undefined)),
    primaryAction: { label: "Fund agreements", title: "Fund an agreement", description: "Review agreement requirements and funding details. This demo does not submit a payment.", confirmLabel: "Preview funding" },
    rowAction: { title: "Funding: {record}", description: "Review provider status for {record}. No payment will be sent from this prototype.", confirmLabel: "Review funding" },
  },
  transactions: {
    title: "Payments & Transactions", description: "Review funding confirmations, releases, refunds, receipts, and transaction references.", icon: "creditCard",
    metrics: [metric("Transactions", "8", "Sample activity"), metric("Provider confirmed", "$69,000", "Demo data"), metric("Pending", "2", "Not completed payouts")],
    records: ADMIN_DATA.recentTransactions.map((item) => row(item.title, item.sub, item.status.label, item.amount, item.date, "View")),
    rowAction: { title: "Transaction: {record}", description: "Inspect transaction and provider confirmation status for {record}.", confirmLabel: "View transaction" },
  },
  disputes: {
    title: "Disputes", description: "Raise or follow a dispute, submit evidence, and review arbitration progress and the final settlement record.", icon: "scale",
    metrics: [metric("Open disputes", "1", "Client workspace"), metric("Evidence due", "31 hours", "Check the case timeline"), metric("Resolution", "Independent", "Arbiter and signer roles differ")],
    records: [
      row("DSP-118 · Offline sync", "Corvid Mobile App v2 · M2", "Evidence collection", "$9,600", "Submit evidence before the stated deadline", "Open case"),
    ],
    primaryAction: { label: "Raise a dispute", title: "Start a dispute", description: "Select the affected milestone and record the dispute reason and supporting evidence.", confirmLabel: "Preview dispute" },
    rowAction: { title: "Dispute: {record}", description: "Review case status, evidence, assigned arbiter, and timeline for {record}.", confirmLabel: "Open case" },
  },
  documents: {
    title: "Documents", description: "Access agreements, project records, and evidence shared with authorized participants.", icon: "fileText",
    metrics: [metric("Agreements", "3", "Client projects"), metric("Evidence", "Private", "Access-controlled files"), metric("Snapshots", "2", "Hash commitments")],
    records: [
      row("AGR-2192 · Helio Checkout Rebuild", "Agreement · Northstar Studio", "Available", "PDF", "Participant-scoped access", "Open"),
      row("M3 Evidence Snapshot", "Helio Checkout · Cart & tax engine", "Private", "6 files", "File content is not stored on-chain", "Open"),
      row("Funding receipt", "Loyalty App MVP · provider record", "Confirmed", "PDF", "Payment provider confirmation", "Open"),
    ],
    rowAction: { title: "Document: {record}", description: "Open an authorized project record: {record}. Evidence access is logged.", confirmLabel: "Preview document" },
  },
  activity: {
    title: "Messages & Activity", description: "Follow project communication and recorded agreement, delivery, and funding events.", icon: "messageSquare",
    metrics: [metric("Recent events", "5", "Across projects"), metric("Unread messages", "2", "Local demo count"), metric("Audit history", "Append-only", "Events retain context")],
    records: CLIENT_DATA.recentActivity.map((item) => row(item.segments.map((segment) => segment.text).join(""), "Project activity", "Recorded", item.time, "Check the linked project before acting")),
  },
  notifications: {
    title: "Notifications", description: "Get updates about milestone submissions, deadlines, funding, and disputes.", icon: "bell",
    metrics: [metric("Unread", "3", "Local demo notifications"), metric("Reviews", "2", "Milestones await action"), metric("Deadlines", "2", "This week")],
    records: [
      ...CLIENT_DATA.waitingForReview.map((item) => row(item.title + " submitted", item.project, "New review", item.amount, item.submittedText, "Review")),
      ...CLIENT_DATA.upcomingDeadlines.map((item) => row(item.title, item.project, item.owner.label, "", item.date)),
    ],
    rowAction: { title: "Notification: {record}", description: "Open the related milestone or project to check the current state of {record}.", confirmLabel: "Open item" },
  },
  settings: {
    title: "Settings", description: "Manage your personal profile, account security, and notification preferences.", icon: "settings",
    metrics: [metric("Account", "Ethan Cole", "Client profile"), metric("Security", "Protected", "Session and password controls"), metric("Environment", "Prototype", "No live integrations")],
    records: [
      row("Personal profile", "Ethan Cole · ethan.cole@helio.shop", "Configured", "", "Contact and account details"),
      row("Security preferences", "Password and sessions", "Enabled", "", "Security controls require an authenticated service"),
      row("Notifications", "Project, payment, and dispute alerts", "Enabled", "", "Demo preferences are not persisted"),
    ],
    rowAction: { title: "Setting: {record}", description: "Review {record}. This prototype does not persist account settings.", confirmLabel: "Preview setting" },
  },
};
