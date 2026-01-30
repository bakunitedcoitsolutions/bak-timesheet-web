/**
 * Timesheet Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 */

import { z } from "zod";

export const GetTimesheetPageDataSchema = z.object({
  date: z.coerce.date(),
  payrollSectionId: z.number().int().positive().optional().nullable(),
  designationId: z.number().int().positive().optional().nullable(),
});

export type GetTimesheetPageDataInput = z.infer<
  typeof GetTimesheetPageDataSchema
>;

const SaveTimesheetEntryItemSchema = z.object({
  employeeId: z.number().int().positive(),
  timesheetId: z.number().int().positive().nullable(),
  project1Id: z.number().int().positive().nullable(),
  project1BfAllowance: z.boolean(),
  project1Hours: z.number().int().min(0).nullable(),
  project1Overtime: z.number().int().min(0).nullable(),
  project2Id: z.number().int().positive().nullable(),
  project2BfAllowance: z.boolean(),
  project2Hours: z.number().int().min(0).nullable(),
  project2Overtime: z.number().int().min(0).nullable(),
  totalHours: z.number().int().min(0).nullable(),
  description: z.string().nullable(),
});

export const SaveTimesheetEntriesSchema = z.object({
  date: z.coerce.date(),
  entries: z.array(SaveTimesheetEntryItemSchema),
});

export type SaveTimesheetEntriesInput = z.infer<
  typeof SaveTimesheetEntriesSchema
>;

// Bulk Upload (totalHours is calculated server-side, not from file)
export const BulkUploadTimesheetRowSchema = z.object({
  date: z.coerce.date(),
  employeeCode: z.number().int().positive(),
  project1Id: z.number().int().positive().nullable().optional(),
  project1BfAllowance: z.boolean().optional(),
  project1Hours: z.number().int().min(0).nullable().optional(),
  project1Overtime: z.number().int().min(0).nullable().optional(),
  project2Id: z.number().int().positive().nullable().optional(),
  project2BfAllowance: z.boolean().optional(),
  project2Hours: z.number().int().min(0).nullable().optional(),
  project2Overtime: z.number().int().min(0).nullable().optional(),
  description: z.string().nullable().optional(),
});

export const BulkUploadTimesheetsSchema = z.object({
  entries: z
    .array(BulkUploadTimesheetRowSchema)
    .min(1, "At least one timesheet entry is required"),
});

export type BulkUploadTimesheetsInput = z.infer<
  typeof BulkUploadTimesheetsSchema
>;
