import { ClientOverviewPage } from "./overview/page";
import { ClientProjectsPage } from "./projects/page";
import { ClientAgreementsPage } from "./agreements/page";
import { ClientMilestonesPage } from "./milestones/page";
import { ClientReviewsPage } from "./reviews/page";
import { ClientFundingPage } from "./funding/page";
import { ClientTransactionsPage } from "./transactions/page";
import { ClientDisputesPage } from "./disputes/page";
import { ClientDocumentsPage } from "./documents/page";
import { ClientActivityPage } from "./activity/page";
import { ClientNotificationsPage } from "./notifications/page";
import { ClientSettingsPage } from "./settings/page";
import type { RolePageComponent } from "../../roleTypes";

const pages = {
  overview: ClientOverviewPage,
  projects: ClientProjectsPage,
  agreements: ClientAgreementsPage,
  milestones: ClientMilestonesPage,
  reviews: ClientReviewsPage,
  funding: ClientFundingPage,
  transactions: ClientTransactionsPage,
  disputes: ClientDisputesPage,
  documents: ClientDocumentsPage,
  activity: ClientActivityPage,
  notifications: ClientNotificationsPage,
  settings: ClientSettingsPage,
} satisfies Record<string, RolePageComponent>;

export default pages;

