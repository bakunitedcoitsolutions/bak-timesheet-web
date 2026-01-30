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
      project1BfAllowance: true,
      project1Hours: true,
      project1Overtime: true,
      project2Id: true,
      project2BfAllowance: true,
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
      project1BfAllowance: ts?.project1BfAllowance ?? false,
      project1Hours: ts?.project1Hours ?? null,
      project1Overtime: ts?.project1Overtime ?? null,
      project2Id: ts?.project2Id ?? null,
      project2BfAllowance: ts?.project2BfAllowance ?? false,
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
          project1BfAllowance: entry.project1BfAllowance,
          project1Hours: entry.project1Hours,
          project1Overtime: entry.project1Overtime,
          project2Id: entry.project2Id,
          project2BfAllowance: entry.project2BfAllowance,
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
