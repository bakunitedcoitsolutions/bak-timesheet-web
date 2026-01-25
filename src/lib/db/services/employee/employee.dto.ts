/**
 * Employee Service DTOs
 * Type definitions for employee service operations
 */

import type { Prisma } from "../../../../../prisma/generated/prisma/client";

// ---------------------------------------------------------------------------
// Step 1: Basic Info
// ---------------------------------------------------------------------------

export interface CreateEmployeeStep1Data {
  profilePicture?: string; // URL from Supabase Storage
  employeeCode: number;
  nameEn: string;
  nameAr?: string;
  dob?: Date | string;
  phone?: string;
  reassignEmployeeCode?: boolean; // If true, remove employeeCode from previous employee and assign to this one
}

export interface UpdateEmployeeStep1Data {
  profilePicture?: string; // URL from Supabase Storage
  employeeCode: number;
  nameEn?: string;
  nameAr?: string;
  dob?: Date | string;
  phone?: string;
  reassignEmployeeCode?: boolean; // If true, remove employeeCode from previous employee and assign to this one
}

// ---------------------------------------------------------------------------
// Step 2: Contract Details
// ---------------------------------------------------------------------------

export interface UpdateEmployeeStep2Data {
  gender?: string; // "male" | "female"
  countryId?: number;
  cityId?: number;
  statusId?: number;
  branchId?: number;
  designationId: number;
  payrollSectionId: number;
  isDeductable?: boolean;
  isFixed?: boolean;
  workingDays?: number;
  workingHours?: number;
  hourlyRate?: number | Prisma.Decimal;
  salary?: number | Prisma.Decimal;
  foodAllowance?: number | Prisma.Decimal;
  mobileAllowance?: number | Prisma.Decimal;
  otherAllowance?: number | Prisma.Decimal;
  contractStartDate?: Date | string;
  contractEndDate?: Date | string;
  contractDocument?: string; // URL from Supabase Storage
  contractEndReason?: string;
  joiningDate?: Date | string;
}

// ---------------------------------------------------------------------------
// Step 3: Identity
// ---------------------------------------------------------------------------

export interface UpdateEmployeeStep3Data {
  idCardNo?: string;
  idCardExpiryDate?: Date | string;
  idCardDocument?: string; // URL from Supabase Storage
  profession?: string;
  nationality?: string;
  passportNo?: string;
  passportExpiryDate?: Date | string;
  passportDocument?: string; // URL from Supabase Storage
}

// ---------------------------------------------------------------------------
// Step 4: Financial Details
// ---------------------------------------------------------------------------

export interface UpdateEmployeeStep4Data {
  bankName?: string;
  bankCode?: string;
  iban?: string;
  gosiSalary?: number | Prisma.Decimal;
  gosiCityId?: number;
}

// ---------------------------------------------------------------------------
// Step 5: Other Details
// ---------------------------------------------------------------------------

export interface UpdateEmployeeStep5Data {
  openingBalance?: number | Prisma.Decimal;
  isCardDelivered?: boolean;
  cardDocument?: string; // URL from Supabase Storage
}

// ---------------------------------------------------------------------------
// List & Find Operations
// ---------------------------------------------------------------------------

export type ListEmployeesSortableField =
  | "nameEn"
  | "nameAr"
  | "employeeCode"
  | "phone"
  | "dob"
  | "joiningDate"
  | "contractStartDate"
  | "contractEndDate";

export interface ListEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: ListEmployeesSortableField;
  branchId?: number;
  statusId?: number;
  designationId?: number;
}

export interface EmployeeInterface {
  id: number;
  // Step 1
  profilePicture: string | null;
  employeeCode: number;
  nameEn: string;
  nameAr: string | null;
  dob: Date | null;
  phone: string | null;
  // Step 2
  gender: string | null;
  countryId: number | null;
  cityId: number | null;
  statusId: number | null;
  branchId: number | null;
  designationId: number | null;
  payrollSectionId: number | null;
  isDeductable: boolean;
  isFixed: boolean;
  workingDays: number | null;
  workingHours: number | null;
  hourlyRate: number | null; // Converted from Decimal
  salary: number | null; // Converted from Decimal
  foodAllowance: number | null; // Converted from Decimal
  mobileAllowance: number | null; // Converted from Decimal
  otherAllowance: number | null; // Converted from Decimal
  contractStartDate: Date | null;
  contractEndDate: Date | null;
  contractDocument: string | null;
  contractEndReason: string | null;
  joiningDate: Date | null;
  // Step 3
  idCardNo: string | null;
  idCardExpiryDate: Date | null;
  idCardDocument: string | null;
  profession: string | null;
  nationality: string | null;
  passportNo: string | null;
  passportExpiryDate: Date | null;
  passportDocument: string | null;
  // Step 4
  bankName: string | null;
  bankCode: string | null;
  iban: string | null;
  gosiSalary: number | null; // Converted from Decimal
  gosiCityId: number | null;
  // Step 5
  openingBalance: number | null; // Converted from Decimal
  isCardDelivered: boolean;
  cardDocument: string | null;
  // Timestamps
  createdAt: Date | any;
  updatedAt: Date | any;
}

export interface ListedEmployee extends EmployeeInterface {}

export interface ListEmployeesResponse {
  employees: ListedEmployee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
