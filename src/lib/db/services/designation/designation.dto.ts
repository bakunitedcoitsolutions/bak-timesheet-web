/**
 * Designation Service DTOs
 * Type definitions for designation service operations
 */

import type { Prisma } from "../../../../../prisma/generated/prisma/client";

export interface CreateDesignationData {
  nameEn: string;
  nameAr?: string;
  hoursPerDay?: number;
  displayOrderKey?: number;
  color?: string;
  breakfastAllowance?: number | Prisma.Decimal;
  isActive?: boolean;
}

export interface UpdateDesignationData {
  nameEn?: string;
  nameAr?: string;
  hoursPerDay?: number;
  displayOrderKey?: number;
  color?: string;
  breakfastAllowance?: number | Prisma.Decimal;
  isActive?: boolean;
}

export type ListDesignationsSortableField =
  | "nameEn"
  | "nameAr"
  | "isActive"
  | "displayOrderKey"
  | "hoursPerDay"
  | "breakfastAllowance";

export interface ListDesignationsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListDesignationsSortableField;
}

export interface DesignationInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  hoursPerDay: number | null;
  displayOrderKey: number | null;
  color: string | null;
  breakfastAllowance: number | null; // Converted from Decimal for client serialization
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedDesignation extends DesignationInterface {}

export interface ListDesignationsResponse {
  designations: ListedDesignation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
