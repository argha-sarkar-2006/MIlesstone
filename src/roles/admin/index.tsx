import { RoleApplication } from "../RoleApplication";
import pages from "./pages";

export default function AdminApp() {
  return <RoleApplication role="admin" pages={pages} />;
}
