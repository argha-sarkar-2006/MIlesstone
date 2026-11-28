import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientDisputesPage(props: RolePageProps){
  return <PageFrame page={clientPages.disputes} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

