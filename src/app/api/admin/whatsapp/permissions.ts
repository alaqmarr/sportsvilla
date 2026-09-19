import { PERMISSIONS as RBAC_PERMISSIONS, Permission } from "@/core/auth/rbac-definitions";

export const PERMISSIONS = {
  ...RBAC_PERMISSIONS,
  VIEW_WHATSAPP: "view:whatsapp" as Permission,
  MANAGE_WHATSAPP: "manage:whatsapp" as Permission,
} as const;
