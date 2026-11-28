import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerTasksPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.tasks} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

