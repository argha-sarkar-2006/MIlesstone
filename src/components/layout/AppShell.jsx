import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({
  activeRole,
  onRoleChange,
  activeNav,
  onNavChange,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar
        activeRole={activeRole}
        onRoleChange={onRoleChange}
        activeNav={activeNav}
        onNavChange={onNavChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <TopBar
          activeRole={activeRole}
          onRoleChange={onRoleChange}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchInputRef={searchInputRef}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenNotifications={onOpenNotifications}
        />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
