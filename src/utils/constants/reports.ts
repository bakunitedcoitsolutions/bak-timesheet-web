export interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  filterOptions?: {
    key: string;
    label: string;
  }[];
}

export const REPORT_OPTIONS: ReportOption[] = [
  {
    id: "site-wise",
    title: "Site Wise Report",
    description: "View reports organized by site location",
    icon: "fa-light fa-file-invoice",
    route: "/reports/site-wise",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "payroll",
    title: "Payroll Report",
    description: "View payroll reports and summaries",
    icon: "fa-light fa-file-contract",
    route: "/reports/payroll",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "salary-slips",
    title: "Salary Slips",
    description: "Generate and view employee salary slips",
    icon: "fa-light fa-receipt",
    route: "/reports/salary-slips",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "daily-timesheet",
    title: "Daily Timesheet",
    description: "View and manage daily timesheet records",
    icon: "fa-light fa-calendar-circle-plus",
    route: "/reports/daily-timesheet",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "monthly-timesheet",
    title: "Monthly Timesheet",
    description: "View and manage monthly timesheet records",
    icon: "fa-light fa-calendar-check",
    route: "/reports/monthly-timesheet",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "master-payroll",
    title: "Master Payroll",
    description: "View master payroll data and records",
    icon: "fa-light fa-file-chart-column",
    route: "/reports/master-payroll",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "employees",
    title: "Employees Report",
    description: "View comprehensive employee reports",
    icon: "fa-light fa-user-group",
    route: "/reports/employees",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "employee-leave-statement",
    title: "Employee Leave Statement",
    description: "View employee leave records and statements",
    icon: "fa-light fa-file-chart-pie",
    route: "/reports/employee-leave-statement",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
  {
    id: "employee-cards",
    title: "Employee Cards",
    description: "View and manage employee card information",
    icon: "fa-light fa-address-card",
    route: "/reports/employee-cards",
    filterOptions: [
      { key: "enableAllFilters", label: "Enable all filters" },
    ],
  },
];
