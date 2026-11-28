import { AdminDashboard } from "../../../../components/admin/AdminDashboard";
import type { RolePageProps } from "../../../roleTypes";

export function AdminOverviewPage(props: RolePageProps){
  return <AdminDashboard searchQuery={props.searchQuery} onNavigate={props.onNavigate}
    onActionModal={props.onAction} onToast={props.onToast} />;
}

