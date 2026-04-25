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
      employee: {
        payrollSectionId: { in: [1, 2, 7, 16, 8, 9, 12, 13, 10, 19, 20, 11] },
        ...(employeeCodes && employeeCodes.length > 0
          ? { employeeCode: { in: employeeCodes } }
          : {}),
      },
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

  // 4. Aggregate Timesheet Data and Collect Project Info
  const empProjectAggregates = new Map<
    number,
    Map<number, { hours: number; ot: number; breakfast: number }>
  >();
  const empTotalTimesheet = new Map<number, { hours: number; ot: number }>();
  const projectInfoMap = new Map<number, { id: number; nameEn: string }>();

  // Track remaining breakfast allowance per employee for daily calculation
  const empRemainingBreakfast = new Map<number, number>(
    payrollDetails.map((pd) => [pd.employeeId, pd.breakfastAllowance || 0])
  );

  timesheets.forEach((ts) => {
    const empId = ts.employeeId;
    const pd = employeeMap.get(empId);
    if (!pd) return;

    if (!empProjectAggregates.has(empId)) {
      empProjectAggregates.set(empId, new Map());
    }
    const projectMap = empProjectAggregates.get(empId)!;

    const designationHours = (pd.employee as any).designation?.hoursPerDay || 0;

    // Handle Project 1
    if (ts.project1Id && ts.project1) {
      if (!projectIds || projectIds.includes(ts.project1Id)) {
        projectInfoMap.set(ts.project1Id, {
          id: ts.project1Id,
          nameEn: ts.project1.nameEn,
        });

        const current = projectMap.get(ts.project1Id) || {
          hours: 0,
          ot: 0,
          breakfast: 0,
        };
        const hours = ts.project1Hours || 0;
        const ot = ts.project1Overtime || 0;

        let breakfast = 0;
        let remaining = empRemainingBreakfast.get(empId) || 0;
        if (hours === designationHours && remaining >= 10) {
          breakfast = 10;
          remaining -= 10;
          empRemainingBreakfast.set(empId, remaining);
        }

        projectMap.set(ts.project1Id, {
          hours: current.hours + hours,
          ot: current.ot + ot,
          breakfast: current.breakfast + breakfast,
        });
      }
    }

    // Handle Project 2
    if (ts.project2Id && ts.project2) {
      if (!projectIds || projectIds.includes(ts.project2Id)) {
        projectInfoMap.set(ts.project2Id, {
          id: ts.project2Id,
          nameEn: ts.project2.nameEn,
        });

        const current = projectMap.get(ts.project2Id) || {
          hours: 0,
          ot: 0,
          breakfast: 0,
        };
        const hours = ts.project2Hours || 0;
        const ot = ts.project2Overtime || 0;

        // Note: Breakfast usually only on Project 1 as per current logic
        projectMap.set(ts.project2Id, {
          hours: current.hours + hours,
          ot: current.ot + ot,
          breakfast: current.breakfast,
        });
      }
    }

    // Total employee timesheet totals for proportions
    const totalTs = empTotalTimesheet.get(empId) || { hours: 0, ot: 0 };
    empTotalTimesheet.set(empId, {
      hours: totalTs.hours + (ts.project1Hours || 0) + (ts.project2Hours || 0),
      ot: totalTs.ot + (ts.project1Overtime || 0) + (ts.project2Overtime || 0),
    });
  });

  // 5. Build Aggregated Rows by matching with Payroll
  const rawRows: SiteWiseReportRow[] = [];

  payrollDetails.forEach((pd) => {
    const empId = pd.employeeId;
    const projectMap = empProjectAggregates.get(empId);
    if (!projectMap) return;

    const totalTs = empTotalTimesheet.get(empId)!;
    const payrollTotalHours = Number(pd.totalHours) || 0;
    const payrollOT = Number(pd.overTime) || 0;
    const payrollNormalHours = Math.max(0, payrollTotalHours - payrollOT);
    const hourlyRate = Number(pd.hourlyRate) || 0;

    // Source of truth for totals from PayrollDetails to match report exactly
    const payrollSalary = Number(pd.salary) || 0;
    const payrollTotalAllowances = Number(pd.totalAllowances) || 0;
    const payrollOvertimeAllowance = Number(pd.overtimeAllowance) || 0;
    const payrollTripAllowance = Number(pd.tripAllowance) || 0;
    const payrollOtherAllowances = Number(pd.otherAllowances) || 0;

    // Formula matching mappers.ts for Base Salary
    const employeeBaseSalary = payrollSalary - payrollTotalAllowances;

    projectMap.forEach((agg, projectId) => {
      const projectInfo = projectInfoMap.get(projectId)!;

      // Ratios for distribution
      const totalTsHours = totalTs.hours + totalTs.ot;
      const projectTsHours = agg.hours + agg.ot;

      const baseRatio = totalTsHours > 0 ? projectTsHours / totalTsHours : 0;
      const hourRatio = totalTs.hours > 0 ? agg.hours / totalTs.hours : 0;
      const otRatio = totalTs.ot > 0 ? agg.ot / totalTs.ot : 0;

      const distributedHours = payrollNormalHours * hourRatio;
      const distributedOT = payrollOT * otRatio;

      // Distribute Base Salary using total hours ratio
      const distributedBaseSalary = employeeBaseSalary * baseRatio;

      // Distribute non-breakfast allowances
      const distributedOtherAllowance = payrollOtherAllowances * hourRatio;

      const totalAllowance = agg.breakfast + distributedOtherAllowance;

      rawRows.push({
        id: `${empId}-${projectId}`,
        month: formattedMonth,
        projectId: projectId,
        projectName: projectInfo.nameEn,
        projectHours: distributedHours,
        projectOT: distributedOT,
        breakfastAllowance: agg.breakfast,
        otherAllowance: distributedOtherAllowance,
        totalAllowance: totalAllowance,
        baseSalary: distributedBaseSalary,
        empCode: pd.employee.employeeCode,
        employeeName: pd.employee.nameEn,
        hourlyRate: hourlyRate,
        totalSalary: distributedBaseSalary + totalAllowance,
      });
    });
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
