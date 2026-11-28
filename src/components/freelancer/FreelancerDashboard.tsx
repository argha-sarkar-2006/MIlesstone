import React from "react";
import { FREELANCER_DATA } from "../../data/freelancerData";
import { Icon } from "../shared/Icons";
import { NextDeliverablesCard } from "./NextDeliverablesCard";
import { FreelancerProjectsTable } from "./FreelancerProjectsTable";
import { MoneyOnItsWayCard } from "./MoneyOnItsWayCard";
import { AgreementToReviewCard } from "./AgreementToReviewCard";
import type { DashboardProps } from "../../types/dashboard";
import type { FreelancerDeliverable } from "../../types/dashboard";

export function FreelancerDashboard({ searchQuery, onNavigate, onActionModal }: DashboardProps) {
  const q = searchQuery.trim().toLowerCase();

  const deliverables = q
    ? FREELANCER_DATA.deliverables.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.projectLine.toLowerCase().includes(q) ||
          d.status.label.toLowerCase().includes(q)
      )
    : FREELANCER_DATA.deliverables;

  const projects = q
    ? FREELANCER_DATA.projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q)
      )
    : FREELANCER_DATA.projects;

  const handleDeliverableAction = (item: FreelancerDeliverable) => {
    onActionModal({
      title: `${item.actionLabel}: ${item.title}`,
      description: `${item.projectLine} · Value: ${item.amount} · ${item.dueText}.`,
      meta: item.quote || item.note,
      confirmLabel:
        item.actionLabel === "Submit"
          ? "Submit Milestone for Review"
          : item.actionLabel === "Respond"
          ? "Send Localized Fix"
          : "Close Preview",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{FREELANCER_DATA.header.greeting}</h1>
          <p className="page-subtitle">{FREELANCER_DATA.header.subtitle}</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onActionModal({
                title: "Submit a Milestone",
                description:
                  "Select an active funded milestone (e.g., M4 · Payment flow QA — $16,800) to attach deliverables and run acceptance checks.",
                confirmLabel: "Submit Deliverable",
              })
            }
          >
            <Icon name="arrowRight" size={14} />
            <span>Submit a milestone</span>
          </button>
        </div>
      </div>

      <div className="freelancer-main-grid">
        <div className="freelancer-col">
          <NextDeliverablesCard
            deliverables={deliverables}
            onAction={handleDeliverableAction}
          />
          <FreelancerProjectsTable
            projects={projects}
            onViewAll={() => onNavigate("projects")}
          />
        </div>

        <div className="freelancer-col">
          <MoneyOnItsWayCard
            data={FREELANCER_DATA.moneyOnItsWay}
            onViewEarnings={() => onNavigate("earnings")}
          />
          <AgreementToReviewCard
            agreement={FREELANCER_DATA.agreementToReview}
            onReviewSign={() =>
              onActionModal({
                title: "Review & Sign Agreement",
                description: `${FREELANCER_DATA.agreementToReview.title} (${FREELANCER_DATA.agreementToReview.sub}) — $22,000 across 3 milestones with 2 revisions per milestone.`,
                confirmLabel: "Sign Agreement",
              })
            }
            onAskQuestion={() =>
              onActionModal({
                title: "Ask a Question",
                description:
                  "Send a clarification request to Kestrel Digital regarding milestone dates or revision caps for Pulse Analytics SDK.",
                confirmLabel: "Send Message",
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
