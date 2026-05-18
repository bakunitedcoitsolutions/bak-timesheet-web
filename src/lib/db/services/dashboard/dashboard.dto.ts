/**
 * Dashboard Service DTOs
 */

export type DashboardStatsDTO = {
  activeProjects: number;
  activeUsers: number;
  activeLoans: number;
  activeViolations: number;
};

export type EmployeeBreakdownDTO = {
  salariedDeductable: number;
  salaried: number;
  labor: number;
  total: number;
};

export type FinancialOverviewDTO = {
  monthlyExpenses: number[];
  totalExpenses: number;
};
