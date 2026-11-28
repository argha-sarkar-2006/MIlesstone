import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerNotificationsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.notifications} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

