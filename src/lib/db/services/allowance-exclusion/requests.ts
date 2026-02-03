/**
 * Allowance Exclusion React Query Hooks
 * Client-side hooks for allowance exclusion operations
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAllowanceExclusion,
  updateAllowanceExclusion,
  findAllowanceExclusionById,
  deleteAllowanceExclusion,
  listAllowanceExclusions,
  isDateExcluded,
  getActiveExclusionsForDateRange,
} from "./actions";
import type {
  CreateAllowanceExclusionInput,
  UpdateAllowanceExclusionInput,
  GetAllowanceExclusionByIdInput,
  DeleteAllowanceExclusionInput,
  ListAllowanceExclusionsParamsInput,
} from "./allowance-exclusion.schemas";

// Query Keys
export const allowanceExclusionKeys = {
  all: ["allowanceExclusions"] as const,
  lists: () => [...allowanceExclusionKeys.all, "list"] as const,
  list: (params: ListAllowanceExclusionsParamsInput) =>
    [...allowanceExclusionKeys.lists(), params] as const,
  details: () => [...allowanceExclusionKeys.all, "detail"] as const,
  detail: (id: number) => [...allowanceExclusionKeys.details(), id] as const,
};

/**
 * Hook to create a new allowance exclusion
 */
export const useCreateAllowanceExclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllowanceExclusionInput) =>
      createAllowanceExclusion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allowanceExclusionKeys.lists(),
      });
    },
  });
};

/**
 * Hook to update an allowance exclusion
 */
export const useUpdateAllowanceExclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAllowanceExclusionInput) =>
      updateAllowanceExclusion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: allowanceExclusionKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: allowanceExclusionKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to get allowance exclusion by ID
 */
export const useGetAllowanceExclusionById = (
  params: GetAllowanceExclusionByIdInput
) => {
  return useQuery({
    queryKey: allowanceExclusionKeys.detail(params.id),
    queryFn: () => findAllowanceExclusionById(params),
    enabled: !!params.id && params.id > 0,
  });
};

/**
 * Hook to delete an allowance exclusion
 */
export const useDeleteAllowanceExclusion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteAllowanceExclusionInput) =>
      deleteAllowanceExclusion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allowanceExclusionKeys.lists(),
      });
    },
  });
};

/**
 * Hook to list allowance exclusions with pagination
 */
export const useGetAllowanceExclusions = (
  params: ListAllowanceExclusionsParamsInput
) => {
  return useQuery({
    queryKey: allowanceExclusionKeys.list(params),
    queryFn: () => listAllowanceExclusions(params),
  });
};

/**
 * Hook to check if a date is excluded
 */
export const useIsDateExcluded = (
  date: Date | string,
  type: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["isDateExcluded", date, type],
    queryFn: () => isDateExcluded(date, type),
    enabled,
  });
};

/**
 * Hook to get active exclusions for a date range
 */
export const useGetActiveExclusionsForDateRange = (
  startDate: Date | string,
  endDate: Date | string,
  type?: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER",
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["activeExclusions", startDate, endDate, type],
    queryFn: () => getActiveExclusionsForDateRange(startDate, endDate, type),
    enabled,
  });
};
