import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientMilestonesPage(props: RolePageProps){
  return <PageFrame page={clientPages.milestones} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

