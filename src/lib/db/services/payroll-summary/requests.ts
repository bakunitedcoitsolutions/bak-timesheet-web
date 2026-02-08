import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";
import { GetPayrollSummaryByYearParamsInput } from "./payroll-summary.schemas";

import {
  updateMonthlyPayrollValuesAction,
  getPayrollSummariesByYearAction,
  runPayrollAction,
  repostPayrollAction,
} from "./actions";

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

export const useGetPayrollSummaries = (
  input: GetPayrollSummaryByYearParamsInput
) =>
  useQuery(getPayrollSummariesByYearAction, {
    queryKey: ["payroll-summaries", input],
    input,
  });

// Manually defining input type since schema is defined inside actions.ts for now
import { getPayrollDetailsAction } from "./actions";
import { GetPayrollDetailsInput } from "./payroll-summary.schemas";

export const useGetPayrollDetails = (input: GetPayrollDetailsInput) =>
  useQuery(getPayrollDetailsAction, {
    queryKey: ["payroll-details", input],
    input,
  });
