"use server";

import { serverAction } from "@/lib/zsa/zsa-action";
import {
  UpdateMonthlyPayrollValuesSchema,
  GetPayrollSummaryByYearParamsSchema,
  RunPayrollSchema,
  RepostPayrollSchema,
  GetPayrollDetailsSchema,
} from "./payroll-summary.schemas";
import {
  updateMonthlyPayrollValues,
  getPayrollSummariesByYear,
  runPayroll,
  repostPayroll,
  getPayrollDetails,
} from "./payroll-summary.service";

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
