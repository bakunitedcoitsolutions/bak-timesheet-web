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

interface ReportOption {
  id: string;
  icon: string;
  route: string;
  title: string;
  description: string;
}

export const reportOptions: ReportOption[] = [
  {
    id: "site-wise",
    title: "Site Wise Report",
    description: "View reports organized by site location",
    icon: "fa-light fa-file-invoice",
    route: "/reports/site-wise",
  },
  {
    id: "payroll",
    title: "Payroll Report",
    description: "View payroll reports and summaries",
    icon: "fa-light fa-file-contract",
    route: "/reports/payroll",
  },
  {
    id: "salary-slips",
    title: "Salary Slips",
    description: "Generate and view employee salary slips",
    icon: "fa-light fa-receipt",
    route: "/reports/salary-slips",
  },
  {
    id: "daily-timesheet",
    title: "Daily Timesheet",
    description: "View and manage daily timesheet records",
    icon: "fa-light fa-calendar-circle-plus",
    route: "/reports/daily-timesheet",
  },
  {
    id: "monthly-timesheet",
    title: "Monthly Timesheet",
    description: "View and manage monthly timesheet records",
    icon: "fa-light fa-calendar-check",
    route: "/reports/monthly-timesheet",
  },
  {
    id: "master-payroll",
    title: "Master Payroll",
    description: "View master payroll data and records",
    icon: "fa-light fa-file-chart-column",
    route: "/reports/master-payroll",
  },
  {
    id: "employees",
    title: "Employees Report",
    description: "View comprehensive employee reports",
    icon: "fa-light fa-user-group",
    route: "/reports/employees",
  },
  {
    id: "employee-leave-statement",
    title: "Employee Leave Statement",
    description: "View employee leave records and statements",
    icon: "fa-light fa-file-chart-pie",
    route: "/reports/employee-leave-statement",
  },
  {
    id: "employee-cards",
    title: "Employee Cards",
    description: "View and manage employee card information",
    icon: "fa-light fa-address-card",
    route: "/reports/employee-cards",
  },
];

interface SetupOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

export const setupOptions: SetupOption[] = [
  {
    id: "countries",
    title: "Countries",
    description: "Manage country records and details",
    icon: "fa-light fa-globe",
    route: "/setup/countries",
  },
  {
    id: "cities",
    title: "Cities",
    description: "Manage city records and details",
    icon: "fa-light fa-city",
    route: "/setup/cities",
  },
  {
    id: "branches",
    title: "Branches",
    description: "Manage branch records and details",
    icon: "fa-light fa-sitemap",
    route: "/setup/branches",
  },
  {
    id: "gosi-cities",
    title: "GOSI Cities",
    description: "Manage GOSI city records and details",
    icon: "fa-light fa-building-memo",
    route: "/setup/gosi-cities",
  },
  {
    id: "designation",
    title: "Designation",
    description: "Manage employee designations",
    icon: "fa-light fa-briefcase",
    route: "/setup/designation",
  },
  {
    id: "employee-statuses",
    title: "Employee Statuses",
    description: "Manage employee status records",
    icon: "fa-light fa-user-check",
    route: "/setup/employee-statuses",
  },
  {
    id: "payroll-sections",
    title: "Payroll Sections",
    description: "Manage payroll section records",
    icon: "fa-light fa-wallet",
    route: "/setup/payroll-sections",
  },
  {
    id: "user-roles",
    title: "User Roles",
    description: "Manage user roles and access levels",
    icon: "fa-light fa-user-shield",
    route: "/setup/user-roles",
  },
  {
    id: "payment-methods",
    title: "Payment Methods",
    description: "Manage payment methods",
    icon: "fa-light fa-credit-card",
    route: "/setup/payment-methods",
  },
  {
    id: "allowance-not-available",
    title: "Allowance Not Allowed",
    description: "Manage allowance not allowed records",
    icon: "fa-light fa-money-bill-transfer",
    route: "/setup/allowance-not-available",
  },
];

export interface MenuItem {
  icon: string;
  href?: string;
  label: string;
  slug: string;
  description?: string;
  divider?: boolean;
  items?: MenuItem[];
  feature: Feature; // Used to identify the privilege key matching this Menu Item
  subMenuItems?: {
    label: string;
    href: string;
    slug: string;
  }[];
}

export const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    description: "View and manage overall system analytics",
    feature: "dashboard",
    icon: "fa-regular fa-layer-group text-xl!",
    href: "/",
    slug: "",
  },
  {
    label: "Employees",
    description: "View and manage employee records and profiles",
    feature: "employees",
    icon: "fa-light fa-address-card text-xl!",
    href: "/employees",
    slug: "employees",
  },
  {
    label: "Timesheet",
    description: "Track and manage employee work hours",
    feature: "timesheet",
    icon: "fa-light fa-calendar text-xl!",
    href: "/timesheet",
    slug: "timesheet",
  },
  {
    label: "Projects",
    description: "Overview and manage active projects",
    feature: "projects",
    icon: "fa-light fa-building text-xl!",
    href: "/projects",
    slug: "projects",
  },
  {
    label: "Reports",
    description: "Access and generate various system reports",
    feature: "reports",
    icon: "fa-light fa-file-chart-column text-xl!",
    href: "/reports",
    slug: "reports",
    subMenuItems: reportOptions?.map((o) => ({
      label: o.title,
      href: o.route,
      slug: o.id,
    })),
  },
  {
    divider: true,
    label: "",
    icon: "",
    slug: "",
    feature: "divider" as Feature,
  },
  {
    label: "Loans",
    description: "Manage employee loan requests and status",
    feature: "loans",
    icon: "fa-light fa-newspaper text-xl!",
    href: "/loans",
    slug: "loans",
  },
  {
    label: "Traffic Violations",
    description: "Track and resolve vehicle traffic violations",
    feature: "trafficViolations",
    icon: "fa-light fa-ticket text-xl!",
    href: "/violations",
    slug: "violations",
  },
  {
    label: "Payroll",
    description: "View and process employee payroll and salaries",
    feature: "payroll",
    icon: "fa-light fa-book-open-reader text-xl!",
    href: "/payroll",
    slug: "payroll",
  },
  {
    label: "Ledger",
    description: "Access comprehensive financial ledger records",
    feature: "ledger",
    icon: "fa-light fa-book-open-lines text-xl!",
    href: "/ledger",
    slug: "ledger",
  },
  {
    label: "Exit Re-entry",
    description: "Manage employee travel and visa documentation",
    feature: "exitReentry",
    icon: "fa-light fa-diamond-turn-right text-xl!",
    href: "/exit-reentry",
    slug: "exit-reentry",
  },
  {
    label: "Users Mgmt.",
    description: "Configure and manage system user access",
    feature: "usersManagement",
    icon: "pi pi-users text-2xl!",
    href: "/users",
    slug: "users",
  },
  {
    label: "Setup",
    description: "Configure system settings and parameters",
    feature: "setup",
    icon: "fa-light fa-gear text-xl!",
    href: "/setup",
    slug: "setup",
    subMenuItems: setupOptions?.map((o) => ({
      label: o.title,
      href: o.route,
      slug: o.id,
    })),
  },
];

// ---------------------------------------------------------------------------
// Role constants
// ---------------------------------------------------------------------------

/**
 * User Role Access Level Definitions:
 *   1. Admin             — Full access to all branches and features
 *   2. Manager           — Full access except user management
 *   3. Branch Manager     — Full access except user management (branch-scoped)
 *   4. Access-Enabled User  — Customisable per-feature privileges (all-branches access)
 *   5. Branch User         — Customisable per-feature privileges (branch-scoped)
 */
export const USER_ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  BRANCH_MANAGER: 3,
  ACCESS_ENABLED: 4,
  BRANCH_USER: 5,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Roles that always have full access (no privilege map needed) */
export const FULL_ACCESS_ROLES: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.BRANCH_MANAGER,
];

export const getSetupItemBySlug = (slug: string) => {
  const setupOpt = setupOptions.find((item) => item.id === slug);
  if (setupOpt) {
    return { label: setupOpt.title, href: setupOpt.route, ...setupOpt };
  }
  return menuItems.find((item) => item.slug === slug);
};
