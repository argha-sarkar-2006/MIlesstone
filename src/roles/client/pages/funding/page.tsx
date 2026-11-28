import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientFundingPage(props: RolePageProps){
  return <PageFrame page={clientPages.funding} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

