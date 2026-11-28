import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientDocumentsPage(props: RolePageProps){
  return <PageFrame page={clientPages.documents} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

