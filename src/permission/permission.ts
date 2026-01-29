export enum Permission {
  DASHBOARD_VIEW = "DASHBOARD_VIEW",
  MAP_LAYER_VIEW = "MAP_LAYER_VIEW",

  REPORT_VIEW = "REPORT_VIEW",
  LAYER_SCHEMA_VIEW = "LAYER_SCHEMA_VIEW",
  USER_MANAGEMENT_VIEW = "USER_MANAGEMENT_VIEW",
  USER_ROLE_VIEW = "USER_ROLE_VIEW",

  HELP_VIEW = "HELP_VIEW",
  SETTINGS_VIEW = "SETTINGS_VIEW",
}

type Role = "Admin" | "Staff";

const rolePermissions: Record<Role, Permission[]> = {
  Admin: [
    Permission.DASHBOARD_VIEW,
    Permission.MAP_LAYER_VIEW,

    Permission.REPORT_VIEW,
    Permission.LAYER_SCHEMA_VIEW,
    Permission.USER_MANAGEMENT_VIEW,
    Permission.USER_ROLE_VIEW,

    Permission.HELP_VIEW,
    Permission.SETTINGS_VIEW,
  ],

  Staff: [
    Permission.DASHBOARD_VIEW,
    Permission.MAP_LAYER_VIEW,

    Permission.HELP_VIEW,
    Permission.SETTINGS_VIEW,
  ],
};

export function hasPermission(
  role: string | undefined | null,
  permission: Permission,
): boolean {
  if (!role) return false;
  return rolePermissions[role as Role]?.includes(permission) ?? false;
}
