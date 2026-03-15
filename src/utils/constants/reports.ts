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
    id: "salary-slips",
    title: "Salary Slips",
    description: "Generate and view employee salary slips",
    icon: "fa-light fa-receipt",
    route: "/reports/salary-slips",
    filterOptions: [{ key: "enableAllFilters", label: "Enable all filters" }],
  },
  {
    id: "daily-timesheet",
    title: "Daily Timesheet",
    description: "View and manage daily timesheet records",
    icon: "fa-light fa-calendar-circle-plus",
    route: "/reports/daily-timesheet",
    filterOptions: [{ key: "enableAllFilters", label: "Enable all filters" }],
  },
  {
    id: "monthly-timesheet",
    title: "Monthly Timesheet",
    description: "View and manage monthly timesheet records",
    icon: "fa-light fa-calendar-check",
    route: "/reports/monthly-timesheet",
    filterOptions: [{ key: "enableAllFilters", label: "Enable all filters" }],
  },
  {
    id: "employees",
    title: "Employees Report",
    description: "View comprehensive employee reports",
    icon: "fa-light fa-user-group",
    route: "/reports/employees",
  },
  {
    id: "employee-cards",
    title: "Employee Cards",
    description: "View and manage employee card information",
    icon: "fa-light fa-address-card",
    route: "/reports/employee-cards",
    filterOptions: [{ key: "enableAllFilters", label: "Enable all filters" }],
  },
];
