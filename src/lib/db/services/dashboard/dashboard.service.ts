/**
 * Dashboard Service
 * Contains all database operations for the dashboard
 */

import { prisma } from "../../prisma";
import { DashboardStatsDTO, EmployeeBreakdownDTO } from "./dashboard.dto";

export const getDashboardStats = async (
  branchId?: number
): Promise<DashboardStatsDTO> => {
  const branchFilter = branchId ? { branchId } : {};

  const [activeProjects, activeUsers, loans, challans, postedPayrolls] =
    await Promise.all([
      prisma.project.count({
        where: {
          isActive: true,
          ...branchFilter,
        },
      }),
      prisma.user.count({
        where: {
          isActive: true,
          ...branchFilter,
        },
      }),
      prisma.loan.findMany({
        where: {
          ...(branchId && { employee: { branchId } }),
          type: "LOAN",
        },
        include: {
          employee: {
            select: { branchId: true },
          },
        },
        orderBy: {
          date: "asc",
        },
      }),
      prisma.trafficChallan.findMany({
        where: {
          ...(branchId && { employee: { branchId } }),
          type: "CHALLAN",
        },
        include: {
          employee: {
            select: { branchId: true },
          },
        },
        orderBy: {
          date: "asc",
        },
      }),
      prisma.payrollSummary.findMany({
        where: {
          payrollStatusId: 3, // Posted
        },
        select: {
          payrollMonth: true,
          payrollYear: true,
          branchId: true,
        },
      }),
    ]);

  // Create a lookup set for posted payrolls
  const postedSet = new Set(
    postedPayrolls.map((p) => `${p.payrollMonth}-${p.payrollYear}`)
  );

  // Filter loans: keep only if the payroll for that month/year/branch is not posted
  const activeLoansList = loans.filter((loan) => {
    const loanMonth = loan.date.getMonth() + 1; // 1-12
    const loanYear = loan.date.getFullYear();

    const key = `${loanMonth}-${loanYear}`;
    const isPosted = postedSet.has(key);
    return !isPosted;
  });

  // Filter challans: keep only if the payroll for that month/year/branch is not posted
  const activeChallansList = challans.filter((challan) => {
    const challanMonth = challan.date.getMonth() + 1;
    const challanYear = challan.date.getFullYear();

    const key = `${challanMonth}-${challanYear}`;
    return !postedSet.has(key);
  });

  return {
    activeUsers,
    activeProjects,
    activeLoans: activeLoansList.length,
    activeViolations: activeChallansList.length,
  };
};

export const getEmployeeBreakdown = async (
  branchId?: number
): Promise<EmployeeBreakdownDTO> => {
  const branchFilter = branchId ? { branchId } : {};

  // Note: Assuming Labor means isFixed: false
  // (isFixed: true & isDeductable: true is Salaried Deductable)
  const [salariedDeductable, salaried, labor] = await Promise.all([
    prisma.employee.count({
      where: {
        statusId: 1,
        isFixed: true,
        isDeductable: true,
        ...branchFilter,
      },
    }),
    prisma.employee.count({
      where: {
        statusId: 1,
        isFixed: true,
        isDeductable: false,
        ...branchFilter,
      },
    }),
    prisma.employee.count({
      where: {
        statusId: 1,
        isFixed: false,
        ...branchFilter,
      },
    }),
  ]);

  return {
    labor,
    salaried,
    salariedDeductable,
    total: salariedDeductable + salaried + labor,
  };
};
