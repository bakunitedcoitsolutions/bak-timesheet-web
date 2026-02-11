/**
 * Timesheet Service
 * Fetches timesheet records for a date, optionally filters employees by payroll section or designation, and merges into page rows.
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetTimesheetPageDataParams,
  GetTimesheetPageDataResponse,
  TimesheetPageRow,
  SaveTimesheetEntriesParams,
  SaveTimesheetEntriesResponse,
  BulkUploadTimesheetData,
  BulkUploadTimesheetResult,
  GetMonthlyTimesheetReportParams,
  GetMonthlyTimesheetReportResponse,
  DailyTimesheetRecord,
  EmployeeMonthlyReport,
} from "./timesheet.dto";

/**
 * Get timesheet page data: employees (optionally filtered by payrollSectionId or designationId) merged with
 * timesheet records for the selected date. One row per employee; timesheet fields
 * filled when a record exists for that employee and date.
 */
export const getTimesheetPageData = async (
  params: GetTimesheetPageDataParams
): Promise<GetTimesheetPageDataResponse> => {
  const { date, payrollSectionId, designationId } = params;

  // Start and end of day (UTC) from the given date
  const startOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const endOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  // 1. Fetch all timesheets for this date
  const timesheets = await prisma.timesheet.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      id: true,
      employeeId: true,
      project1Id: true,
      project1Hours: true,
      project1Overtime: true,
      project2Id: true,
      project2Hours: true,
      project2Overtime: true,
      totalHours: true,
      description: true,
      isLocked: true,
    },
  });

  const timesheetByEmployeeId = new Map(
    timesheets.map((t) => [t.employeeId, t])
  );

  // 2. Build employee filter: optional payrollSectionId and/or designationId
  const employeeWhere: { payrollSectionId?: number; designationId?: number } =
    {};
  if (payrollSectionId != null && payrollSectionId > 0) {
    employeeWhere.payrollSectionId = payrollSectionId;
  }
  if (designationId != null && designationId > 0) {
    employeeWhere.designationId = designationId;
  }

  // 3. Fetch employees (filtered or all)
  const employees = await prisma.employee.findMany({
    where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
    orderBy: [{ employeeCode: "asc" }],
    select: {
      id: true,
      employeeCode: true,
      nameEn: true,
      nameAr: true,
      isFixed: true,
      designationId: true,
      designation: {
        select: { nameEn: true },
      },
    },
  });

  // 4. Build one row per employee (DB keys; merged with timesheet when present)
  const rows: TimesheetPageRow[] = employees.map((emp, index) => {
    const ts = timesheetByEmployeeId.get(emp.id);
    return {
      id: emp.id,
      employeeId: emp.id,
      timesheetId: ts?.id ?? null,
      rowNumber: index + 1,
      employeeCode: emp.employeeCode,
      nameEn: emp.nameEn,
      designationNameEn: emp.designation?.nameEn ?? "",
      isFixed: emp.isFixed,
      isLocked: ts?.isLocked ?? false,
      project1Id: ts?.project1Id ?? null,
      project1Hours: ts?.project1Hours ?? null,
      project1Overtime: ts?.project1Overtime ?? null,
      project2Id: ts?.project2Id ?? null,
      project2Hours: ts?.project2Hours ?? null,
      project2Overtime: ts?.project2Overtime ?? null,
      totalHours: ts?.totalHours ?? null,
      description: ts?.description ?? null,
    };
  });

  return { rows };
};

/**
 * Normalize date to start of day UTC for DB consistency
 */
function startOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
}

/** Max entries per transaction to avoid long-running transactions and timeouts */
const SAVE_BATCH_SIZE = 100;

/**
 * Save multiple timesheet entries (create or update by timesheetId).
 * Processes entries in batches, each batch in its own transaction.
 */
export const saveTimesheetEntries = async (
  params: SaveTimesheetEntriesParams
): Promise<SaveTimesheetEntriesResponse> => {
  const { date, entries } = params;
  const dateNormalized = startOfDayUTC(date);

  let saved = 0;
  for (let i = 0; i < entries.length; i += SAVE_BATCH_SIZE) {
    const batch = entries.slice(i, i + SAVE_BATCH_SIZE);
    await prisma.$transaction(async (tx) => {
      for (const entry of batch) {
        const data = {
          isLocked: true,
          project1Id: entry.project1Id,
          project1Hours: entry.project1Hours,
          project1Overtime: entry.project1Overtime,
          project2Id: entry.project2Id,
          project2Hours: entry.project2Hours,
          project2Overtime: entry.project2Overtime,
          totalHours: entry.totalHours,
          description: entry.description,
        };

        if (entry.timesheetId != null && entry.timesheetId > 0) {
          await tx.timesheet.update({
            where: { id: entry.timesheetId },
            data,
          });
        } else {
          await tx.timesheet.create({
            data: {
              employeeId: entry.employeeId,
              date: dateNormalized,
              ...data,
            },
          });
        }
        saved += 1;
      }
    });
  }

  return { saved };
};

/**
 * Bulk upload timesheet entries from file (CSV/Excel).
 * Resolves employeeCode to employeeId, then upserts timesheet per (employeeId, date).
 */
export const bulkUploadTimesheets = async (
  data: BulkUploadTimesheetData
): Promise<BulkUploadTimesheetResult> => {
  const result: BulkUploadTimesheetResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Pre-fetch all employees by unique codes in one query
  const uniqueCodes = [...new Set(data.entries.map((e) => e.employeeCode))];
  const employees = await prisma.employee.findMany({
    where: { employeeCode: { in: uniqueCodes } },
    select: { id: true, employeeCode: true },
  });
  const employeeByCode = new Map(employees.map((e) => [e.employeeCode, e]));

  for (let i = 0; i < data.entries.length; i++) {
    const row = data.entries[i];
    const rowNumber = i + 1;

    try {
      const dateNormalized = startOfDayUTC(
        typeof row.date === "string" ? new Date(row.date) : row.date
      );

      const employee = employeeByCode.get(row.employeeCode);

      if (!employee) {
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: row,
          error: `Employee with code ${row.employeeCode} not found`,
        });
        continue;
      }

      const existing = await prisma.timesheet.findFirst({
        where: {
          employeeId: employee.id,
          date: {
            gte: dateNormalized,
            lt: new Date(dateNormalized.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: { id: true },
      });

      if (existing) {
        continue;
      }

      const p1H = row.project1Hours ?? 0;
      const p1OT = row.project1Overtime ?? 0;
      const p2H = row.project2Hours ?? 0;
      const p2OT = row.project2Overtime ?? 0;
      const totalHours =
        (typeof p1H === "number" ? p1H : 0) +
        (typeof p1OT === "number" ? p1OT : 0) +
        (typeof p2H === "number" ? p2H : 0) +
        (typeof p2OT === "number" ? p2OT : 0);

      const payload = {
        isLocked: true,
        project1Id: row.project1Id ?? null,
        project1Hours: p1H,
        project1Overtime: p1OT,
        project2Id: row.project2Id ?? null,
        project2Hours: p2H,
        project2Overtime: p2OT,
        totalHours: totalHours > 0 ? totalHours : null,
        description: row.description ?? null,
      };

      await prisma.timesheet.create({
        data: {
          employeeId: employee.id,
          date: dateNormalized,
          ...payload,
        },
      });

      result.success++;
    } catch (error: any) {
      result.failed++;
      result.errors.push({
        row: rowNumber,
        data: row,
        error: error?.message ?? "Unknown error",
      });
    }
  }

  return result;
};

/**
 * Get monthly timesheet report data for one or all employees.
 * Aggregates daily records for the specified month and year.
 */
export const getMonthlyTimesheetReportData = async (
  params: GetMonthlyTimesheetReportParams
): Promise<GetMonthlyTimesheetReportResponse> => {
  const {
    month,
    year,
    employeeId,
    employeeCodes,
    projectId,
    designationId,
    payrollSectionId,
    showAbsents,
    showFixedSalary,
  } = params;

  // Calculate month boundaries (UTC)
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = endDate.getUTCDate();

  // 1. Fetch Employees
  const employees = await prisma.employee.findMany({
    where: {
      ...(employeeId ? { id: employeeId } : {}),
      ...(employeeCodes && employeeCodes.length > 0
        ? {
            employeeCode: {
              in: employeeCodes
                .map((code) => Number(code))
                .filter((n) => !isNaN(n)),
            },
          }
        : {}),
      ...(designationId ? { designationId } : {}),
      ...(payrollSectionId ? { payrollSectionId } : {}),
      ...(showFixedSalary ? { isFixed: true } : {}),
    },
    select: {
      id: true,
      employeeCode: true,
      nameEn: true,
      nameAr: true,
      idCardNo: true,
      isFixed: true,
      designation: {
        select: { nameEn: true },
      },
      payrollSection: {
        select: { nameEn: true },
      },
    },
    orderBy: { employeeCode: "asc" },
  });

  // 2. Fetch Timesheets for the month
  const timesheets = await prisma.timesheet.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      ...(employeeId ? { employeeId } : {}),
      ...(projectId
        ? {
            OR: [{ project1Id: projectId }, { project2Id: projectId }],
          }
        : {}),
    },
    include: {
      project1: { select: { nameEn: true } },
      project2: { select: { nameEn: true } },
    },
  });

  // 3. Map timesheets by employee and date
  const timesheetMap = new Map<string, (typeof timesheets)[0]>();
  timesheets.forEach((ts) => {
    const key = `${ts.employeeId}-${ts.date.getUTCDate()}`;
    timesheetMap.set(key, ts);
  });

  // 4. Generate report per employee
  const reports: EmployeeMonthlyReport[] = employees.map((emp: any) => {
    const dailyRecords: DailyTimesheetRecord[] = [];
    let totalHours = 0;
    let totalOT = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const ts = timesheetMap.get(`${emp.id}-${day}`);
      const dateString = new Date(Date.UTC(year, month - 1, day));
      const isFriday = dateString.getUTCDay() === 5;

      const record: DailyTimesheetRecord = {
        date: `${day.toString().padStart(2, "0")}-${dateString.toLocaleString("en-US", { month: "short" })}`,
        day,
        project1Id: ts?.project1Id ?? null,
        project1Name: ts?.project1?.nameEn ?? null,
        project1Hours: ts?.project1Hours ?? 0,
        project1Overtime: ts?.project1Overtime ?? 0,
        project2Id: ts?.project2Id ?? null,
        project2Name: ts?.project2?.nameEn ?? null,
        project2Hours: ts?.project2Hours ?? 0,
        project2Overtime: ts?.project2Overtime ?? 0,
        totalHours: ts?.totalHours ?? 0,
        description: ts?.description ?? null,
        isFriday,
        remarks: isFriday
          ? "Friday"
          : emp.isFixed && day === daysInMonth
            ? "Fixed Salary"
            : null,
      };

      // Always count all hours for totals, regardless of project filtering
      totalHours += record.project1Hours + record.project2Hours;
      totalOT += record.project1Overtime + record.project2Overtime;

      dailyRecords.push(record);
    }

    // Optional: Filter out employees with no hours if showAbsents is false
    const grandTotal = totalHours + totalOT;

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      nameEn: emp.nameEn,
      nameAr: emp.nameAr,
      designationName: emp.designation?.nameEn ?? null,
      idCardNo: emp.idCardNo,
      isFixed: emp.isFixed,
      sectionName: emp.payrollSection?.nameEn ?? "Unassigned",
      dailyRecords,
      totalHours,
      totalOT,
      grandTotal,
    };
  });

  // Filter out reports with zero hours if showAbsents is false
  const filteredReports = showAbsents
    ? reports
    : reports.filter((r) => r.grandTotal > 0);

  return { reports: filteredReports };
};
