/**
 * Traffic Challan Service DTOs
 * Type definitions for traffic challan service operations
 */

import type { Prisma } from "../../../../../prisma/generated/prisma/client";

export type TrafficChallanType = "CHALLAN" | "RETURN";

export interface CreateTrafficChallanData {
  employeeId: number;
  date: Date | string;
  type: TrafficChallanType;
  amount: number | Prisma.Decimal;
  description?: string;
}

export interface UpdateTrafficChallanData {
  employeeId?: number;
  date?: Date | string;
  type?: TrafficChallanType;
  amount?: number | Prisma.Decimal;
  description?: string;
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

export interface ListedTrafficChallan extends TrafficChallanInterface {}

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
  amount: number | Prisma.Decimal;
  description?: string;
}

export interface BulkUploadTrafficChallanData {
  trafficChallans: BulkUploadTrafficChallanRow[];
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
