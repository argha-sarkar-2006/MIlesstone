import { ADMIN_DATA } from "../../../data/adminData";
import type { WorkspacePageDefinition } from "../../../components/views/PageFrame";

const metric = (label: string, value: string, note: string) => ({ label, value, note });
const row = (primary: string, secondary: string, status: string, amount?: string, detail?: string) =>
  ({ primary, secondary, status, amount, detail });

export const adminPages: Record<string, WorkspacePageDefinition> = {
  projects: {
    title: "Projects", description: "Manage organization projects, owners, milestone progress, deadlines, and funding.", icon: "folder",
    metrics: [metric("Active projects", "24", "Across the organization"), metric("At risk", "3", "Review deadlines and blockers"), metric("Agreement value", "$1.28M", "Demo data")],
    records: ADMIN_DATA.activeProjects.map((project) => row(project.name, project.client, project.status.label, project.funded, project.ratio + " milestones · next due " + project.nextDue)),
    primaryAction: { label: "Create project", title: "Create a project", description: "Start a project draft and connect its client, freelancer, and agreement.", confirmLabel: "Preview project setup" },
  },
  clients: {
    title: "Clients", description: "Manage client profiles, invitations, contact details, and project history.", icon: "users",
    metrics: [metric("Clients", "17", "Organization directory"), metric("Active projects", "12", "Current client work"), metric("Invitations", "2", "Awaiting response")],
    records: [
      row("Helio Commerce", "Ethan Cole · 3 active projects", "Active", "3 projects", "Recent review: Cart & tax engine"),
      row("Atlas Freight", "Atlas Brand System", "Active", "1 project", "Next milestone due Nov 28"),
      row("Corvid Labs", "Corvid Mobile App v2", "Dispute active", "1 project", "Evidence review in progress"),
    ],
    primaryAction: { label: "Invite client", title: "Invite a client", description: "Create a time-limited invitation for a client to join an organization project.", confirmLabel: "Preview invitation" },
    rowAction: { title: "Client: {record}", description: "Review client contact and project history for {record}.", confirmLabel: "Open profile" },
  },
  freelancers: {
    title: "Freelancers", description: "Review freelancer assignments, availability, delivery status, and project history.", icon: "userCheck",
    metrics: [metric("Freelancers", "41", "Organization directory"), metric("Assigned", "28", "With active milestones"), metric("Pending invites", "3", "Awaiting response")],
    records: [
      row("Marco Bellini", "Full-stack developer · 2 active projects", "Active", "9 milestones", "Next delivery: Payment flow QA"),
      row("Sofia Lindqvist", "Product designer · Atlas Brand System", "Active", "4 milestones", "Recent milestone approved"),
      row("Owen Price", "Product designer · Loyalty App MVP", "Active", "1 submission", "Client review pending"),
    ],
    primaryAction: { label: "Invite freelancer", title: "Invite a freelancer", description: "Invite a freelancer to a named agreement and project.", confirmLabel: "Preview invitation" },
    rowAction: { title: "Freelancer: {record}", description: "Review assignments and delivery history for {record}.", confirmLabel: "Open profile" },
  },
  agreements: {
    title: "Agreements", description: "Create and manage scope, participants, milestone allocations, deadlines, and acceptance criteria.", icon: "fileText",
    metrics: [metric("Active agreements", "19", "Across funded projects"), metric("Awaiting acceptance", "2", "Signature or response pending"), metric("Needs funding", "$51,500", "Work starts after funding")],
    records: [
      row("AGR-2211 · Orbit CRM Migration", "Northstar Studio · Orbit Systems", "Awaiting freelancer acceptance", "$27,500", "Milestones and acceptance criteria are recorded in the agreement"),
      row("AGR-2204 · Pulse Analytics SDK", "Kestrel Digital · Pulse Health", "Draft", "$22,000", "3 milestones · 2 revisions per milestone"),
      row("AGR-2192 · Helio Checkout Rebuild", "Northstar Studio · Helio Commerce", "Active", "$84,000", "5 milestones · fully funded"),
    ],
    primaryAction: { label: "New agreement", title: "Create an agreement", description: "Draft project terms, participants, milestone amounts, deadlines, and acceptance criteria.", confirmLabel: "Preview agreement" },
    rowAction: { title: "Agreement: {record}", description: "Inspect participants, terms, milestones, and acceptance criteria for {record}.", confirmLabel: "Review agreement" },
  },
  milestones: {
    title: "Milestones", description: "View delivery, review, deadlines, funding, and payment states across projects.", icon: "flag",
    metrics: [metric("In progress", "16", "Across active projects"), metric("Awaiting review", "7", "Client action pending"), metric("Due soon", "4", "Within the next 7 days")],
    records: ADMIN_DATA.upcomingDeadlines.map((item) => row(item.title, item.project, item.status, item.amount, item.day + " " + item.num + " " + item.mon)),
    rowAction: { title: "Milestone: {record}", description: "Review milestone progress, acceptance criteria, and funding status for {record}.", confirmLabel: "Open milestone" },
  },
  escrow: {
    title: "Escrow", description: "Monitor funded balances and milestone allocations. Admins cannot override settlement authorization.", icon: "landmark",
    metrics: [metric("Funds held", ADMIN_DATA.escrow.totalHeld, "Demo balance only"), metric("Funded agreements", "19", "Local sample records"), metric("Unfunded commitments", "$186,000", "Not yet confirmed")],
    records: ADMIN_DATA.escrow.breakdown.map((item) => row(item.label, "Organization escrow allocation", "Demo balance", item.amount, "Verify chain or payment-provider confirmation before treating as settled")),
  },
  payments: {
    title: "Payments", description: "Review funding, releases, refunds, provider status, and transaction history.", icon: "creditCard",
    metrics: [metric("Transactions", "48", "Selected demo period"), metric("Awaiting confirmation", "2", "Do not mark as paid"), metric("Refunds", "1", "See transaction records")],
    records: ADMIN_DATA.recentTransactions.map((item) => row(item.title, item.sub, item.status.label, item.amount, item.date)),
    rowAction: { title: "Transaction: {record}", description: "Inspect payment status and reconciliation details for {record}.", confirmLabel: "View transaction" },
  },
  disputes: {
    title: "Disputes", description: "Monitor evidence deadlines and resolution status. Disputed funds remain frozen until an authorized outcome.", icon: "scale",
    metrics: [metric("Active cases", "2", "Organization scope"), metric("Evidence due", "1", "Check case deadlines"), metric("Awaiting outcome", "1", "Independent review")],
    records: ADMIN_DATA.needsAttention.filter((item) => /dispute/i.test(item.title) || /dispute/i.test(item.sub)).map((item) => row(item.title, item.sub, "Evidence collection", item.amount, "Arbiter decision and signer authorization are separate")),
    rowAction: { title: "Dispute: {record}", description: "Review case status and evidence deadline for {record}. Admin actions cannot alter an arbiter decision or authorize settlement.", confirmLabel: "Open case" },
  },
  documents: {
    title: "Documents", description: "Access agreements, project files, evidence snapshots, and downloadable records with role-scoped access.", icon: "fileText",
    metrics: [metric("Agreements", "19", "Project records"), metric("Evidence snapshots", "6", "Private file contents"), metric("Access policy", "Restricted", "Participant scoped")],
    records: [
      row("AGR-2192 · Helio Checkout Rebuild", "Agreement · updated Nov 20", "Available", "PDF", "Visible to authorized project participants"),
      row("M3 Evidence Snapshot", "Helio Checkout · integrity verified", "Private", "6 files", "Only hashes or roots may be anchored on-chain"),
      row("Settlement record · Atlas Brand System", "M4 · Type & color tokens", "Confirmed", "PDF", "Payment confirmation record"),
    ],
    rowAction: { title: "Document: {record}", description: "Open an authorized download for {record}. Access is logged and evidence remains private.", confirmLabel: "Preview document" },
  },
  reports: {
    title: "Reports & Analytics", description: "Review project delivery, agreement value, payment history, completion rates, and dispute trends.", icon: "barChart",
    metrics: [metric("Milestone completion", "87%", "Selected demo period"), metric("Agreement value", "$1.28M", "Local sample data"), metric("Active disputes", "2", "Current cases")],
    records: [
      row("Project delivery", "24 active projects", "On track", "87%", "Milestone completion across the selected period"),
      row("Payment operations", "19 funded agreements", "Demo records", "$412,380", "Not a live provider balance"),
      row("Dispute operations", "2 active cases", "In progress", "2", "Review deadlines and evidence status"),
    ],
    primaryAction: { label: "Export report", title: "Export report", description: "Prepare a CSV export of organization project and transaction records.", confirmLabel: "Preview export" },
  },
  team: {
    title: "Team & Permissions", description: "Manage organization members using scoped roles; platform and settlement roles remain separate.", icon: "shield",
    metrics: [metric("Team members", "8", "Organization scope"), metric("Invitations", "1", "Awaiting acceptance"), metric("Settlement authority", "Restricted", "Separate signer required")],
    records: [
      row("Priya Raman", "priya@northstar.studio", "Owner", "Full access", "Organization owner"),
      row("Avery Chen", "avery@northstar.studio", "Project manager", "Projects", "Cannot authorize settlements"),
      row("Morgan Shah", "morgan@northstar.studio", "Billing manager", "Billing", "No dispute decision authority"),
    ],
    primaryAction: { label: "Invite member", title: "Invite organization member", description: "Create an organization-scoped invitation and assign a least-privilege role.", confirmLabel: "Preview invitation" },
  },
  notifications: {
    title: "Notifications", description: "Review project, milestone, funding, payment, and dispute alerts for this organization.", icon: "bell",
    metrics: [metric("Unread", "4", "Local demo notifications"), metric("Deadlines", "3", "Upcoming this week"), metric("Dispute alerts", "1", "Action required")],
    records: ADMIN_DATA.needsAttention.map((item) => row(item.title, item.sub, "New", item.amount, "Notification only · verify current project state before acting")),
  },
  settings: {
    title: "Organization Settings", description: "Manage organization details, security preferences, and notification settings.", icon: "settings",
    metrics: [metric("Workspace", "Northstar Studio", "Organization profile"), metric("Security", "Role-scoped", "Server-side authorization required"), metric("Environment", "Prototype", "No live integrations")],
    records: [
      row("Organization profile", "Name, contact, and branding", "Configured", "", "Changes will be persisted after API integration"),
      row("Notifications", "Deadline and payment alerts", "Enabled", "", "Preference controls are demo-only"),
      row("Integrations", "Payment and blockchain adapters", "Not connected", "", "Never enter private keys in the frontend"),
    ],
    rowAction: { title: "Setting: {record}", description: "Manage {record}. This prototype does not persist settings.", confirmLabel: "Preview settings" },
  },
};
