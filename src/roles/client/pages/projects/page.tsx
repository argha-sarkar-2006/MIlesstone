import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientProjectsPage(props: RolePageProps){
  return <PageFrame page={clientPages.projects} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

