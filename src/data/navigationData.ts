export type DashboardRole = "admin" | "client" | "freelancer";
export type NavigationItem = {
  id: string;
  label: string;
  icon: string;
  count?: number;
  alertCount?: number;
};
export type NavigationGroup = { label: string; items: NavigationItem[] };
export type RoleConfig = {
  id: DashboardRole;
  label: string;
  workspaceInitials: string;
  workspaceName: string;
  roleBadge: string;
  userInitials: string;
  userName: string;
  userEmail: string;
  navGroups: NavigationGroup[];
};

export const ROLES: Record<DashboardRole, RoleConfig> = {
  admin: {
    id: "admin", label: "Organization Admin", workspaceInitials: "NS", workspaceName: "Northstar Studio",
    roleBadge: "Organization Admin", userInitials: "PR", userName: "Priya Raman", userEmail: "priya@northstar.studio",
    navGroups: [
      { label: "Workspace", items: [
        { id: "overview", label: "Overview", icon: "grid" }, { id: "projects", label: "Projects", icon: "folder", count: 24 },
        { id: "clients", label: "Clients", icon: "users" }, { id: "freelancers", label: "Freelancers", icon: "userCheck" },
        { id: "agreements", label: "Agreements", icon: "fileText" }, { id: "milestones", label: "Milestones", icon: "flag", count: 7 },
      ] },
      { label: "Operations", items: [
        { id: "escrow", label: "Escrow", icon: "landmark" }, { id: "payments", label: "Payments", icon: "creditCard" },
        { id: "disputes", label: "Disputes", icon: "scale", alertCount: 2 },
        { id: "documents", label: "Documents", icon: "file" }, { id: "reports", label: "Reports & Analytics", icon: "barChart" },
      ] },
      { label: "Organization", items: [
        { id: "team", label: "Team & Permissions", icon: "shield" }, { id: "notifications", label: "Notifications", icon: "bell" },
        { id: "settings", label: "Settings", icon: "settings" },
      ] },
    ],
  },
  client: {
    id: "client", label: "Client", workspaceInitials: "HC", workspaceName: "Helio Commerce", roleBadge: "Client",
    userInitials: "EC", userName: "Ethan Cole", userEmail: "ethan.cole@helio.shop",
    navGroups: [
      { label: "Work", items: [
        { id: "overview", label: "Overview", icon: "grid" }, { id: "projects", label: "My Projects", icon: "folder" },
        { id: "agreements", label: "Agreements", icon: "fileText", count: 1 }, { id: "milestones", label: "Milestones", icon: "flag" },
        { id: "reviews", label: "Deliverable Reviews", icon: "clipboardCheck", alertCount: 2 },
      ] },
      { label: "Money & Resolution", items: [
        { id: "funding", label: "Escrow & Funding", icon: "landmark" }, { id: "transactions", label: "Payments & Transactions", icon: "creditCard" },
        { id: "disputes", label: "Disputes", icon: "scale" },
      ] },
      { label: "Records", items: [
        { id: "documents", label: "Documents", icon: "file" }, { id: "activity", label: "Messages & Activity", icon: "messageSquare" },
        { id: "notifications", label: "Notifications", icon: "bell" }, { id: "settings", label: "Settings", icon: "settings" },
      ] },
    ],
  },
  freelancer: {
    id: "freelancer", label: "Freelancer", workspaceInitials: "MB", workspaceName: "Marco Bellini",
    roleBadge: "Freelancer · Full-stack", userInitials: "MB", userName: "Marco Bellini", userEmail: "marco@bellini.dev",
    navGroups: [
      { label: "Work", items: [
        { id: "overview", label: "Overview", icon: "grid" }, { id: "projects", label: "My Projects", icon: "folder" },
        { id: "milestones", label: "Milestones", icon: "flag" }, { id: "tasks", label: "My Tasks", icon: "checkSquare", count: 6 },
        { id: "submissions", label: "Deliverable Submissions", icon: "upload" }, { id: "revisions", label: "Feedback & Revisions", icon: "messageCircle", alertCount: 1 },
      ] },
      { label: "Money & Resolution", items: [
        { id: "earnings", label: "Earnings & Payouts", icon: "dollarCircle" }, { id: "agreements", label: "Agreements", icon: "fileText", count: 1 },
        { id: "disputes", label: "Disputes", icon: "scale" },
      ] },
      { label: "Records", items: [
        { id: "documents", label: "Documents", icon: "file" }, { id: "activity", label: "Messages & Activity", icon: "messageSquare" },
        { id: "notifications", label: "Notifications", icon: "bell" }, { id: "settings", label: "Profile & Settings", icon: "settings" },
      ] },
    ],
  },
};

export const ROLE_PATHS: Record<DashboardRole, Record<string, string>> = {
  admin: { overview: "overview", projects: "projects", clients: "clients", freelancers: "freelancers", agreements: "agreements", milestones: "milestones", escrow: "escrow", payments: "payments", disputes: "disputes", documents: "documents", reports: "reports", team: "team", notifications: "notifications", settings: "settings" },
  client: { overview: "overview", projects: "projects", agreements: "agreements", milestones: "milestones", reviews: "reviews", funding: "funding", transactions: "transactions", disputes: "disputes", documents: "documents", activity: "activity", notifications: "notifications", settings: "settings" },
  freelancer: { overview: "overview", projects: "projects", milestones: "milestones", tasks: "tasks", submissions: "submissions", revisions: "revisions", earnings: "earnings", agreements: "agreements", disputes: "disputes", documents: "documents", activity: "activity", notifications: "notifications", settings: "settings" },
};
