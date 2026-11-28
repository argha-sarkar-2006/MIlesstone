import { RoleApplication } from "../RoleApplication";
import pages from "./pages";

export default function ClientApp() {
  return <RoleApplication role="client" pages={pages} />;
}
