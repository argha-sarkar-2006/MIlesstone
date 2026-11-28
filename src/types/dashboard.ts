import type { ReactNode } from "react";
import { ADMIN_DATA } from "../data/adminData";
import { CLIENT_DATA } from "../data/clientData";
import { FREELANCER_DATA } from "../data/freelancerData";
import type { DashboardRole } from "../data/navigationData";

export type DashboardAction = {
  title: string;
  description: string;
  confirmLabel?: string;
  secondaryLabel?: string;
  bullets?: string[];
  meta?: string;
};
export type DashboardNavigation = (page: string) => void;
export type DashboardActionHandler = (action: DashboardAction) => void;
export type DashboardToast = (message: string) => void;
export type DashboardProps = {
  searchQuery: string;
  onNavigate: DashboardNavigation;
  onActionModal: DashboardActionHandler;
  onToast: DashboardToast;
};
export type ShellProps = {
  activeRole: DashboardRole;
  activeNav: string;
  onNavChange: DashboardNavigation;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNotifications: () => void;
  children: ReactNode;
};
export type AdminProject = (typeof ADMIN_DATA.activeProjects)[number];
export type AdminDeadline = (typeof ADMIN_DATA.upcomingDeadlines)[number];
export type AdminAttention = (typeof ADMIN_DATA.needsAttention)[number];
export type AdminActivity = (typeof ADMIN_DATA.projectActivity)[number];
export type AdminTransaction = (typeof ADMIN_DATA.recentTransactions)[number];
export type ClientProject = (typeof CLIENT_DATA.projects)[number];
export type ClientReview = (typeof CLIENT_DATA.waitingForReview)[number];
export type ClientDeadline = (typeof CLIENT_DATA.upcomingDeadlines)[number];
export type ClientActivity = (typeof CLIENT_DATA.recentActivity)[number];
export type FreelancerProject = (typeof FREELANCER_DATA.projects)[number];
export type FreelancerDeliverable = (typeof FREELANCER_DATA.deliverables)[number];
export type FreelancerPayment = (typeof FREELANCER_DATA.moneyOnItsWay.items)[number];
export type FreelancerAgreement = typeof FREELANCER_DATA.agreementToReview;
