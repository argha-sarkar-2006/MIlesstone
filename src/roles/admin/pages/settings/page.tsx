import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminSettingsPage(props: RolePageProps){
  return <PageFrame page={adminPages.settings} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

