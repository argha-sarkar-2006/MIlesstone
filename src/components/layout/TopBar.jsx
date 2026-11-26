import React from "react";
import { ROLES } from "../../data/navigationData";
import { Icon } from "../shared/Icons";

export function TopBar({
  activeRole,
  onRoleChange,
  searchQuery,
  onSearchChange,
  searchInputRef,
  onOpenMenu,
  onOpenNotifications,
}) {
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
        <div className="role-quick-pills" aria-label="Dashboard role switcher">
          {Object.values(ROLES).map((role) => (
            <button
              key={role.id}
              type="button"
              className={`role-quick-pill ${activeRole === role.id ? "active" : ""}`}
              onClick={() => onRoleChange(role.id)}
            >
              {role.shortLabel}
            </button>
          ))}
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
