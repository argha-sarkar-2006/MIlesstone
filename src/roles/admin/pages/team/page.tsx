import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminTeamPage(props: RolePageProps){
  return <PageFrame page={adminPages.team} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

