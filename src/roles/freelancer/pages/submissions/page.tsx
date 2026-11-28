import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerSubmissionsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.submissions} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

