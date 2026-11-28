import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminPaymentsPage(props: RolePageProps){
  return <PageFrame page={adminPages.payments} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

