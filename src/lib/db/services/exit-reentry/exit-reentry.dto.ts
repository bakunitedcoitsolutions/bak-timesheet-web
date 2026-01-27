/**
 * Exit Reentry Service DTOs
 * Type definitions for exit reentry service operations
 */

export type ExitReentryType = "EXIT" | "ENTRY";

export interface CreateExitReentryData {
  employeeId: number;
  designationId?: number;
  date: Date | string;
  type: ExitReentryType;
  remarks?: string;
}

export interface UpdateExitReentryData {
  employeeId?: number;
  designationId?: number;
  date?: Date | string;
  type?: ExitReentryType;
  remarks?: string;
}

export type ListExitReentriesSortableField =
  | "date"
  | "type"
  | "createdAt";

export interface ListExitReentriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListExitReentriesSortableField;
  employeeId?: number;
  designationId?: number;
  type?: ExitReentryType;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface ExitReentryInterface {
  id: number;
  employeeId: number;
  designationId: number | null;
  date: Date | any;
  type: ExitReentryType;
  remarks: string | null;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedExitReentry extends ExitReentryInterface {}

export interface ListExitReentriesResponse {
  exitReentries: ListedExitReentry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
