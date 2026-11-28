import React from "react";
import { ROLES } from "../../data/navigationData";
import { Icon } from "../shared/Icons";
import type { DashboardRole, NavigationGroup } from "../../data/navigationData";

export function Sidebar({
  activeRole,
  activeNav,
  onNavChange,
  isOpen,
  onClose,
}: { activeRole: DashboardRole; activeNav: string; onNavChange: (page: string) => void; isOpen: boolean; onClose: () => void }) {
  const roleConfig = ROLES[activeRole];
  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">
            <Icon name="lock" size={15} strokeWidth={2.1} />
          </span>
          <span className="brand-name">MilestoneLock</span>
        </div>

        <div className="switcher-wrap">
          <div className="switcher-btn" aria-label={`${roleConfig.roleBadge} dashboard`}>
            <span className="switcher-avatar">{roleConfig.workspaceInitials}</span>
            <span className="switcher-info">
              <span className="switcher-title">{roleConfig.workspaceName}</span>
              <span className="switcher-role-badge">{roleConfig.roleBadge}</span>
            </span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {roleConfig.navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => {
                      onNavChange(item.id);
                      onClose();
                    }}
                  >
                    <span className="nav-item-icon">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="nav-item-label">{item.label}</span>
                    {typeof item.count === "number" && (
                      <span className="nav-count">{item.count}</span>
                    )}
                    {typeof item.alertCount === "number" && (
                      <span className="nav-alert-badge">{item.alertCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="footer-avatar">{roleConfig.userInitials}</span>
          <div className="footer-user">
            <div className="footer-name">{roleConfig.userName}</div>
            <div className="footer-email">{roleConfig.userEmail}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
