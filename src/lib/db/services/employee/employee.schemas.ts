/**
 * Employee Service Schemas (Client-Safe)
 * Zod schemas for frontend validation
 * This file contains ONLY schemas and types - no server-side imports
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Step 1: Basic Info (Create & Update Employee)
// ---------------------------------------------------------------------------

export const CreateEmployeeStep1Schema = z.object({
  profilePicture: z.string().optional(),
  employeeCode: z.number().int().positive("Employee code is required"),
  nameEn: z.string().min(2, "Name is required"),
  nameAr: z.string().optional(),
  dob: z.union([z.date(), z.string()]).optional(),
  phone: z.string().optional(),
  reassignEmployeeCode: z.boolean().optional(),
});

export const UpdateEmployeeStep1Schema = z.object({
  id: z.number().int().positive(),
  profilePicture: z.string().optional(),
  employeeCode: z.number().int().positive("Employee code is required"),
  nameEn: z.string().min(2, "Name is required").optional(),
  nameAr: z.string().optional(),
  dob: z.union([z.date(), z.string()]).optional(),
  phone: z.string().optional(),
  reassignEmployeeCode: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Step 2: Contract Details (Update Employee)
// ---------------------------------------------------------------------------

export const UpdateEmployeeStep2Schema = z.object({
  id: z.number().int().positive(),
  gender: z.enum(["male", "female"]).optional(),
  countryId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  statusId: z.number().int().positive().optional(),
  branchId: z.number().int().positive().optional(),
  designationId: z.number().int().positive("Designation is required"),
  payrollSectionId: z.number().int().positive("Payroll section is required"),
  isDeductable: z.boolean().optional(),
  isFixed: z.boolean().optional(),
  workingDays: z.number().int().positive().optional(),
  workingHours: z.number().int().positive().optional(),
  hourlyRate: z.number().optional(),
  salary: z.number().optional(),
  foodAllowance: z.number().optional(),
  mobileAllowance: z.number().optional(),
  otherAllowance: z.number().optional(),
  contractStartDate: z.union([z.date(), z.string()]).optional(),
  contractEndDate: z.union([z.date(), z.string()]).optional(),
  contractDocument: z.string().optional(),
  contractEndReason: z.string().optional(),
  joiningDate: z.union([z.date(), z.string()]).optional(),
});

// ---------------------------------------------------------------------------
// Step 3: Identity (Update Employee)
// ---------------------------------------------------------------------------

export const UpdateEmployeeStep3Schema = z.object({
  id: z.number().int().positive(),
  idCardNo: z.string().optional(),
  idCardExpiryDate: z.union([z.date(), z.string()]).optional(),
  idCardDocument: z.string().optional(),
  profession: z.string().optional(),
  nationality: z.string().optional(),
  passportNo: z.string().optional(),
  passportExpiryDate: z.union([z.date(), z.string()]).optional(),
  passportDocument: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Step 4: Financial Details (Update Employee)
// ---------------------------------------------------------------------------

export const UpdateEmployeeStep4Schema = z.object({
  id: z.number().int().positive(),
  bankName: z.string().optional(),
  bankCode: z.string().optional(),
  iban: z.string().optional(),
  gosiSalary: z.number().optional(),
  gosiCityId: z.number().int().positive().optional(),
});

// ---------------------------------------------------------------------------
// Step 5: Other Details (Update Employee)
// ---------------------------------------------------------------------------

export const UpdateEmployeeStep5Schema = z.object({
  id: z.number().int().positive(),
  openingBalance: z.number().optional(),
  isCardDelivered: z.boolean().optional(),
  cardDocument: z.string().optional(),
});

// ---------------------------------------------------------------------------
// List & Find Operations
// ---------------------------------------------------------------------------

export const ListEmployeesParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  search: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  sortBy: z
    .enum([
      "nameEn",
      "nameAr",
      "employeeCode",
      "phone",
      "dob",
      "joiningDate",
      "contractStartDate",
      "contractEndDate",
      "gender",
      "idCardNo",
      "profession",
      "nationality",
    ])
    .optional(),
  branchId: z.number().int().positive().optional(),
  statusId: z.number().int().positive().optional(),
  designationId: z.number().int().positive().optional(),
  payrollSectionId: z.number().int().positive().optional(),
});

export const GetEmployeeByIdSchema = z.object({
  id: z.number().int().positive(),
});

export const DeleteEmployeeSchema = z.object({
  id: z.number().int().positive(),
});

// ---------------------------------------------------------------------------
// Type Exports
// ---------------------------------------------------------------------------

export type CreateEmployeeStep1Input = z.infer<
  typeof CreateEmployeeStep1Schema
>;
export type UpdateEmployeeStep1Input = z.infer<
  typeof UpdateEmployeeStep1Schema
>;
export type UpdateEmployeeStep2Input = z.infer<
  typeof UpdateEmployeeStep2Schema
>;
export type UpdateEmployeeStep3Input = z.infer<
  typeof UpdateEmployeeStep3Schema
>;
export type UpdateEmployeeStep4Input = z.infer<
  typeof UpdateEmployeeStep4Schema
>;
export type UpdateEmployeeStep5Input = z.infer<
  typeof UpdateEmployeeStep5Schema
>;
export type ListEmployeesParamsInput = z.infer<
  typeof ListEmployeesParamsSchema
>;
export type GetEmployeeByIdInput = z.infer<typeof GetEmployeeByIdSchema>;
export type DeleteEmployeeInput = z.infer<typeof DeleteEmployeeSchema>;
