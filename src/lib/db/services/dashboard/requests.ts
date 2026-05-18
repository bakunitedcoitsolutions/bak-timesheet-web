import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@/lib/zsa/zsa-query";

import { getDashboardStatsAction, getEmployeeBreakdownAction } from "./actions";

export const useGetDashboardStats = () =>
  useQuery(getDashboardStatsAction, {
    queryKey: ["dashboard-stats", undefined],
    input: undefined,
  });

export const useGetEmployeeBreakdown = () =>
  useQuery(getEmployeeBreakdownAction, {
    queryKey: ["employee-breakdown", undefined],
    input: undefined,
  });
