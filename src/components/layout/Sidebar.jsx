import React, { useState, useRef, useEffect } from "react";
import { ROLES } from "../../data/navigationData";
import { Icon } from "../shared/Icons";

export function Sidebar({
  activeRole,
  onRoleChange,
  activeNav,
  onNavChange,
  isOpen,
  onClose,
}) {
  const roleConfig = ROLES[activeRole];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

        <div className="switcher-wrap" ref={switcherRef}>
          <button
            type="button"
            className="switcher-btn"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
          >
            <span className="switcher-avatar">{roleConfig.workspaceInitials}</span>
            <span className="switcher-info">
              <div className="switcher-title">{roleConfig.workspaceName}</div>
              <span className="switcher-role-badge">{roleConfig.roleBadge}</span>
            </span>
            <span className="switcher-chevrons">
              <Icon name="chevronsUpDown" size={14} />
            </span>
          </button>

          {dropdownOpen && (
            <div className="switcher-dropdown" role="menu">
              <div className="switcher-dropdown-label">Switch dashboard view</div>
              {Object.values(ROLES).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`switcher-option ${r.id === activeRole ? "active" : ""}`}
                  onClick={() => {
                    onRoleChange(r.id);
                    setDropdownOpen(false);
                    onClose();
                  }}
                >
                  <span className="switcher-avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                    {r.workspaceInitials}
                  </span>
                  <span className="switcher-option-meta">
                    <div className="switcher-option-name">{r.workspaceName}</div>
                    <div className="switcher-option-role">{r.roleBadge}</div>
                  </span>
                </button>
              ))}
            </div>
          )}
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
