/**
 * Ledger Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

export const GetLedgerByEmployeeCodeSchema = z.object({
  employeeCode: z.number().int().positive("Employee code is required"),
});

// Type exports for use in actions
export type GetLedgerByEmployeeCodeInput = z.infer<
  typeof GetLedgerByEmployeeCodeSchema
>;
