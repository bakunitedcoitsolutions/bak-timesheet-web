"use server";
import { auth } from "@/lib/auth/auth";
import { USER_ROLES } from "@/utils/user.utility";
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
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await getTimesheetPageData({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
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
      const session = await auth();
      const roleId = session?.user?.roleId;
      const userBranchId = session?.user?.branchId;

      const isBranchScoped =
        roleId === USER_ROLES.BRANCH_MANAGER ||
        roleId === USER_ROLES.BRANCH_USER;

      console.log("bulkUploadTimesheetsAction called", {
        entriesCount: input.entries.length,
        "payloadSize Approx": JSON.stringify(input).length,
        firstEntry: input.entries[0], // Log first entry for structure verification
      });
      const response = await bulkUploadTimesheets({
        ...input,
        branchId: isBranchScoped ? (userBranchId as number) : undefined,
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
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await getMonthlyTimesheetReportData({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });
export const getDailyTimesheetReportAction = serverAction
  .input(GetDailyTimesheetReportSchema)
  .handler(async ({ input }: { input: GetDailyTimesheetReportInput }) => {
    const session = await auth();
    const roleId = session?.user?.roleId;
    const userBranchId = session?.user?.branchId;

    const isBranchScoped =
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

    const response = await getDailyTimesheetReportData({
      ...input,
      branchId: isBranchScoped ? (userBranchId as number) : undefined,
    });
    return response;
  });
