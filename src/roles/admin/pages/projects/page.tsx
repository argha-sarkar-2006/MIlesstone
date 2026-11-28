import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminProjectsPage(props: RolePageProps){
  return <PageFrame page={adminPages.projects} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

