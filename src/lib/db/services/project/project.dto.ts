/**
 * Project Service DTOs
 * Type definitions for project service operations
 */

export interface CreateProjectData {
  nameEn: string;
  nameAr?: string;
  branchId?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProjectData {
  nameEn?: string;
  nameAr?: string;
  branchId?: number;
  description?: string;
  isActive?: boolean;
}

export type ListProjectsSortableField =
  | "nameEn"
  | "nameAr"
  | "isActive"
  | "createdAt";

export interface ListProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListProjectsSortableField;
  branchId?: number;
  isActive?: boolean;
}

export interface ProjectInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  branchId: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedProject extends ProjectInterface {}

export interface ListProjectsResponse {
  projects: ListedProject[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
