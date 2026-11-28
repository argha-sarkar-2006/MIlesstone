import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerDisputesPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.disputes} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

