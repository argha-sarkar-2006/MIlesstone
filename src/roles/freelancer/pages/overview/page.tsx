import { FreelancerDashboard } from "../../../../components/freelancer/FreelancerDashboard";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerOverviewPage(props: RolePageProps){
  return <FreelancerDashboard searchQuery={props.searchQuery} onNavigate={props.onNavigate}
    onActionModal={props.onAction} onToast={props.onToast} />;
}

