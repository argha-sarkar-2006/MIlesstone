import { useEffect, useState } from "react";
import { ROLE_PATHS, type DashboardRole } from "../data/navigationData";

const roleRoot: Record<DashboardRole, string> = {
  admin: "/admin",
  client: "/client",
  freelancer: "/freelancer",
};

export function getRolePage(role: DashboardRole, pathname = window.location.pathname): string {
  const path = pathname.replace(/\/$/, "");
  const rolePrefix = roleRoot[role];
  if (!path || path === rolePrefix) return "overview";
  const route = path.startsWith(`${rolePrefix}/`) ? path.slice(rolePrefix.length + 1) : "";
  return Object.entries(ROLE_PATHS[role]).find(([, segment]) => segment === route)?.[0] ?? "overview";
}

export function useRoleNavigation(role: DashboardRole) {
  const [activePage, setActivePage] = useState(() => getRolePage(role));

  useEffect(() => {
    const syncRoute = () => setActivePage(getRolePage(role));
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, [role]);

  const navigate = (page: string) => {
    const segment = ROLE_PATHS[role][page];
    if (!segment) return;
    const path = `${roleRoot[role]}/${segment}`;
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setActivePage(page);
  };

  return { activePage, navigate };
}
