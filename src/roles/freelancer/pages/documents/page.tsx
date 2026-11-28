import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerDocumentsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.documents} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

