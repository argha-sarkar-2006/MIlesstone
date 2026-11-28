import { ClientDashboard } from "../../../../components/client/ClientDashboard";
import type { RolePageProps } from "../../../roleTypes";

export function ClientOverviewPage(props: RolePageProps){
  return <ClientDashboard searchQuery={props.searchQuery} onNavigate={props.onNavigate}
    onActionModal={props.onAction} onToast={props.onToast} />;
}

