import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminNotificationsPage(props: RolePageProps){
  return <PageFrame page={adminPages.notifications} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

