import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { ActionModal } from "../components/views/ActionModal";
import { useRoleNavigation } from "../navigation/roleNavigation";
import type { DashboardRole } from "../data/navigationData";
import type { RolePageAction, RolePageComponent } from "./roleTypes";

type Props = { role: DashboardRole; pages: Record<string, RolePageComponent> };

export function RoleApplication({ role, pages }: Props) {
  const { activePage, navigate } = useRoleNavigation(role);
  const Page = pages[activePage] ?? pages.overview;
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<RolePageAction | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <>
      <AppShell activeRole={role} activeNav={activePage} onNavChange={navigate}
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        onOpenNotifications={() => navigate("notifications")}>
        <Page searchQuery={searchQuery} onNavigate={navigate}
          onAction={setModal} onToast={showToast} />
      </AppShell>
      <ActionModal modal={modal} onClose={() => setModal(null)} onConfirm={(actionName: string) => {
        setModal(null);
        showToast(actionName + " previewed — no live transaction was sent.");
      }} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
