"use server";

import { serverAction } from "@/lib/zsa/zsa-action";
import {
  UpdateMonthlyPayrollValuesSchema,
  GetPayrollSummaryByYearParamsSchema,
} from "./payroll-summary.schemas";
import {
  updateMonthlyPayrollValues,
  getPayrollSummariesByYear,
} from "./payroll-summary.service";

export const updateMonthlyPayrollValuesAction = serverAction
  .input(UpdateMonthlyPayrollValuesSchema)
  .handler(async ({ input }) => {
    await updateMonthlyPayrollValues(input);
  });

export const getPayrollSummariesByYearAction = serverAction
  .input(GetPayrollSummaryByYearParamsSchema)
  .handler(async ({ input }) => {
    const response = await getPayrollSummariesByYear(input);
    return response;
  });
