import { AdminOverviewPage } from "./overview/page";
import { AdminProjectsPage } from "./projects/page";
import { AdminClientsPage } from "./clients/page";
import { AdminFreelancersPage } from "./freelancers/page";
import { AdminAgreementsPage } from "./agreements/page";
import { AdminMilestonesPage } from "./milestones/page";
import { AdminEscrowPage } from "./escrow/page";
import { AdminPaymentsPage } from "./payments/page";
import { AdminDisputesPage } from "./disputes/page";
import { AdminDocumentsPage } from "./documents/page";
import { AdminReportsPage } from "./reports/page";
import { AdminTeamPage } from "./team/page";
import { AdminNotificationsPage } from "./notifications/page";
import { AdminSettingsPage } from "./settings/page";
import type { RolePageComponent } from "../../roleTypes";

const pages = {
  overview: AdminOverviewPage,
  projects: AdminProjectsPage,
  clients: AdminClientsPage,
  freelancers: AdminFreelancersPage,
  agreements: AdminAgreementsPage,
  milestones: AdminMilestonesPage,
  escrow: AdminEscrowPage,
  payments: AdminPaymentsPage,
  disputes: AdminDisputesPage,
  documents: AdminDocumentsPage,
  reports: AdminReportsPage,
  team: AdminTeamPage,
  notifications: AdminNotificationsPage,
  settings: AdminSettingsPage,
} satisfies Record<string, RolePageComponent>;

export default pages;

