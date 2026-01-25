/**
 * Country Service DTOs
 * Type definitions for country service operations
 */

export interface CreateCountryData {
  nameEn: string;
  nameAr?: string;
  isActive?: boolean;
}

export interface UpdateCountryData {
  nameEn?: string;
  nameAr?: string;
  isActive?: boolean;
}

export type ListCountriesSortableField = "nameEn" | "nameAr" | "isActive";

export interface ListCountriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListCountriesSortableField;
}

export interface CountryInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  isActive: boolean;
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedCountry extends CountryInterface {}

export interface ListCountriesResponse {
  countries: ListedCountry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
