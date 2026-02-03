/**
 * Allowance Exclusion Service DTOs
 * Type definitions for allowance exclusion service operations
 */

export interface CreateAllowanceExclusionData {
  nameEn: string;
  nameAr?: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  type: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER";
  isActive?: boolean;
}

export interface UpdateAllowanceExclusionData {
  nameEn?: string;
  nameAr?: string;
  description?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  type?: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER";
  isActive?: boolean;
}

export type ListAllowanceExclusionsSortableField =
  | "nameEn"
  | "nameAr"
  | "startDate"
  | "endDate"
  | "type"
  | "isActive";

export interface ListAllowanceExclusionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListAllowanceExclusionsSortableField;
  type?: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER";
  isActive?: boolean;
}

export interface AllowanceExclusionInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  description: string | null;
  startDate: Date | any;
  endDate: Date | any;
  type: "BREAKFAST" | "FOOD" | "MOBILE" | "OTHER";
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedAllowanceExclusion extends AllowanceExclusionInterface {}

export interface ListAllowanceExclusionsResponse {
  allowanceExclusions: ListedAllowanceExclusion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
