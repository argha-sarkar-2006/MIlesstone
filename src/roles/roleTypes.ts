export type RolePageAction = {
  title: string;
  description: string;
  confirmLabel?: string;
  secondaryLabel?: string;
  bullets?: string[];
  meta?: string;
};

export type RolePageProps = {
  searchQuery: string;
  onNavigate: (page: string) => void;
  onAction: (modal: RolePageAction) => void;
  onToast: (message: string) => void;
};

export type RolePageComponent = (props: RolePageProps) => ReactElement;
import type { ReactElement } from "react";

