export const ROLES = {
  admin: {
    id: "admin",
    label: "Organization Admin",
    shortLabel: "Org Admin",
    workspaceInitials: "NS",
    workspaceName: "Northstar Studio",
    roleBadge: "Organization Admin",
    userInitials: "PR",
    userName: "Priya Raman",
    userEmail: "priya@northstar.studio",
    navGroups: [
      {
        label: "Workspace",
        items: [
          { id: "overview", label: "Overview", icon: "grid" },
          { id: "projects", label: "Projects", icon: "folder", count: 24 },
          { id: "agreements", label: "Agreements", icon: "fileText" },
          { id: "milestones", label: "Milestones", icon: "flag", count: 7 },
        ],
      },
      {
        label: "People",
        items: [
          { id: "clients", label: "Clients", icon: "users" },
          { id: "freelancers", label: "Freelancers", icon: "userCheck" },
        ],
      },
      {
        label: "Money",
        items: [
          { id: "escrow", label: "Escrow & Payments", icon: "landmark" },
          { id: "disputes", label: "Disputes", icon: "scale", alertCount: 2 },
        ],
      },
      {
        label: "Records",
        items: [
          { id: "documents", label: "Documents", icon: "file" },
          { id: "reports", label: "Reports & Analytics", icon: "barChart" },
        ],
      },
      {
        label: "Organization",
        items: [
          { id: "team", label: "Team & Permissions", icon: "shield" },
          { id: "notifications", label: "Notifications", icon: "bell" },
          { id: "settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
  },
  client: {
    id: "client",
    label: "Client",
    shortLabel: "Client",
    workspaceInitials: "HC",
    workspaceName: "Helio Commerce",
    roleBadge: "Client",
    userInitials: "EC",
    userName: "Ethan Cole",
    userEmail: "ethan.cole@helio.shop",
    navGroups: [
      {
        label: "Work",
        items: [
          { id: "overview", label: "Overview", icon: "grid" },
          { id: "projects", label: "My Projects", icon: "folder" },
          { id: "agreements", label: "Agreements", icon: "fileText", count: 1 },
          { id: "milestones", label: "Milestones", icon: "flag" },
          {
            id: "reviews",
            label: "Deliverable Reviews",
            icon: "clipboardCheck",
            alertCount: 2,
          },
        ],
      },
      {
        label: "Money",
        items: [
          { id: "escrow", label: "Escrow & Funding", icon: "landmark" },
          { id: "payments", label: "Payments", icon: "creditCard" },
          { id: "disputes", label: "Disputes", icon: "scale" },
        ],
      },
      {
        label: "Records",
        items: [
          { id: "documents", label: "Documents", icon: "file" },
          { id: "messages", label: "Messages & Activity", icon: "messageSquare" },
        ],
      },
      {
        label: "Account",
        items: [
          { id: "notifications", label: "Notifications", icon: "bell" },
          { id: "settings", label: "Settings", icon: "settings" },
        ],
      },
    ],
  },
  freelancer: {
    id: "freelancer",
    label: "Freelancer",
    shortLabel: "Freelancer",
    workspaceInitials: "MB",
    workspaceName: "Marco Bellini",
    roleBadge: "Freelancer · Full-stack",
    userInitials: "MB",
    userName: "Marco Bellini",
    userEmail: "marco@bellini.dev",
    navGroups: [
      {
        label: "Work",
        items: [
          { id: "overview", label: "Overview", icon: "grid" },
          { id: "projects", label: "My Projects", icon: "folder" },
          { id: "milestones", label: "Milestones", icon: "flag" },
          { id: "tasks", label: "My Tasks", icon: "checkSquare", count: 6 },
          { id: "submissions", label: "Submissions", icon: "upload" },
          {
            id: "feedback",
            label: "Feedback & Revisions",
            icon: "messageCircle",
            alertCount: 1,
          },
        ],
      },
      {
        label: "Money",
        items: [
          { id: "earnings", label: "Earnings & Payouts", icon: "dollarCircle" },
          { id: "agreements", label: "Agreements", icon: "fileText", count: 1 },
          { id: "disputes", label: "Disputes", icon: "scale" },
        ],
      },
      {
        label: "Records",
        items: [
          { id: "documents", label: "Documents", icon: "file" },
          { id: "messages", label: "Messages & Activity", icon: "messageSquare" },
        ],
      },
      {
        label: "Account",
        items: [
          { id: "notifications", label: "Notifications", icon: "bell" },
          { id: "settings", label: "Profile & Settings", icon: "settings" },
        ],
      },
    ],
  },
};
