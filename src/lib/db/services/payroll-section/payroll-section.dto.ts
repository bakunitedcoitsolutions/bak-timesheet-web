/**
 * Payroll Section Service DTOs
 * Type definitions for payroll section service operations
 */

export interface CreatePayrollSectionData {
  nameEn: string;
  nameAr?: string;
  displayOrderKey?: number;
  branchId?: number;
  isActive?: boolean;
}

export interface UpdatePayrollSectionData {
  nameEn?: string;
  nameAr?: string;
  displayOrderKey?: number;
  branchId?: number;
  isActive?: boolean;
}

export type ListPayrollSectionsSortableField =
  | "nameEn"
  | "nameAr"
  | "isActive"
  | "displayOrderKey"
  | "branchId";

export interface ListPayrollSectionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListPayrollSectionsSortableField;
}

export interface PayrollSectionInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  displayOrderKey: number | null;
  branchId: number | null;
  branch?: {
    id: number;
    nameEn: string;
    nameAr: string | null;
  } | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedPayrollSection extends PayrollSectionInterface {}

export interface ListPayrollSectionsResponse {
  payrollSections: ListedPayrollSection[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
