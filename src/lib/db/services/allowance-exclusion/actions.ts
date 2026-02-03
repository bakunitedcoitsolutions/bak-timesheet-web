/**
 * Allowance Exclusion Server Actions
 * Server-side actions for allowance exclusion operations
 */

"use server";

import {
  CreateAllowanceExclusionSchema,
  UpdateAllowanceExclusionSchema,
  GetAllowanceExclusionByIdSchema,
  DeleteAllowanceExclusionSchema,
  ListAllowanceExclusionsParamsSchema,
} from "./allowance-exclusion.schemas";
import {
  createAllowanceExclusion as createAllowanceExclusionService,
  updateAllowanceExclusion as updateAllowanceExclusionService,
  findAllowanceExclusionById as findAllowanceExclusionByIdService,
  deleteAllowanceExclusion as deleteAllowanceExclusionService,
  listAllowanceExclusions as listAllowanceExclusionsService,
  isDateExcluded as isDateExcludedService,
  getActiveExclusionsForDateRange as getActiveExclusionsForDateRangeService,
} from "./allowance-exclusion.service";

/**
 * Create a new allowance exclusion
 */
export const createAllowanceExclusion = async (data: unknown) => {
  const validatedData = CreateAllowanceExclusionSchema.parse(data);
  return createAllowanceExclusionService(validatedData);
};

/**
 * Update an allowance exclusion
 */
export const updateAllowanceExclusion = async (data: unknown) => {
  const validatedData = UpdateAllowanceExclusionSchema.parse(data);
  const { id, ...updateData } = validatedData;
  return updateAllowanceExclusionService(id, updateData);
};

/**
 * Find allowance exclusion by ID
 */
export const findAllowanceExclusionById = async (data: unknown) => {
  const validatedData = GetAllowanceExclusionByIdSchema.parse(data);
  return findAllowanceExclusionByIdService(validatedData.id);
};

/**
 * Delete an allowance exclusion
 */
export const deleteAllowanceExclusion = async (data: unknown) => {
  const validatedData = DeleteAllowanceExclusionSchema.parse(data);
  return deleteAllowanceExclusionService(validatedData.id);
};

/**
 * List allowance exclusions with pagination
 */
export const listAllowanceExclusions = async (data: unknown) => {
  const validatedData = ListAllowanceExclusionsParamsSchema.parse(data);
  return listAllowanceExclusionsService(validatedData);
};

/**
 * Check if a date is excluded for a specific allowance type
 */
export const isDateExcluded = async (
  date: Date | string,
  type: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER"
) => {
  return isDateExcludedService(date, type);
};

/**
 * Get active exclusions for a date range
 */
export const getActiveExclusionsForDateRange = async (
  startDate: Date | string,
  endDate: Date | string,
  type?: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER"
) => {
  return getActiveExclusionsForDateRangeService(startDate, endDate, type);
};
