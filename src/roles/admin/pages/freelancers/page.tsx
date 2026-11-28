import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminFreelancersPage(props: RolePageProps){
  return <PageFrame page={adminPages.freelancers} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

