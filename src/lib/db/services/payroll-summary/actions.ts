"use server";

import { serverAction } from "@/lib/zsa/zsa-action";
import {
  UpdateMonthlyPayrollValuesSchema,
  GetPayrollSummaryByYearParamsSchema,
  RunPayrollSchema,
  RepostPayrollSchema,
  GetPayrollDetailsSchema,
  GetPayrollDateSchema,
  SavePayrollDetailsBatchSchema,
  PostPayrollSchema,
  RecalculatePayrollSummarySchema,
  RefreshPayrollDetailRowSchema,
  GetSalarySlipDataSchema,
  GetPayrollSummaryByMonthYearSchema,
} from "./payroll-summary.schemas";
import {
  getPayrollSummariesByYear,
  getPayrollDate,
  getPayrollSummaryStatusByMonthYear,
} from "./payroll-summary.service";
import {
  getPayrollDetails,
  savePayrollDetailsBatch,
} from "./payroll-details.service";
import {
  runPayroll,
  repostPayroll,
  updateMonthlyPayrollValues,
  postPayroll,
  recalculatePayrollSummary,
  refreshPayrollDetailRow,
} from "./payroll-actions.service";
import { getSalarySlipData } from "./salary-slip.service";

export const updateMonthlyPayrollValuesAction = serverAction
  .input(UpdateMonthlyPayrollValuesSchema)
  .handler(async ({ input }) => {
    await updateMonthlyPayrollValues(input);
  });

export const runPayrollAction = serverAction
  .input(RunPayrollSchema)
  .handler(async ({ input }) => {
    await runPayroll(input);
  });

export const repostPayrollAction = serverAction
  .input(RepostPayrollSchema)
  .handler(async ({ input }) => {
    await repostPayroll(input);
  });

export const postPayrollAction = serverAction
  .input(PostPayrollSchema)
  .handler(async ({ input }) => {
    await postPayroll(input);
  });

export const recalculatePayrollSummaryAction = serverAction
  .input(RecalculatePayrollSummarySchema)
  .handler(async ({ input }) => {
    await recalculatePayrollSummary(input);
  });

export const getPayrollSummariesByYearAction = serverAction
  .input(GetPayrollSummaryByYearParamsSchema)
  .handler(async ({ input }) => {
    const response = await getPayrollSummariesByYear(input);
    return response;
  });

export const getPayrollDetailsAction = serverAction
  .input(GetPayrollDetailsSchema)
  .handler(async ({ input }) => {
    return await getPayrollDetails(input);
  });

export const getPayrollDateAction = serverAction
  .input(GetPayrollDateSchema)
  .handler(async ({ input }) => {
    return await getPayrollDate(input.id);
  });

export const savePayrollDetailsBatchAction = serverAction
  .input(SavePayrollDetailsBatchSchema)
  .handler(async ({ input }) => {
    return await savePayrollDetailsBatch(input);
  });

export const refreshPayrollDetailRowAction = serverAction
  .input(RefreshPayrollDetailRowSchema)
  .handler(async ({ input }) => {
    return await refreshPayrollDetailRow(input);
  });

export const getSalarySlipDataAction = serverAction
  .input(GetSalarySlipDataSchema)
  .handler(async ({ input }) => {
    return await getSalarySlipData(input);
  });

export const getPayrollSummaryStatusByMonthYearAction = serverAction
  .input(GetPayrollSummaryByMonthYearSchema)
  .handler(async ({ input }) => {
    return await getPayrollSummaryStatusByMonthYear(input.month, input.year);
  });
