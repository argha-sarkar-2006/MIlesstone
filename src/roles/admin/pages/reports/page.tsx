import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminReportsPage(props: RolePageProps){
  return <PageFrame page={adminPages.reports} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

