import { prisma } from "@/lib/db/prisma";
import { GetSiteWiseReportInput, SiteWiseReportRow } from "./site-wise.schemas";

export const getSiteWiseReport = async (input: GetSiteWiseReportInput) => {
  const { month, year, employeeCodes, projectIds, summarize } = input;

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month - 1];
  const formattedMonth = `${monthName}, ${year}`;

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
      ...(employeeCodes && employeeCodes.length > 0
        ? {
            employee: {
              employeeCode: { in: employeeCodes },
            },
          }
        : {}),
    },
    include: {
      employee: true,
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
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

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
  });

  // 4. Transform into SiteWiseReportRow
  const rawRows: SiteWiseReportRow[] = [];

  timesheets.forEach((ts) => {
    const pd = employeeMap.get(ts.employeeId);
    if (!pd) return;

    const hourlyRate = Number(pd.hourlyRate);

    // Handle Project 1
    if (ts.project1Id && ts.project1) {
      if (!projectIds || projectIds.includes(ts.project1Id)) {
        const hours = ts.project1Hours || 0;
        const ot = ts.project1Overtime || 0;
        rawRows.push({
          id: `${ts.id}-p1`,
          month: formattedMonth,
          projectId: ts.project1Id,
          projectName: ts.project1.nameEn,
          projectHours: hours,
          projectOT: ot,
          empCode: pd.employee.employeeCode,
          employeeName: pd.employee.nameEn,
          hourlyRate: hourlyRate,
          totalSalary: (hours + ot) * hourlyRate,
        });
      }
    }

    // Handle Project 2
    if (ts.project2Id && ts.project2) {
      if (!projectIds || projectIds.includes(ts.project2Id)) {
        const hours = ts.project2Hours || 0;
        const ot = ts.project2Overtime || 0;
        rawRows.push({
          id: `${ts.id}-p2`,
          month: formattedMonth,
          projectId: ts.project2Id,
          projectName: ts.project2.nameEn,
          projectHours: hours,
          projectOT: ot,
          empCode: pd.employee.employeeCode,
          employeeName: pd.employee.nameEn,
          hourlyRate: hourlyRate,
          totalSalary: (hours + ot) * hourlyRate,
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
        existing.totalSalary += row.totalSalary;
      } else {
        summaryMap.set(row.projectId, {
          id: row.projectId,
          month: row.month,
          projectId: row.projectId,
          projectName: row.projectName,
          projectHours: row.projectHours,
          projectOT: row.projectOT,
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
