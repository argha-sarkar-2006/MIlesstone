import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerMilestonesPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.milestones} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

