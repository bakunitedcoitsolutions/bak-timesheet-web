/**
 * Dashboard Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const GetDashboardStatsSchema = z.object({
  branchId: z.number().int().positive().optional(),
});

export type GetDashboardStatsInput = z.infer<typeof GetDashboardStatsSchema>;

export const GetEmployeeBreakdownSchema = z.object({
  branchId: z.number().int().positive().optional(),
});

export type GetEmployeeBreakdownInput = z.infer<typeof GetEmployeeBreakdownSchema>;
