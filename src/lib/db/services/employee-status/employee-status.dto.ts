/**
 * Employee Status Service DTOs
 * Type definitions for employee status service operations
 */

export interface CreateEmployeeStatusData {
  nameEn: string;
  nameAr?: string;
  isActive?: boolean;
}

export interface UpdateEmployeeStatusData {
  nameEn?: string;
  nameAr?: string;
  isActive?: boolean;
}

export type ListEmployeeStatusesSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListEmployeeStatusesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListEmployeeStatusesSortableField;
}

export interface EmployeeStatusInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedEmployeeStatus extends EmployeeStatusInterface {}

export interface ListEmployeeStatusesResponse {
  employeeStatuses: ListedEmployeeStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
