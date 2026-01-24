/**
 * Branch Service DTOs
 * Type definitions for branch service operations
 */

// ---------------------------------------------------------------------------
// Part 1: Types used by services (service layer contracts)
// ---------------------------------------------------------------------------

export interface CreateBranchData {
  nameEn: string;
  nameAr?: string;
  isActive?: boolean;
}

export interface UpdateBranchData {
  nameEn?: string;
  nameAr?: string;
  isActive?: boolean;
}

export type ListBranchesSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListBranchesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListBranchesSortableField;
}

export interface BranchInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedBranch extends BranchInterface {}

export interface ListBranchesResponse {
  branches: ListedBranch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
