import React from "react";
import { Icon } from "../shared/Icons";
import type { DashboardRole } from "../../data/navigationData";

export function TopBar({
  activeRole,
  searchQuery,
  onSearchChange,
  searchInputRef,
  onOpenMenu,
  onOpenNotifications,
}: { activeRole: DashboardRole; searchQuery: string; onSearchChange: (query: string) => void; searchInputRef: React.RefObject<HTMLInputElement | null>; onOpenMenu: () => void; onOpenNotifications: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
        >
          <Icon name="menu" size={17} />
        </button>

        <label className="search-box">
          <Icon name="search" size={14} />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search projects, agreements, people…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="search-kbd">⌘K</span>
        </label>
      </div>

      <div className="topbar-right">
        <div className="topbar-workspace-label">
          <span className="demo-topbar-badge">Demo data</span>
          <span>{activeRole === "admin" ? "Organization admin" : activeRole === "client" ? "Client workspace" : "Freelancer workspace"}</span>
        </div>

        <button
          type="button"
          className="notif-btn"
          onClick={onOpenNotifications}
          aria-label="Notifications"
        >
          <Icon name="bell" size={17} />
          <span className="notif-dot" />
        </button>
      </div>
    </header>
  );
}
