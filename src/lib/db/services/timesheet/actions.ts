"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  getTimesheetPageData,
  saveTimesheetEntries,
  bulkUploadTimesheets,
  getMonthlyTimesheetReportData,
} from "./timesheet.service";
import {
  GetTimesheetPageDataSchema,
  GetTimesheetPageDataInput,
  SaveTimesheetEntriesSchema,
  SaveTimesheetEntriesInput,
  BulkUploadTimesheetsSchema,
  BulkUploadTimesheetsInput,
  GetMonthlyTimesheetReportSchema,
  GetMonthlyTimesheetReportInput,
} from "./timesheet.schemas";

export const getTimesheetPageDataAction = serverAction
  .input(GetTimesheetPageDataSchema)
  .handler(async ({ input }: { input: GetTimesheetPageDataInput }) => {
    const response = await getTimesheetPageData(input);
    return response;
  });

export const saveTimesheetEntriesAction = serverAction
  .input(SaveTimesheetEntriesSchema)
  .handler(async ({ input }: { input: SaveTimesheetEntriesInput }) => {
    const response = await saveTimesheetEntries(input);
    return response;
  });

export const bulkUploadTimesheetsAction = serverAction
  .input(BulkUploadTimesheetsSchema)
  .handler(async ({ input }: { input: BulkUploadTimesheetsInput }) => {
    try {
      const response = await bulkUploadTimesheets(input);
      return response;
    } catch (error) {
      throw error;
    }
  });

export const getMonthlyTimesheetReportAction = serverAction
  .input(GetMonthlyTimesheetReportSchema)
  .handler(async ({ input }: { input: GetMonthlyTimesheetReportInput }) => {
    const response = await getMonthlyTimesheetReportData(input);
    return response;
  });
