import { AllowanceNotAvailable } from "../../../../../prisma/generated/prisma/client";

export type AllowanceNotAvailableType =
  | "BREAKFAST"
  | "FOOD"
  | "MOBILE"
  | "OTHER";

export interface CreateAllowanceNotAvailableData {
  nameEn: string;
  nameAr?: string | null;
  description?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  type: AllowanceNotAvailableType;
  isActive?: boolean;
}

export interface UpdateAllowanceNotAvailableData {
  nameEn?: string;
  nameAr?: string | null;
  description?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  type?: AllowanceNotAvailableType;
  isActive?: boolean;
}

export interface ListAllowanceNotAvailableParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: AllowanceNotAvailableType;
  isActive?: boolean;
}

export interface ListedAllowanceNotAvailable extends Pick<
  AllowanceNotAvailable,
  | "id"
  | "nameEn"
  | "nameAr"
  | "description"
  | "startDate"
  | "endDate"
  | "type"
  | "isActive"
  | "createdAt"
  | "updatedAt"
> {}

export interface ListAllowanceNotAvailableResponse {
  allowanceNotAvailables: ListedAllowanceNotAvailable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
