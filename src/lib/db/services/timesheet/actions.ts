"use server";

import { getServerAccessContext } from "@/lib/auth/helpers";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  getTimesheetPageData,
  saveTimesheetEntries,
  bulkUploadTimesheets,
  getDailyTimesheetReportData,
  getMonthlyTimesheetReportData,
} from "./timesheet.service";
import {
  GetTimesheetPageDataInput,
  SaveTimesheetEntriesInput,
  BulkUploadTimesheetsInput,
  GetTimesheetPageDataSchema,
  SaveTimesheetEntriesSchema,
  BulkUploadTimesheetsSchema,
  GetDailyTimesheetReportInput,
  GetDailyTimesheetReportSchema,
  GetMonthlyTimesheetReportInput,
  GetMonthlyTimesheetReportSchema,
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
      const { isBranchScoped, userBranchId } = await getServerAccessContext();

      console.log("bulkUploadTimesheetsAction called", {
        entriesCount: input.entries.length,
        "payloadSize Approx": JSON.stringify(input).length,
        firstEntry: input.entries[0],
      });

      const response = await bulkUploadTimesheets({
        ...input,
        branchId: isBranchScoped ? userBranchId : undefined,
      });
      return response;
    } catch (error) {
      console.log("bulkUploadTimesheetsAction error", error);
      throw error;
    }
  });

export const getMonthlyTimesheetReportAction = serverAction
  .input(GetMonthlyTimesheetReportSchema)
  .handler(async ({ input }: { input: GetMonthlyTimesheetReportInput }) => {
    const response = await getMonthlyTimesheetReportData(input);
    return response;
  });

export const getDailyTimesheetReportAction = serverAction
  .input(GetDailyTimesheetReportSchema)
  .handler(async ({ input }: { input: GetDailyTimesheetReportInput }) => {
    const response = await getDailyTimesheetReportData(input);
    return response;
  });
