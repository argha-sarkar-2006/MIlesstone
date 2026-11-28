import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { ShellProps } from "../../types/dashboard";

export function AppShell({
  activeRole,
  activeNav,
  onNavChange,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  children,
}: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
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
        activeNav={activeNav}
        onNavChange={onNavChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-area">
        <TopBar
          activeRole={activeRole}
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
