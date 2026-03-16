import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";
import { GetPayrollSummaryByYearParamsInput } from "./payroll-summary.schemas";

import {
  updateMonthlyPayrollValuesAction,
  getPayrollSummariesByYearAction,
  runPayrollAction,
  repostPayrollAction,
  postPayrollAction,
  recalculatePayrollSummaryAction,
  getPayrollSummaryStatusByMonthYearAction,
  getPayrollReportAction,
} from "./actions";

// Manually defining input type since schema is defined inside actions.ts for now
import {
  getPayrollDetailsAction,
  getPayrollDateAction,
  savePayrollDetailsBatchAction,
  refreshPayrollDetailRowAction,
  getSalarySlipDataAction,
} from "./actions";
import {
  GetPayrollDetailsInput,
  GetPayrollDateInput,
  GetPayrollSummaryByMonthYearInput,
  GetPayrollReportInput,
} from "./payroll-summary.schemas";

export const useUpdateMonthlyPayrollValues = () =>
  useMutation(updateMonthlyPayrollValuesAction, {
    mutationKey: ["update-monthly-payroll-values"],
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-summaries"],
      });
      // Invalidate specific query if needed, avoiding complexity for now
    },
  });

export const useRunPayroll = () =>
  useMutation(runPayrollAction, {
    mutationKey: ["run-payroll"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-summaries"],
      });
    },
  });

export const useRepostPayroll = () =>
  useMutation(repostPayrollAction, {
    mutationKey: ["repost-payroll"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-summaries"],
      });
    },
  });

export const usePostPayroll = () =>
  useMutation(postPayrollAction, {
    mutationKey: ["post-payroll"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-summaries"],
      });
    },
  });

export const useRecalculatePayrollSummary = () =>
  useMutation(recalculatePayrollSummaryAction, {
    mutationKey: ["recalculate-payroll-summary"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-summaries"],
      });
    },
  });

export const useGetPayrollSummaries = (
  input: GetPayrollSummaryByYearParamsInput
) =>
  useQuery(getPayrollSummariesByYearAction, {
    queryKey: ["payroll-summaries", input],
    input,
  });

export const useGetPayrollDetails = (input: GetPayrollDetailsInput) =>
  useQuery(getPayrollDetailsAction, {
    queryKey: ["payroll-details", input],
    input,
    enabled:
      !!input.payrollId && (!!input.designationId || !!input.payrollSectionId),
    staleTime: 60 * 1000, // 60 seconds — avoids refetch on window focus/remount
  });

export const useGetPayrollDate = (input: GetPayrollDateInput) =>
  useQuery(getPayrollDateAction, {
    queryKey: ["payroll-date", input],
    input,
    enabled: !!input.id,
  });

export const useSavePayrollDetailsBatch = () =>
  useMutation(savePayrollDetailsBatchAction, {
    mutationKey: ["save-payroll-details-batch"],
  });

export const useRefreshPayrollDetailRow = () => {
  const { mutateAsync, isPending } = useMutation(
    refreshPayrollDetailRowAction,
    {
      mutationKey: ["refresh-payroll-detail-row"],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
        queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
      },
    }
  );
  return { mutateAsync, isPending };
};

export const useGetSalarySlipData = () =>
  useMutation(getSalarySlipDataAction, {
    mutationKey: ["get-salary-slip-data"],
  });

export const useGetPayrollSummaryStatus = (
  input: GetPayrollSummaryByMonthYearInput
) =>
  useQuery(getPayrollSummaryStatusByMonthYearAction, {
    queryKey: ["payroll-summary-status", input],
    input,
    enabled: !!input.month && !!input.year,
  });

export const useGetPayrollReport = (input: GetPayrollReportInput, enabled: boolean = true) =>
  useQuery(getPayrollReportAction, {
    queryKey: ["payroll-report", input],
    input,
    enabled: enabled && !!input.month && !!input.year,
    staleTime: 60 * 1000,
  });
