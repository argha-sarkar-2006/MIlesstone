import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminMilestonesPage(props: RolePageProps){
  return <PageFrame page={adminPages.milestones} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

