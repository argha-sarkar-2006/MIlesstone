import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerActivityPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.activity} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

