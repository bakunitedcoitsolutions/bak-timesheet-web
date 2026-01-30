"use server";
import { serverAction } from "@/lib/zsa/zsa-action";
import {
  getTimesheetPageData,
  saveTimesheetEntries,
  bulkUploadTimesheets,
} from "./timesheet.service";
import {
  GetTimesheetPageDataSchema,
  GetTimesheetPageDataInput,
  SaveTimesheetEntriesSchema,
  SaveTimesheetEntriesInput,
  BulkUploadTimesheetsSchema,
  BulkUploadTimesheetsInput,
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
    const response = await bulkUploadTimesheets(input);
    return response;
  });
