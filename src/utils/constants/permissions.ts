import { UserPrivileges, FeaturePermissions } from "@/utils/dummy";

export interface FeatureConfig {
  key: keyof UserPrivileges;
  label: string;
  permissions: {
    key: keyof FeaturePermissions;
    label: string;
  }[];
}

export const FEATURES_CONFIG: FeatureConfig[] = [
  {
    key: "employees",
    label: "Employees",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Employee" },
      { key: "edit", label: "Edit Employee" },
      { key: "view", label: "View Employee" },
    ],
  },
  {
    key: "timesheet",
    label: "Timesheet",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Timesheet" },
      { key: "edit", label: "Edit Timesheet" },
      { key: "view", label: "View Timesheet" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Project" },
      { key: "edit", label: "Edit Project" },
      { key: "view", label: "View Project" },
    ],
  },
  {
    key: "loans",
    label: "Loans",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Loan" },
      { key: "edit", label: "Edit Loan" },
      { key: "view", label: "View Loan" },
    ],
  },
  {
    key: "trafficChallans",
    label: "Traffic Challans",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Challan" },
      { key: "edit", label: "Edit Challan" },
      { key: "view", label: "View Challan" },
    ],
  },
  {
    key: "exitReentry",
    label: "Exit Re-entry",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Exit Re-entry" },
      { key: "edit", label: "Edit Exit Re-entry" },
      { key: "view", label: "View Exit Re-entry" },
    ],
  },
  {
    key: "payroll",
    label: "Payroll",
    permissions: [
      { key: "full", label: "Full Access" },
      { key: "add", label: "Add Payroll" },
      { key: "edit", label: "Edit Payroll" },
      { key: "view", label: "View Payroll" },
    ],
  },
  {
    key: "ledger",
    label: "Ledger",
    permissions: [{ key: "full", label: "Full Access" }],
  },
  {
    key: "setup",
    label: "Setup",
    permissions: [{ key: "full", label: "Full Access" }],
  },
  {
    key: "reports",
    label: "Reports",
    permissions: [{ key: "full", label: "Full Access" }],
  },
];

export const createEmptyPrivileges = (): UserPrivileges => {
  return {
    employees: { full: false, add: false, edit: false, view: false },
    timesheet: { full: false, add: false, edit: false, view: false },
    projects: { full: false, add: false, edit: false, view: false },
    loans: { full: false, add: false, edit: false, view: false },
    trafficChallans: {
      full: false,
      add: false,
      edit: false,
      view: false,
    },
    exitReentry: { full: false, add: false, edit: false, view: false },
    payroll: { full: false, add: false, edit: false, view: false },
    ledger: { full: false, add: false, edit: false, view: false },
    usersManagement: {
      full: false,
      add: false,
      edit: false,
      view: false,
    },
    reports: { full: false, add: false, edit: false, view: false },
    setup: { full: false, add: false, edit: false, view: false },
  };
};
