import { FREELANCER_DATA } from "../../../data/freelancerData";
import { ADMIN_DATA } from "../../../data/adminData";
import { CLIENT_DATA } from "../../../data/clientData";
import type { WorkspacePageDefinition } from "../../../components/views/PageFrame";

const metric = (label: string, value: string, note: string) => ({ label, value, note });
const row = (primary: string, secondary: string, status: string, amount?: string, detail?: string, actionLabel?: string) =>
  ({ primary, secondary, status, amount, detail, actionLabel });

export const freelancerPages: Record<string, WorkspacePageDefinition> = {
  projects: {
    title: "My Projects", description: "Track client projects, agreement status, milestone progress, deadlines, and funding.", icon: "folder",
    metrics: [metric("Active projects", "2", "Current assignments"), metric("Milestones", "9", "Assigned across projects"), metric("Completed", "7", "Project history")],
    records: FREELANCER_DATA.projects.map((project) => row(project.name, project.client, project.agreement.label, project.funding.label, project.ratio + " milestones · next due " + project.deadline, "Open")),
    rowAction: { title: "Project: {record}", description: "Review project status, current milestone, and funding for {record}.", confirmLabel: "Open project" },
  },
  milestones: {
    title: "Milestones", description: "Review assigned requirements, acceptance criteria, amounts, deadlines, and submission history.", icon: "flag",
    metrics: [metric("Assigned", "9", "Across active agreements"), metric("In progress", "3", "Work underway"), metric("Due soon", "2", "Review upcoming dates")],
    records: FREELANCER_DATA.deliverables.map((item) => row(item.title, item.projectLine, item.status.label, item.amount, item.dueText, "Open")),
    rowAction: { title: "Milestone: {record}", description: "Review the milestone requirements and acceptance criteria before submitting.", confirmLabel: "Open milestone" },
  },
  tasks: {
    title: "My Tasks", description: "Prioritize work by milestone state, responsibility, and deadline.", icon: "checkSquare",
    metrics: [metric("Open tasks", "6", "Current assignment list"), metric("Revision requests", "1", "Respond with an updated submission"), metric("Due soon", "2", "Upcoming milestone dates")],
    records: FREELANCER_DATA.deliverables.map((item) => row(item.title, item.projectLine, item.status.label, item.amount, item.dueText, item.actionLabel)),
    rowAction: { title: "Task: {record}", description: "Review your next action and linked milestone: {record}.", confirmLabel: "Open task" },
  },
  submissions: {
    title: "Deliverable Submissions", description: "Upload work, add notes and evidence, and submit a milestone for client review.", icon: "upload",
    metrics: [metric("In progress", "1", "Prepare submission"), metric("Under review", "1", "Client response pending"), metric("Evidence", "Private", "Only integrity hashes are anchored")],
    records: FREELANCER_DATA.deliverables.map((item) => row(item.title, item.projectLine, item.status.label, item.amount, item.note ?? item.quote ?? item.dueText, "Open")),
    primaryAction: { label: "Submit milestone", title: "Submit a milestone", description: "Choose a funded milestone, attach deliverables or links, add notes, and submit for client review. This preview does not upload or submit files.", confirmLabel: "Preview submission" },
    rowAction: { title: "Submission: {record}", description: "Review acceptance criteria and attach private evidence before submission.", confirmLabel: "Prepare submission" },
  },
  revisions: {
    title: "Feedback & Revisions", description: "Review client comments and respond with an updated deliverable tied to the original criteria.", icon: "messageCircle",
    metrics: [metric("Revision requested", "1", "Action needed"), metric("Review pending", "1", "Wait for client response"), metric("Revision history", "Tracked", "Submission versions retained")],
    records: FREELANCER_DATA.deliverables.filter((item) => item.status.label.toLowerCase().includes("revision")).map((item) => row(item.title, item.projectLine, item.status.label, item.amount, item.quote ?? item.note, "Respond")),
    rowAction: { title: "Revision: {record}", description: "Review feedback and prepare a response linked to {record}.", confirmLabel: "Prepare response" },
  },
  earnings: {
    title: "Earnings & Payouts", description: "Track approved milestone value, pending releases, payment processing, and confirmed payout history.", icon: "dollarCircle",
    metrics: [metric("Awaiting release", FREELANCER_DATA.moneyOnItsWay.pendingAmount, "Not a completed payout"), metric("Approved this year", FREELANCER_DATA.moneyOnItsWay.approvedYear, "Demo records"), metric("Provider confirmation", "Required", "Before marking paid")],
    records: FREELANCER_DATA.moneyOnItsWay.items.map((item) => row(item.label, item.sub, item.label, item.amount, "Do not mark as paid until the provider confirms the transfer")),
  },
  agreements: {
    title: "Agreements", description: "Review assigned agreements and accept terms only after checking scope, milestones, and criteria.", icon: "fileText",
    metrics: [metric("Active", "2", "Current agreements"), metric("Needs your review", "1", "Acceptance pending"), metric("Terms", "Milestone-based", "Amounts and criteria are explicit")],
    records: [
      row("Pulse Analytics SDK", "Kestrel Digital · sent Nov 20", "Needs your review", "$22,000", "3 milestones · dates Dec 15 – Jan 20", "Review"),
      row("Helio Checkout Rebuild", "Northstar Studio · Helio Commerce", "Active", "$84,000", "5 milestones · fully funded"),
      row("Fernwood Booking API", "Fernwood & Co.", "Active", "$18,600", "3 milestones · fully funded"),
    ],
    rowAction: { title: "Agreement: {record}", description: "Review scope, milestones, deadlines, acceptance criteria, and funding for {record}.", confirmLabel: "Review agreement" },
  },
  disputes: {
    title: "Disputes", description: "Review case status, evidence requests, negotiation, and independent arbitration updates.", icon: "scale",
    metrics: [metric("Assigned cases", "1", "Participant case"), metric("Evidence", "Due in 31h", "Check the case timeline"), metric("Decision", "Independent", "Arbiter and signer are separate")],
    records: [row("DSP-118 · Offline sync", "Corvid Mobile App v2 · M2", "Evidence collection", "$9,600", "Upload evidence by the case deadline", "Open case")],
    rowAction: { title: "Dispute: {record}", description: "Review the dispute timeline and submit requested evidence for {record}.", confirmLabel: "Open case" },
  },
  documents: {
    title: "Documents", description: "Access agreements, milestone criteria, and private project evidence shared with you.", icon: "fileText",
    metrics: [metric("Agreements", "3", "Project records"), metric("Evidence", "Private", "Participant access only"), metric("Integrity", "Verified", "Hashes recorded")],
    records: [
      row("AGR-2204 · Pulse Analytics SDK", "Agreement · Kestrel Digital", "Available", "PDF", "Review before acceptance", "Open"),
      row("M3 Evidence Snapshot", "Helio Checkout · Cart & tax engine", "Private", "6 files", "Evidence contents stay off-chain", "Open"),
      row("M2 Acceptance Criteria", "Fernwood Booking API", "Available", "PDF", "Criteria for submitted work", "Open"),
    ],
    rowAction: { title: "Document: {record}", description: "Open an authorized project document: {record}. Evidence access is logged.", confirmLabel: "Preview document" },
  },
  activity: {
    title: "Messages & Activity", description: "Follow project conversations, feedback, submissions, and recorded milestone events.", icon: "messageSquare",
    metrics: [metric("Recent events", "5", "Project activity"), metric("Unread messages", "2", "Local demo count"), metric("History", "Recorded", "Changes remain traceable")],
    records: CLIENT_DATA.recentActivity.map((item) => row(item.segments.map((segment) => segment.text).join(""), "Project activity", "Recorded", item.time, "Open the related project to review context")),
  },
  notifications: {
    title: "Notifications", description: "Receive deadline, revision, payment, and dispute updates.", icon: "bell",
    metrics: [metric("Unread", "3", "Local demo notifications"), metric("Revision requests", "1", "Action needed"), metric("Upcoming deadlines", "2", "Review task list")],
    records: FREELANCER_DATA.deliverables.map((item) => row(item.title, item.projectLine, item.status.label, item.amount, item.dueText, "Open")),
    rowAction: { title: "Notification: {record}", description: "Open the related milestone and check its current status: {record}.", confirmLabel: "Open item" },
  },
  settings: {
    title: "Profile & Settings", description: "Manage your professional profile, payout details, and account security.", icon: "settings",
    metrics: [metric("Profile", "Marco Bellini", "Full-stack developer"), metric("Payout details", "Protected", "Never expose credentials"), metric("Environment", "Prototype", "No live provider connection")],
    records: [
      row("Professional profile", "Marco Bellini · marco@bellini.dev", "Configured", "", "Skills and contact details"),
      row("Payout account", "Verified provider destination", "Protected", "", "Sensitive payment details belong in the provider flow"),
      row("Account security", "Password and sessions", "Enabled", "", "Security changes require an authenticated service"),
    ],
    rowAction: { title: "Setting: {record}", description: "Review {record}. This prototype does not persist profile or payout settings.", confirmLabel: "Preview setting" },
  },
};
