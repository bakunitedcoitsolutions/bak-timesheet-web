/**
 * Traffic Challan Service DTOs
 * Type definitions for traffic challan service operations
 */

export type TrafficChallanType = "CHALLAN" | "RETURN";

export interface CreateTrafficChallanData {
  employeeId: number;
  date: Date | string;
  type: TrafficChallanType;
  amount: number;
  description?: string;
  branchId?: number | null;
}

export interface UpdateTrafficChallanData {
  employeeId?: number;
  date?: Date | string;
  type?: TrafficChallanType;
  amount?: number;
  description?: string;
  branchId?: number | null;
}

export type ListTrafficChallansSortableField =
  | "date"
  | "type"
  | "amount"
  | "createdAt";

export interface ListTrafficChallansParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListTrafficChallansSortableField;
  employeeId?: number;
  type?: TrafficChallanType;
  startDate?: Date | string;
  endDate?: Date | string;
  branchId?: number | null;
}

export interface TrafficChallanInterface {
  id: number;
  employeeId: number;
  date: Date | any;
  type: TrafficChallanType;
  amount: number | null; // Converted from Decimal for client serialization
  description: string | null;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedTrafficChallan extends TrafficChallanInterface {
  employee?: {
    nameEn: string;
    employeeCode: number;
    branchId: number | null;
    designation?: {
      nameEn: string;
    } | null;
  };
}

export interface ListTrafficChallansResponse {
  trafficChallans: ListedTrafficChallan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Bulk Upload
// ---------------------------------------------------------------------------

export interface BulkUploadTrafficChallanRow {
  employeeCode: number; // Employee code (required)
  date: Date | string;
  type: TrafficChallanType;
  amount: number;
  description?: string;
}

export interface BulkUploadTrafficChallanData {
  trafficChallans: BulkUploadTrafficChallanRow[];
  branchId?: number;
}

export interface BulkUploadTrafficChallanResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: BulkUploadTrafficChallanRow;
    error: string;
  }>;
}

/**
 * List ALL traffic challans (no pagination) — used for exports
 */
export interface ListAllTrafficChallanParams {
  search?: string;
  employeeId?: number;
  type?: "CHALLAN" | "RETURN";
  startDate?: Date | string;
  endDate?: Date | string;
  branchId?: number | null;
}
