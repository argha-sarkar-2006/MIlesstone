import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientSettingsPage(props: RolePageProps){
  return <PageFrame page={clientPages.settings} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

