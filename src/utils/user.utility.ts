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
  ADMIN: "Admin",
  MANAGER: "Manager",
  BRANCH_MANAGER: "Branch Manager",
  ACCESS_ENABLED: "Access-Enabled User",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Roles that always have full access (no privilege map needed) */
export const FULL_ACCESS_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.BRANCH_MANAGER,
];
