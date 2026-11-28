import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientActivityPage(props: RolePageProps){
  return <PageFrame page={clientPages.activity} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

