import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";
import {
  GetTimesheetPageDataInput,
  GetMonthlyTimesheetReportInput,
} from "./timesheet.schemas";
import {
  getTimesheetPageDataAction,
  saveTimesheetEntriesAction,
  bulkUploadTimesheetsAction,
  getMonthlyTimesheetReportAction,
} from "./actions";

const dateToKey = (d: Date) =>
  d instanceof Date && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";

export const useGetTimesheetPageData = (input: GetTimesheetPageDataInput) =>
  useQuery(getTimesheetPageDataAction, {
    queryKey: [
      "timesheet-page",
      dateToKey(input.date),
      input.payrollSectionId,
      input.designationId,
    ],
    input,
    enabled: !!input.date,
  });

export const useSaveTimesheetEntries = () =>
  useMutation(saveTimesheetEntriesAction, {
    mutationKey: ["save-timesheet-entries"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheet-page"] });
    },
  });

export const useBulkUploadTimesheets = () =>
  useMutation(bulkUploadTimesheetsAction, {
    mutationKey: ["bulk-upload-timesheets"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timesheet-page"] });
    },
  });

export const useGetMonthlyTimesheetReport = (
  input: GetMonthlyTimesheetReportInput
) =>
  useQuery(getMonthlyTimesheetReportAction, {
    queryKey: [
      "monthly-timesheet-report",
      input.month,
      input.year,
      input.employeeId,
      input.employeeCodes,
      input.projectId,
      input.designationId,
      input.payrollSectionId,
      input.showAbsents,
      input.showFixedSalary,
    ],
    input,
    enabled: !!input.month && !!input.year,
  });
