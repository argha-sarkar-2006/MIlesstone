import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerAgreementsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.agreements} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

