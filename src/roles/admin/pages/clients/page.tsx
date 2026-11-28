import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminClientsPage(props: RolePageProps){
  return <PageFrame page={adminPages.clients} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

