import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientNotificationsPage(props: RolePageProps){
  return <PageFrame page={clientPages.notifications} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

