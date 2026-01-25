/**
 * GOSI City Service DTOs
 * Type definitions for GOSI city service operations
 */

export interface CreateGosiCityData {
  nameEn: string;
  nameAr?: string;
  isActive?: boolean;
}

export interface UpdateGosiCityData {
  nameEn?: string;
  nameAr?: string;
  isActive?: boolean;
}

export type ListGosiCitiesSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListGosiCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListGosiCitiesSortableField;
}

export interface GosiCityInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedGosiCity extends GosiCityInterface {}

export interface ListGosiCitiesResponse {
  gosiCities: ListedGosiCity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
