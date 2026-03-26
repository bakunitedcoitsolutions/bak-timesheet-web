/**
 * Timesheet Service
 * Fetches timesheet records for a date, optionally filters employees by payroll section or designation, and merges into page rows.
 */

import dayjs from "@/lib/dayjs";

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
 * Normalize date to start of day UTC for DB consistency.
 * Forces the date to be UTC midnight of the same calendar day,
 * preventing timezone shifts (e.g. +5 hours becoming previous day in UTC).
 */
function startOfDayUTC(date: Date): Date {
  return dayjs.utc(dayjs(date).format("YYYY-MM-DD")).startOf("day").toDate();
}

/**
 * Build start and end of day in UTC from a given Date.
 */
function getDayRange(date: Date): { startOfDay: Date; endOfDay: Date } {
  const d = dayjs.utc(dayjs(date).format("YYYY-MM-DD"));
  return {
    startOfDay: d.startOf("day").toDate(),
    endOfDay: d.endOf("day").toDate(),
  };
}

type TimesheetRow = {
  project1Id?: number | null;
  project1Hours?: number | null;
  project1Overtime?: number | null;
  project2Id?: number | null;
  project2Hours?: number | null;
  project2Overtime?: number | null;
  description?: string | null;
};

/**
 * Build a Prisma-ready timesheet data payload from a row of hours data.
 * Calculates totalHours from the four hour fields and clamps to null when zero.
 */
function buildTimesheetPayload(row: TimesheetRow) {
  const p1H = row.project1Hours ?? 0;
  const p1OT = row.project1Overtime ?? 0;
  const p2H = row.project2Hours ?? 0;
  const p2OT = row.project2Overtime ?? 0;
  const totalHours =
    (typeof p1H === "number" ? p1H : 0) +
    (typeof p1OT === "number" ? p1OT : 0) +
    (typeof p2H === "number" ? p2H : 0) +
    (typeof p2OT === "number" ? p2OT : 0);

  return {
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
}

/**
 * Get timesheet page data: employees (optionally filtered by payrollSectionId or designationId) merged with
 * timesheet records for the selected date. One row per employee; timesheet fields
 * filled when a record exists for that employee and date.
 */
export const getTimesheetPageData = async (
  params: GetTimesheetPageDataParams
): Promise<GetTimesheetPageDataResponse> => {
  const {
    date,
    payrollSectionId,
    designationId,
    page = 1,
    limit = 50,
    search,
  } = params;

  const { startOfDay, endOfDay } = getDayRange(date);

  // Find any employee IDs that have a timesheet on this date (regardless of status)
  const timesheetsOnDate = await prisma.timesheet.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    select: { employeeId: true },
  });
  const employeeIdsWithAttendance = timesheetsOnDate.map((t) => t.employeeId);

  // Build employee filter:
  // - Active employees (statusId: 1), OR
  // - Any employee (any status) who has an attendance record on this date
  const baseStatusFilter: any = {
    OR: [
      { statusId: 1 },
      ...(employeeIdsWithAttendance.length > 0
        ? [{ id: { in: employeeIdsWithAttendance } }]
        : []),
    ],
  };

  const employeeWhere: any = { ...baseStatusFilter };

  if (search) {
    const searchNumber = Number(search);
    // Combine search with status/attendance filter using AND
    employeeWhere.AND = [
      baseStatusFilter,
      {
        OR: [
          { nameEn: { contains: search, mode: "insensitive" } },
          { nameAr: { contains: search, mode: "insensitive" } },
          ...(!isNaN(searchNumber) ? [{ employeeCode: searchNumber }] : []),
        ],
      },
    ];
    // Remove the top-level OR since it's now inside AND
    delete employeeWhere.OR;
  } else {
    // Only apply section/designation filters if no search
    if (payrollSectionId != null && payrollSectionId > 0) {
      employeeWhere.payrollSectionId = payrollSectionId;
    }
    if (designationId != null && designationId > 0) {
      employeeWhere.designationId = designationId;
    }
  }

  // Count total employees for pagination
  const totalEmployees = await prisma.employee.count({ where: employeeWhere });

  // Fetch employees (filtered or all) with pagination
  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    orderBy: [{ employeeCode: "asc" }],
    skip: (page - 1) * limit,
    take: limit,
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

  // Fetch timesheets only for the paginated employees
  const employeeIds = employees.map((e) => e.id);
  const timesheets = await prisma.timesheet.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      employeeId: { in: employeeIds },
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

  // Build one row per employee (merged with timesheet when present)
  const rows: TimesheetPageRow[] = employees.map((emp, index) => {
    const ts = timesheetByEmployeeId.get(emp.id);
    const distinctRowNumber = (page - 1) * limit + index + 1;

    return {
      id: emp.id,
      employeeId: emp.id,
      timesheetId: ts?.id ?? null,
      rowNumber: distinctRowNumber,
      employeeCode: emp.employeeCode,
      nameEn: emp.nameEn,
      designationNameEn: emp.designation?.nameEn ?? "",
      isFixed: emp.isFixed,
      isLocked: false,
      // isLocked: ts?.isLocked ?? false,
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

  return {
    rows,
    pagination: {
      page,
      limit,
      total: totalEmployees,
      totalPages: Math.ceil(totalEmployees / limit),
    },
  };
};

/** Max entries per transaction to avoid long-running transactions and timeouts */
const SAVE_BATCH_SIZE = 50;

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
    await prisma.$transaction(
      async (tx) => {
        for (const entry of batch) {
          const data = {
            isLocked: true,
            isManual: true,
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
      },
      {
        timeout: 20000, // Increase timeout to 20s to handle slower batches
      }
    );
  }

  return { saved };
};

/**
 * Helper to retry DB operations on connection failure.
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const isConnectionError =
      error?.message?.includes("Connection terminated") ||
      error?.message?.includes("connection timeout") ||
      error?.code === "P2024";

    if (isConnectionError && retries > 0) {
      console.warn(
        `Database connection error. Retrying... (${retries} attempts left). Error: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Bulk upload timesheet entries from file (CSV/Excel).
 * Resolves employeeCode to employeeId, then upserts timesheet per (employeeId, date).
 */
export const bulkUploadTimesheets = async (
  data: BulkUploadTimesheetData
): Promise<BulkUploadTimesheetResult> => {
  console.log("Service: bulkUploadTimesheets started", {
    entriesCount: data.entries.length,
    uniqueEmployeeCodes: new Set(data.entries.map((e) => e.employeeCode)).size,
  });
  const result: BulkUploadTimesheetResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    details: [],
    errors: [],
  };

  // Pre-fetch all employees by unique codes in one query
  const uniqueCodes = [...new Set(data.entries.map((e) => e.employeeCode))];

  const employees = await withRetry(() =>
    prisma.employee.findMany({
      where: { employeeCode: { in: uniqueCodes } },
      select: { id: true, employeeCode: true },
    })
  );

  console.log("Service: Employees fetched", {
    found: employees.length,
    uniqueCodes: uniqueCodes.length,
  });
  const employeeByCode = new Map(employees.map((e) => [e.employeeCode, e]));

  // Pre-fetch all projects by unique IDs in one query
  const uniqueProjectIds = [
    ...new Set(
      data.entries.flatMap((e) => [e.project1Id, e.project2Id]).filter(Boolean)
    ),
  ] as number[];

  const projects = await withRetry(() =>
    prisma.project.findMany({
      where: { id: { in: uniqueProjectIds } },
      select: { id: true, isActive: true, nameEn: true },
    })
  );

  console.log("Service: Projects fetched", {
    found: projects.length,
    requested: uniqueProjectIds.length,
  });
  const projectById = new Map(projects.map((p) => [p.id, p]));

  for (let i = 0; i < data.entries.length; i++) {
    const row = data.entries[i];
    const rowNumber = i + 1;

    try {
      console.log(
        `Service: Processing row ${rowNumber}/${data.entries.length}: EmpCode ${row.employeeCode}, Date ${row.date}`
      );

      const dateNormalized = startOfDayUTC(
        typeof row.date === "string" ? new Date(row.date) : row.date
      );

      const employee = employeeByCode.get(row.employeeCode);
      let projectValidationError: string | null = null;

      if (!employee) {
        console.warn(
          `Service: Row ${rowNumber}: Employee not found for code ${row.employeeCode}`
        );
        result.failed++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          date: dateNormalized,
          status: "failed",
          message: `Employee with code ${row.employeeCode} not found`,
        });
        result.errors.push({
          row: rowNumber,
          data: row,
          error: `Employee with code ${row.employeeCode} not found`,
        });
        continue;
      }
      console.log(
        `Service: Row ${rowNumber}: DateNormalized ${dateNormalized}, Employee found: ID ${employee.id} for ${row.employeeCode}`
      );

      // Validate Projects
      const projectsToValidate = [];
      
      // 1. Project 1 ID is mandatory
      if (!row.project1Id) {
        projectValidationError = "Project 1 ID is required and cannot be empty";
      } else {
        projectsToValidate.push({ id: row.project1Id, name: "Project 1" });
      }

      // 2. Project 2 ID is mandatory if Project 2 hours or OT is provided
      if (!projectValidationError) {
        const p2Hours = row.project2Hours ?? 0;
        const p2OT = row.project2Overtime ?? 0;
        if ((p2Hours > 0 || p2OT > 0) && !row.project2Id) {
          projectValidationError = "Project 2 ID is required when Project 2 Hours or Overtime is provided";
        } else if (row.project2Id) {
          projectsToValidate.push({ id: row.project2Id, name: "Project 2" });
        }
      }

      if (!projectValidationError) {
        for (const p of projectsToValidate) {
          const project = projectById.get(p.id!);
          if (!project) {
            projectValidationError = `${p.name} ID ${p.id} does not exist`;
            break;
          }
          if (!project.isActive) {
            projectValidationError = `${p.name} ID ${p.id} (${project.nameEn}) is inactive`;
            break;
          }
        }
      }

      if (projectValidationError) {
        console.warn(`Service: Row ${rowNumber}: ${projectValidationError}`);
        result.failed++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          date: dateNormalized,
          status: "failed",
          message: projectValidationError,
        });
        result.errors.push({
          row: rowNumber,
          data: row,
          error: projectValidationError,
        });
        continue;
      }

      const existing = await withRetry(() =>
        prisma.timesheet.findFirst({
          where: {
            employeeId: employee.id,
            date: {
              gte: dateNormalized,
              lt: dayjs.utc(dateNormalized).add(1, "day").toDate(),
            },
          },
          select: {
            id: true,
            project1Hours: true,
            project1Overtime: true,
            project2Hours: true,
            project2Overtime: true,
          },
        })
      );

      if (existing) {
        const hasHours =
          (existing.project1Hours ?? 0) > 0 ||
          (existing.project1Overtime ?? 0) > 0 ||
          (existing.project2Hours ?? 0) > 0 ||
          (existing.project2Overtime ?? 0) > 0;

        if (hasHours) {
          console.log(
            `Service: Row ${rowNumber}: Skipped - Timesheet already exists with hours (ID: ${existing.id})`
          );
          result.skipped++;
          result.details.push({
            row: rowNumber,
            employeeCode: row.employeeCode,
            date: dateNormalized,
            status: "skipped",
            message: "Timesheet already exists with hours",
          });
          continue;
        }

        // Existing record has no hours — overwrite it
        const payload = buildTimesheetPayload(row);
        await withRetry(() =>
          prisma.timesheet.update({
            where: { id: existing.id },
            data: payload,
          })
        );
        console.log(
          `Service: Row ${rowNumber}: Updated existing empty timesheet (ID: ${existing.id}).`
        );
        result.success++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          date: dateNormalized,
          status: "success",
          message: "Updated existing empty timesheet",
        });
        continue;
      }

      const payload = buildTimesheetPayload(row);

      await withRetry(() =>
        prisma.timesheet.create({
          data: {
            employeeId: employee.id,
            date: dateNormalized,
            ...payload,
          },
        })
      );

      console.log(`Service: Row ${rowNumber}: Successfully created timesheet.`);

      result.success++;
      result.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        date: dateNormalized,
        status: "success",
        message: "Uploaded successfully",
      });
    } catch (error: any) {
      console.error(`Service: Row ${rowNumber}: Failed`, error);
      result.failed++;
      const msg = error?.message ?? "Unknown error";
      result.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        date: row.date,
        status: "failed",
        message: msg,
      });
      result.errors.push({
        row: rowNumber,
        data: row,
        error: msg,
      });
    }
  }

  console.log("Service: bulkUploadTimesheets finished", {
    success: result.success,
    skipped: result.skipped,
    failed: result.failed,
  });
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

  // Calculate month boundaries (UTC) using dayjs
  const monthStart = dayjs.utc(`${year}-${String(month).padStart(2, "0")}-01`);
  const startDate = monthStart.startOf("month").toDate();
  const endDate = monthStart.endOf("month").toDate();
  const daysInMonth = monthStart.daysInMonth();

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
      date: { gte: startDate, lte: endDate },
      ...(employeeId ? { employeeId } : {}),
      ...(projectId
        ? { OR: [{ project1Id: projectId }, { project2Id: projectId }] }
        : {}),
    },
    include: {
      project1: { select: { nameEn: true } },
      project2: { select: { nameEn: true } },
    },
  });

  // 3. Map timesheets by "employeeId-dayOfMonth" key
  const timesheetMap = new Map<string, (typeof timesheets)[0]>();
  timesheets.forEach((ts) => {
    const key = `${ts.employeeId}-${dayjs.utc(ts.date).date()}`;
    timesheetMap.set(key, ts);
  });

  // 4. Generate report per employee
  const reports: EmployeeMonthlyReport[] = employees.map((emp: any) => {
    const dailyRecords: DailyTimesheetRecord[] = [];
    let totalHours = 0;
    let totalOT = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const ts = timesheetMap.get(`${emp.id}-${day}`);
      const dayInMonth = monthStart.date(day);
      const isFriday = dayInMonth.day() === 5; // 5 = Friday

      const record: DailyTimesheetRecord = {
        date: dayInMonth.format("DD-MMM"),
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

      totalHours += record.project1Hours + record.project2Hours;
      totalOT += record.project1Overtime + record.project2Overtime;

      dailyRecords.push(record);
    }

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

  // Filter reports based on showAbsents flag
  let filteredReports = reports;

  if (showAbsents) {
    // Absent: non-fixed employee and total project1 + project2 hours < 240
    filteredReports = reports.filter((r) => !r.isFixed && r.grandTotal < 240);
  } else {
    // Default behavior: only show reports with > 0 hours
    filteredReports = reports.filter((r) => r.grandTotal > 0);
  }

  return { reports: filteredReports };
};

/**
 * Get daily timesheet report data for one or all employees.
 * Fetches all relevant records for the specific date.
 */
export const getDailyTimesheetReportData = async (
  params: import("./timesheet.schemas").GetDailyTimesheetReportInput
): Promise<GetTimesheetPageDataResponse> => {
  const {
    date,
    payrollSectionId,
    designationId,
    employeeCodes,
    projectId,
    showAbsents,
    showFixedSalary,
  } = params;

  const { startOfDay, endOfDay } = getDayRange(date);

  const employeeWhere: any = {};

  if (employeeCodes && employeeCodes.length > 0) {
    employeeWhere.employeeCode = {
      in: employeeCodes.map((c) => Number(c)).filter((n) => !isNaN(n)),
    };
  }

  if (payrollSectionId != null && payrollSectionId > 0) {
    employeeWhere.payrollSectionId = payrollSectionId;
  }
  if (designationId != null && designationId > 0) {
    employeeWhere.designationId = designationId;
  }
  if (showFixedSalary) {
    employeeWhere.isFixed = true;
  }

  // Fetch ALL matching employees
  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    orderBy: [{ employeeCode: "asc" }],
    select: {
      id: true,
      employeeCode: true,
      nameEn: true,
      nameAr: true,
      isFixed: true,
      designationId: true,
      idCardNo: true,
      designation: {
        select: { nameEn: true },
      },
      payrollSection: {
        select: { nameEn: true },
      },
    },
  });

  const employeeIds = employees.map((e) => e.id);

  // Fetch timesheets
  const timesheetWhere: any = {
    date: { gte: startOfDay, lte: endOfDay },
    employeeId: { in: employeeIds },
  };

  if (projectId) {
    timesheetWhere.OR = [{ project1Id: projectId }, { project2Id: projectId }];
  }

  const timesheets = await prisma.timesheet.findMany({
    where: timesheetWhere,
    include: {
      project1: { select: { nameEn: true } },
      project2: { select: { nameEn: true } },
    },
  });

  const timesheetByEmployeeId = new Map(
    timesheets.map((t) => [t.employeeId, t])
  );

  // Build rows
  const rows: any[] = [];

  employees.forEach((emp, index) => {
    const ts = timesheetByEmployeeId.get(emp.id);

    if (projectId && !ts) {
      // Exclude employees who didn't work on the filtered project
      return;
    }

    if (!showAbsents && !ts) {
      // Exclude employees with no timesheet when absents are hidden
      return;
    }

    const p1H = ts?.project1Hours ?? 0;
    const p1OT = ts?.project1Overtime ?? 0;
    const p2H = ts?.project2Hours ?? 0;
    const p2OT = ts?.project2Overtime ?? 0;
    const total = p1H + p1OT + p2H + p2OT;

    if (showAbsents) {
      // For daily report, absent means non-fixed employee and 0 hours today
      if (emp.isFixed || total > 0) {
        return;
      }
    } else {
      // Normal behavior: only show if total > 0
      if (total === 0 && !ts?.description) {
        return;
      }
    }

    rows.push({
      id: emp.id,
      employeeId: emp.id,
      timesheetId: ts?.id ?? null,
      rowNumber: index + 1,
      employeeCode: emp.employeeCode,
      nameEn: emp.nameEn,
      nameAr: emp.nameAr,
      designationNameEn: emp.designation?.nameEn ?? "",
      designationName: emp.designation?.nameEn ?? "",
      sectionName: emp.payrollSection?.nameEn ?? "Unassigned",
      idCardNo: emp.idCardNo,
      isFixed: emp.isFixed,
      isLocked: ts?.isLocked ?? false,
      project1Id: ts?.project1Id ?? null,
      project1Name: ts?.project1?.nameEn ?? null,
      project1Hours: p1H,
      project1Overtime: p1OT,
      project2Id: ts?.project2Id ?? null,
      project2Name: ts?.project2?.nameEn ?? null,
      project2Hours: p2H,
      project2Overtime: p2OT,
      totalHours: total,
      description: ts?.description ?? null,
      remarks: ts?.description ?? null,
    });
  });

  return {
    rows: rows as any,
    pagination: {
      page: 1,
      limit: rows.length,
      total: rows.length,
      totalPages: 1,
    },
  };
};
