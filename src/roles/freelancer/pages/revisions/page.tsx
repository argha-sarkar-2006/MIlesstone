import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerRevisionsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.revisions} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

