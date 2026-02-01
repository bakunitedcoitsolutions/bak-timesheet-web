/**
 * City Service DTOs
 * Type definitions for city service operations
 */

export interface CreateCityData {
  nameEn: string;
  nameAr?: string;
  countryId?: number;
  isActive?: boolean;
}

export interface UpdateCityData {
  nameEn?: string;
  nameAr?: string;
  countryId?: number;
  isActive?: boolean;
}

export type ListCitiesSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListCitiesParams {
  page?: number;
  limit?: number;
  search?: string;
  countryId?: number; // Filter by country
  sortOrder?: "asc" | "desc";
  sortBy?: ListCitiesSortableField;
}

export interface CityInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  countryId: number | null;
  isActive: boolean;

  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedCity extends CityInterface {
  country?: {
    id: number;
    nameEn: string;
  } | null;
}

export interface ListCitiesResponse {
  cities: ListedCity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
