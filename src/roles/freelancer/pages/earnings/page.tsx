import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerEarningsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.earnings} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

