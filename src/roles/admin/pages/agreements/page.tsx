import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminAgreementsPage(props: RolePageProps){
  return <PageFrame page={adminPages.agreements} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

