/**
 * User Utility Types & Role Constants
 *
 * All user-related privilege types and role definitions live here.
 * Import from this file — never from dummy.ts.
 */

// ---------------------------------------------------------------------------
// Permission types
// ---------------------------------------------------------------------------

/** The four permission levels available on any feature */
export type PermissionType = "full" | "add" | "edit" | "view";

/** Granular permission flags stored per feature */
export interface FeaturePermissions {
  full: boolean;
  add: boolean;
  edit: boolean;
  view: boolean;
}

// ---------------------------------------------------------------------------
// Reports-specific privilege types
// ---------------------------------------------------------------------------

export interface ReportFilterOption {
  key: string;
  /** Optional — labels come from REPORT_OPTIONS config, not persisted */
  label?: string;
  enabled: boolean;
}

export interface ReportPermissions {
  reportId: string;
  enabled: boolean;
  filters?: ReportFilterOption[];
}

export interface ReportsPrivileges extends FeaturePermissions {
  items?: ReportPermissions[];
}

// ---------------------------------------------------------------------------
// Top-level user privilege map
// ---------------------------------------------------------------------------

/** The full privilege map for an "Access-Enabled User". */
export interface UserPrivileges {
  employees?: FeaturePermissions;
  timesheet?: FeaturePermissions;
  projects?: FeaturePermissions;
  loans?: FeaturePermissions;
  trafficViolations?: FeaturePermissions;
  exitReentry?: FeaturePermissions;
  payroll?: FeaturePermissions;
  ledger?: FeaturePermissions;
  usersManagement?: FeaturePermissions;
  reports?: ReportsPrivileges;
  setup?: FeaturePermissions;
  dashboard?: FeaturePermissions;
}
export type Feature = keyof UserPrivileges;

// ---------------------------------------------------------------------------
// Navigation Constants
// ---------------------------------------------------------------------------

export interface MenuItem {
  icon: string;
  href?: string;
  label: string;
  description?: string;
  divider?: boolean;
  items?: MenuItem[];
  feature?: Feature; // Used to identify the privilege key matching this Menu Item
}

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    description: "View and manage overall system analytics",
    feature: "dashboard",
    icon: "fa-regular fa-layer-group text-xl!",
    href: "/",
  },
  {
    label: "Employees",
    description: "View and manage employee records and profiles",
    feature: "employees",
    icon: "fa-light fa-address-card text-xl!",
    href: "/employees",
  },
  {
    label: "Timesheet",
    description: "Track and manage employee work hours",
    feature: "timesheet",
    icon: "fa-light fa-calendar text-xl!",
    href: "/timesheet",
  },
  {
    label: "Projects",
    description: "Overview and manage active projects",
    feature: "projects",
    icon: "fa-light fa-building text-xl!",
    href: "/projects",
  },
  {
    label: "Reports",
    description: "Access and generate various system reports",
    feature: "reports",
    icon: "fa-light fa-file-chart-column text-xl!",
    href: "/reports",
  },
  { divider: true, label: "", icon: "" },
  {
    label: "Loans",
    description: "Manage employee loan requests and status",
    feature: "loans",
    icon: "fa-light fa-newspaper text-xl!",
    href: "/loans",
  },
  {
    label: "Traffic Violations",
    description: "Track and resolve vehicle traffic violations",
    feature: "trafficViolations",
    icon: "fa-light fa-ticket text-xl!",
    href: "/violations",
  },
  {
    label: "Payroll",
    description: "View and process employee payroll and salaries",
    feature: "payroll",
    icon: "fa-light fa-book-open-reader text-xl!",
    href: "/payroll",
  },
  {
    label: "Ledger",
    description: "Access comprehensive financial ledger records",
    feature: "ledger",
    icon: "fa-light fa-book-open-lines text-xl!",
    href: "/ledger",
  },
  {
    label: "Exit Re-entry",
    description: "Manage employee travel and visa documentation",
    feature: "exitReentry",
    icon: "fa-light fa-diamond-turn-right text-xl!",
    href: "/exit-reentry",
  },
  {
    label: "Users Mgmt.",
    description: "Configure and manage system user access",
    feature: "usersManagement",
    icon: "pi pi-users text-2xl!",
    href: "/users",
  },
  {
    label: "Setup",
    description: "Configure system settings and parameters",
    feature: "setup",
    icon: "fa-light fa-gear text-xl!",
    href: "/setup",
  },
];

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------

/**
 * User Role Access Level Definitions:
 *   1. Admin             — Full access to all branches and features
 *   2. Manager           — Full access except user management
 *   3. Branch Manager    — Full access except user management (branch-scoped)
 *   4. Access-Enabled User — Customisable per-feature privileges
 */
export const USER_ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  BRANCH_MANAGER: 3,
  ACCESS_ENABLED: 4,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Roles that always have full access (no privilege map needed) */
export const FULL_ACCESS_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.BRANCH_MANAGER,
];
