import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminDocumentsPage(props: RolePageProps){
  return <PageFrame page={adminPages.documents} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

