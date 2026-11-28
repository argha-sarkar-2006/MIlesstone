import React from "react";
import { CLIENT_DATA } from "../../data/clientData";
import { Icon } from "../shared/Icons";
import { WaitingForReviewCard } from "./WaitingForReviewCard";
import { ClientFundsCard } from "./ClientFundsCard";
import { ClientProjectsGrid } from "./ClientProjectsGrid";
import { ClientDeadlinesCard } from "./ClientDeadlinesCard";
import { ClientActivityCard } from "./ClientActivityCard";
import type { DashboardProps } from "../../types/dashboard";
import type { ClientReview } from "../../types/dashboard";

export function ClientDashboard({ searchQuery, onNavigate, onActionModal }: DashboardProps) {
  const q = searchQuery.trim().toLowerCase();

  const reviews = q
    ? CLIENT_DATA.waitingForReview.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.project.toLowerCase().includes(q) ||
          r.freelancer.toLowerCase().includes(q)
      )
    : CLIENT_DATA.waitingForReview;

  const projects = q
    ? CLIENT_DATA.projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.current.toLowerCase().includes(q)
      )
    : CLIENT_DATA.projects;

  const handleOpenFundingModal = () => {
    onActionModal({
      title: "Fund Agreements",
      description:
        "2 agreements require funding ($51,500 total remaining): Loyalty App MVP ($27,000 for M3–M4) and Product Photography Q1 ($24,500). Work starts once milestones are funded.",
      confirmLabel: "Proceed to Escrow Funding",
    });
  };

  const handleOpenReviewModal = (item: ClientReview) => {
    onActionModal({
      title: `Review ${item.title}`,
      description: `${item.project} · Submitted by ${item.freelancer} (${item.amount} allocated to the milestone).`,
      bullets: item.criteria,
      confirmLabel: "Approve milestone",
      secondaryLabel: "Request Revision",
      meta: `Attachments: ${item.attachments.join(" · ")}. Approval does not authorize or execute payment; settlement follows a separate authorization workflow.`,
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{CLIENT_DATA.header.greeting}</h1>
          <p className="page-subtitle">{CLIENT_DATA.header.subtitle}</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenFundingModal}
          >
            <Icon name="wallet" size={14} />
            <span>Fund agreements</span>
          </button>
        </div>
      </div>

      <div className="client-top-grid">
        <WaitingForReviewCard items={reviews} onReview={handleOpenReviewModal} />
        <ClientFundsCard
          funds={CLIENT_DATA.funds}
          onFundClick={handleOpenFundingModal}
        />
      </div>

      <ClientProjectsGrid
        projects={projects}
        onViewAll={() => onNavigate("projects")}
      />

      <div className="client-bottom-grid">
        <ClientDeadlinesCard deadlines={CLIENT_DATA.upcomingDeadlines} />
        <ClientActivityCard activities={CLIENT_DATA.recentActivity} />
      </div>
    </div>
  );
}
