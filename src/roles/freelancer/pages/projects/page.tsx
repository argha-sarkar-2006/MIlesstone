import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerProjectsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.projects} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

