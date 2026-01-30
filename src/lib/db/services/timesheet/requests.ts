import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";
import { GetTimesheetPageDataInput, SaveTimesheetEntriesInput } from "./timesheet.schemas";
import {
  getTimesheetPageDataAction,
  saveTimesheetEntriesAction,
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
