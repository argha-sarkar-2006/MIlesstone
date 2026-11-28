import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminDisputesPage(props: RolePageProps){
  return <PageFrame page={adminPages.disputes} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

