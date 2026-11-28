import { FreelancerOverviewPage } from "./overview/page";
import { FreelancerProjectsPage } from "./projects/page";
import { FreelancerMilestonesPage } from "./milestones/page";
import { FreelancerTasksPage } from "./tasks/page";
import { FreelancerSubmissionsPage } from "./submissions/page";
import { FreelancerRevisionsPage } from "./revisions/page";
import { FreelancerEarningsPage } from "./earnings/page";
import { FreelancerAgreementsPage } from "./agreements/page";
import { FreelancerDisputesPage } from "./disputes/page";
import { FreelancerDocumentsPage } from "./documents/page";
import { FreelancerActivityPage } from "./activity/page";
import { FreelancerNotificationsPage } from "./notifications/page";
import { FreelancerSettingsPage } from "./settings/page";
import type { RolePageComponent } from "../../roleTypes";

const pages = {
  overview: FreelancerOverviewPage,
  projects: FreelancerProjectsPage,
  milestones: FreelancerMilestonesPage,
  tasks: FreelancerTasksPage,
  submissions: FreelancerSubmissionsPage,
  revisions: FreelancerRevisionsPage,
  earnings: FreelancerEarningsPage,
  agreements: FreelancerAgreementsPage,
  disputes: FreelancerDisputesPage,
  documents: FreelancerDocumentsPage,
  activity: FreelancerActivityPage,
  notifications: FreelancerNotificationsPage,
  settings: FreelancerSettingsPage,
} satisfies Record<string, RolePageComponent>;

export default pages;

