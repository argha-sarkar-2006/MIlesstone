import { PageFrame } from "../../../../components/views/PageFrame";
import { clientPages } from "../pageData";
import type { RolePageProps } from "../../../roleTypes";

export function ClientReviewsPage(props: RolePageProps){
  return <PageFrame page={clientPages.reviews} searchQuery={props.searchQuery} onAction={props.onAction} />;
}

