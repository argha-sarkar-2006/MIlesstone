import React, { useState } from "react";
import { ADMIN_DATA } from "../../data/adminData";
import { Icon } from "../shared/Icons";
import { KpiStrip } from "./KpiStrip";
import { EscrowOverviewCard } from "./EscrowOverviewCard";
import { FundedReleasedChart } from "./FundedReleasedChart";
import { ActiveProjectsTable } from "./ActiveProjectsTable";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { NeedsAttentionCard } from "./NeedsAttentionCard";
import { AdminDeadlinesCard } from "./AdminDeadlinesCard";
import { ProjectActivityCard } from "./ProjectActivityCard";

const RANGES = [
  { id: "30d", label: "30d", text: "Last 30 days" },
  { id: "90d", label: "90d", text: "Last 90 days" },
  { id: "YTD", label: "YTD", text: "Year to date" },
];

export function AdminDashboard({ searchQuery, onNavigate, onActionModal, onToast }) {
  const [range, setRange] = useState("30d");
  const q = searchQuery.trim().toLowerCase();

  const rangeInfo = RANGES.find((r) => r.id === range) || RANGES[0];
  const kpis = ADMIN_DATA.kpisByRange[range];
  const chartData = ADMIN_DATA.escrow.chartByRange[range];

  const projects = q
    ? ADMIN_DATA.activeProjects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.status.label.toLowerCase().includes(q)
      )
    : ADMIN_DATA.activeProjects;

  const transactions = q
    ? ADMIN_DATA.recentTransactions.filter(
        (t) => t.title.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q)
      )
    : ADMIN_DATA.recentTransactions;

  const alerts = q
    ? ADMIN_DATA.needsAttention.filter(
        (a) => a.title.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
      )
    : ADMIN_DATA.needsAttention;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{ADMIN_DATA.header.greeting}</h1>
          <p className="page-subtitle">
            {ADMIN_DATA.header.subtitlePrefix} · {rangeInfo.text} ·{" "}
            {ADMIN_DATA.header.updatedText}
          </p>
        </div>

        <div className="page-actions">
          <div className="segmented-control" role="group" aria-label="Timeframe filter">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`segmented-btn ${range === r.id ? "active" : ""}`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onToast(`Exported ${rangeInfo.text} escrow & project CSV`)}
          >
            <Icon name="download" size={14} />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              onActionModal({
                title: "Create New Agreement",
                description:
                  "Draft a milestone-locked agreement between your client organization and assigned freelancer.",
                confirmLabel: "Send Agreement Draft",
              })
            }
          >
            <Icon name="plus" size={14} />
            <span>New agreement</span>
          </button>
        </div>
      </div>

      <KpiStrip items={kpis} />

      <div className="admin-main-grid">
        <div className="admin-col">
          <section className="card escrow-chart-card">
            <EscrowOverviewCard escrow={ADMIN_DATA.escrow} />
            <FundedReleasedChart
              data={chartData}
              policyNote={ADMIN_DATA.escrow.policyNote}
            />
          </section>

          <ActiveProjectsTable
            projects={projects}
            onViewAll={() => onNavigate("projects")}
          />

          <RecentTransactionsCard
            transactions={transactions}
            onViewAll={() => onNavigate("escrow")}
          />
        </div>

        <div className="admin-col">
          <NeedsAttentionCard
            items={alerts}
            onViewAll={() => onNavigate("disputes")}
            onSelectItem={(item) =>
              onActionModal({
                title: item.title,
                description: `${item.sub} · Amount involved: ${item.amount}.`,
                confirmLabel: "Acknowledge & Track",
              })
            }
          />

          <AdminDeadlinesCard deadlines={ADMIN_DATA.upcomingDeadlines} />

          <ProjectActivityCard activities={ADMIN_DATA.projectActivity} />
        </div>
      </div>
    </div>
  );
}
