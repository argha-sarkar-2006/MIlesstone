import { PageFrame } from "../../../../components/views/PageFrame";
import { freelancerPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function FreelancerSettingsPage(props: RolePageProps){
  return <PageFrame page={freelancerPages.settings} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

