import React, { useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ClientDashboard } from "./components/client/ClientDashboard";
import { FreelancerDashboard } from "./components/freelancer/FreelancerDashboard";
import { ActionModal } from "./components/views/ActionModal";
import { SectionPlaceholderView } from "./components/views/SectionPlaceholderView";

export default function App() {
  const [activeRole, setActiveRole] = useState("admin");
  const [activeNav, setActiveNav] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__mlToastTimer);
    window.__mlToastTimer = window.setTimeout(() => setToast(""), 3000);
  };

  const handleRoleChange = (roleId) => {
    setActiveRole(roleId);
    setActiveNav("overview");
    setSearchQuery("");
  };

  const renderContent = () => {
    if (activeNav !== "overview") {
      return (
        <SectionPlaceholderView
          activeRole={activeRole}
          activeNav={activeNav}
          onBackToOverview={() => setActiveNav("overview")}
        />
      );
    }

    if (activeRole === "admin") {
      return (
        <AdminDashboard
          searchQuery={searchQuery}
          onNavigate={setActiveNav}
          onActionModal={setModal}
          onToast={showToast}
        />
      );
    }

    if (activeRole === "client") {
      return (
        <ClientDashboard
          searchQuery={searchQuery}
          onNavigate={setActiveNav}
          onActionModal={setModal}
        />
      );
    }

    return (
      <FreelancerDashboard
        searchQuery={searchQuery}
        onNavigate={setActiveNav}
        onActionModal={setModal}
      />
    );
  };

  return (
    <>
      <AppShell
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNotifications={() => setActiveNav("notifications")}
      >
        {renderContent()}
      </AppShell>

      <ActionModal
        modal={modal}
        onClose={() => setModal(null)}
        onConfirm={(actionName) => {
          setModal(null);
          showToast(`${actionName} completed`);
        }}
      />

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
