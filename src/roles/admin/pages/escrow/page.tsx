import { PageFrame } from "../../../../components/views/PageFrame";
import { adminPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function AdminEscrowPage(props: RolePageProps){
  return <PageFrame page={adminPages.escrow} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

