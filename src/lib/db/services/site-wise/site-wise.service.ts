import dayjs from "@/lib/dayjs";
import { prisma } from "@/lib/db/prisma";
import { GetSiteWiseReportInput, SiteWiseReportRow } from "./site-wise.schemas";

export const getSiteWiseReport = async (
  input: GetSiteWiseReportInput,
  branchId?: number | null
) => {
  const { month, year, employeeCodes, projectIds, summarize } = input;

  const formattedMonth = dayjs()
    .year(year)
    .month(month - 1)
    .format("MMMM, YYYY");

  // 1. Find if payroll exists for this period
  const payrollSummary = await prisma.payrollSummary.findFirst({
    where: {
      payrollMonth: month,
      payrollYear: year,
    },
  });

  if (!payrollSummary) {
    return {
      success: false,
      message: `No payroll found for ${formattedMonth}`,
      data: [],
    };
  }

  // 2. Fetch Payroll Details for the period
  const payrollDetails = await prisma.payrollDetails.findMany({
    where: {
      payrollMonth: month,
      payrollYear: year,
      ...(branchId ? { branchId } : {}),
      ...(employeeCodes && employeeCodes.length > 0
        ? {
            employee: {
              employeeCode: { in: employeeCodes },
            },
          }
        : {}),
    },
    include: {
      employee: {
        include: {
          designation: true,
        },
      },
    },
  });

  if (payrollDetails.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const employeeIds = payrollDetails.map((pd) => pd.employeeId);
  const employeeMap = new Map(payrollDetails.map((pd) => [pd.employeeId, pd]));

  // 3. Fetch Timesheets for these employees in this month
  // We need to be careful with date range
  const startDate = dayjs()
    .year(year)
    .month(month - 1)
    .startOf("month")
    .toDate();
  const endDate = dayjs()
    .year(year)
    .month(month - 1)
    .endOf("month")
    .toDate();

  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(projectIds && projectIds.length > 0
        ? {
            OR: [
              { project1Id: { in: projectIds } },
              { project2Id: { in: projectIds } },
            ],
          }
        : {}),
    },
    include: {
      project1: true,
      project2: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // 4. Transform into SiteWiseReportRow
  const rawRows: SiteWiseReportRow[] = [];

  const employeeBreakfastAllowanceMap = new Map<number, number>(
    payrollDetails.map((pd) => [
      pd.employeeId,
      Number(pd.breakfastAllowance) || 0,
    ])
  );

  const employeeOtherAllowanceMap = new Map<number, number>(
    payrollDetails.map((pd) => [pd.employeeId, Number(pd.otherAllowances) || 0])
  );

  // Pre-calculate total hours per employee for allowance distribution
  const empTotalHoursMap = new Map<number, number>();
  timesheets.forEach((ts) => {
    const total = (ts.project1Hours || 0) + (ts.project2Hours || 0);
    empTotalHoursMap.set(
      ts.employeeId,
      (empTotalHoursMap.get(ts.employeeId) || 0) + total
    );
  });

  timesheets.forEach((ts) => {
    const pd = employeeMap.get(ts.employeeId);
    if (!pd) return;

    const designationHours = (pd.employee as any).designation?.hoursPerDay || 0;
    const hourlyRate = Number(pd.hourlyRate);

    const totalEmpHours = empTotalHoursMap.get(ts.employeeId) || 0;
    const totalOtherAllowanceAmount =
      employeeOtherAllowanceMap.get(ts.employeeId) || 0;
    const allowancePerHour =
      totalEmpHours > 0 ? totalOtherAllowanceAmount / totalEmpHours : 0;

    // Handle Project 1
    if (ts.project1Id && ts.project1) {
      if (!projectIds || projectIds.includes(ts.project1Id)) {
        const hours = ts.project1Hours || 0;
        const ot = ts.project1Overtime || 0;

        let project1BreakfastAllowance = 0;
        let remainingBreakfastAllowance =
          employeeBreakfastAllowanceMap.get(ts.employeeId) || 0;

        if (hours === designationHours && remainingBreakfastAllowance >= 10) {
          project1BreakfastAllowance = 10;
          remainingBreakfastAllowance -= 10;
          employeeBreakfastAllowanceMap.set(
            ts.employeeId,
            remainingBreakfastAllowance
          );
        }

        const project1OtherAllowance = hours * allowancePerHour;
        const project1TotalAllowance =
          project1BreakfastAllowance + project1OtherAllowance;
        const baseSalary = (hours + ot) * hourlyRate;

        rawRows.push({
          id: `${ts.id}-p1`,
          month: formattedMonth,
          projectId: ts.project1Id,
          projectName: ts.project1.nameEn,
          projectHours: hours,
          projectOT: ot,
          breakfastAllowance: project1BreakfastAllowance,
          otherAllowance: project1OtherAllowance,
          totalAllowance: project1TotalAllowance,
          baseSalary: baseSalary,
          empCode: pd.employee.employeeCode,
          employeeName: pd.employee.nameEn,
          hourlyRate: hourlyRate,
          totalSalary: baseSalary + project1TotalAllowance,
        });
      }
    }

    // Handle Project 2
    if (ts.project2Id && ts.project2) {
      if (!projectIds || projectIds.includes(ts.project2Id)) {
        const hours = ts.project2Hours || 0;
        const ot = ts.project2Overtime || 0;

        const project2OtherAllowance = hours * allowancePerHour;
        const project2TotalAllowance = project2OtherAllowance;
        const baseSalary = (hours + ot) * hourlyRate;

        rawRows.push({
          id: `${ts.id}-p2`,
          month: formattedMonth,
          projectId: ts.project2Id,
          projectName: ts.project2.nameEn,
          projectHours: hours,
          projectOT: ot,
          breakfastAllowance: 0,
          otherAllowance: project2OtherAllowance,
          totalAllowance: project2TotalAllowance,
          baseSalary: baseSalary,
          empCode: pd.employee.employeeCode,
          employeeName: pd.employee.nameEn,
          hourlyRate: hourlyRate,
          totalSalary: baseSalary + project2TotalAllowance,
        });
      }
    }
  });

  if (summarize) {
    // Group by Project
    const summaryMap = new Map<number, SiteWiseReportRow>();

    rawRows.forEach((row) => {
      const existing = summaryMap.get(row.projectId);
      if (existing) {
        existing.projectHours += row.projectHours;
        existing.projectOT += row.projectOT;
        existing.breakfastAllowance += row.breakfastAllowance;
        existing.otherAllowance += row.otherAllowance;
        existing.totalAllowance += row.totalAllowance;
        existing.baseSalary += row.baseSalary;
        existing.totalSalary += row.totalSalary;
      } else {
        summaryMap.set(row.projectId, {
          id: row.projectId,
          month: row.month,
          projectId: row.projectId,
          projectName: row.projectName,
          projectHours: row.projectHours,
          projectOT: row.projectOT,
          breakfastAllowance: row.breakfastAllowance,
          otherAllowance: row.otherAllowance,
          totalAllowance: row.totalAllowance,
          baseSalary: row.baseSalary,
          totalSalary: row.totalSalary,
          // Exclude employee specific info in summary
        });
      }
    });

    return {
      success: true,
      data: Array.from(summaryMap.values()),
    };
  }

  return {
    success: true,
    data: rawRows,
  };
};
