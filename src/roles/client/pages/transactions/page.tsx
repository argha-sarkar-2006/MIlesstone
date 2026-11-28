import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientTransactionsPage(props: RolePageProps){
  return <PageFrame page={clientPages.transactions} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

