"use server";

import { serverAction } from "@/lib/zsa/zsa-action";
import {
  getDashboardStats,
  getEmployeeBreakdown,
  getFinancialOverview,
} from "./dashboard.service";
import { GetFinancialOverviewSchema } from "./dashboard.schemas";
import { getServerAccessContext } from "@/lib/auth/helpers";

export const getDashboardStatsAction = serverAction.handler(async () => {
  let branchId = undefined;
  const { isBranchScoped, userBranchId } = await getServerAccessContext();

  if (isBranchScoped) {
    branchId = userBranchId as number;
  }

  const response = await getDashboardStats(branchId);
  return response;
});

export const getEmployeeBreakdownAction = serverAction.handler(async () => {
  let branchId = undefined;
  const { isBranchScoped, userBranchId } = await getServerAccessContext();

  if (isBranchScoped) {
    branchId = userBranchId as number;
  }

  const response = await getEmployeeBreakdown(branchId);
  return response;
});

export const getFinancialOverviewAction = serverAction
  .input(GetFinancialOverviewSchema)
  .handler(async ({ input }) => {
    let branchId = undefined;
    const { isBranchScoped, userBranchId } = await getServerAccessContext();

    if (isBranchScoped) {
      branchId = userBranchId as number;
    }

    const response = await getFinancialOverview(input.year, branchId);
    return response;
  });
