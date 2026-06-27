/**
 * Bulk Update Service for Employees
 * Handles bulk updating employee records by employee code
 */

import type {
  BulkUpdateEmployeeData,
  BulkUpdateEmployeeResult,
} from "./employee.dto";
import dayjs from "@/lib/dayjs";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";

// Type helper for Prisma transaction client
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

/**

 * Helper function to normalize date strings to Date objects
 */
const normalizeDate = (date: Date | string | undefined): Date | null => {
  if (!date) return null;
  if (date instanceof Date) return date;

  if (
    typeof date === "string" &&
    !date.includes("T") &&
    !date.includes("Z") &&
    !date.includes(":")
  ) {
    const parsed = new Date(`${date} UTC`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.toDate() : null;
};

// Fields that are date type in the DB
const DATE_FIELDS = [
  "dob",
  "contractStartDate",
  "contractEndDate",
  "joiningDate",
  "idCardExpiryDate",
  "passportExpiryDate",
];

// Fields that are numeric (int or decimal) in the DB
const NUMERIC_FIELDS = [
  "workingDays",
  "salary",
  "hourlyRate",
  "foodAllowance",
  "mobileAllowance",
  "otherAllowance",
  "gosiSalary",
];

// Fields that are boolean in the DB
const BOOLEAN_FIELDS = [
  "isFixed",
  "isDeductable",
  "breakfastAllowance",
  "isCardDelivered",
];

// Fields that are linked (ID) and should be integers
const LINKED_ID_FIELDS = [
  "countryId",
  "cityId",
  "statusId",
  "branchId",
  "subBranchId",
  "designationId",
  "payrollSectionId",
  "nationalityId",
  "gosiCityId",
];

// All valid updatable Prisma fields
const VALID_FIELDS = new Set([
  "nameEn",
  "nameAr",
  "dob",
  "phone",
  "gender",
  "countryId",
  "cityId",
  "statusId",
  "branchId",
  "subBranchId",
  "designationId",
  "payrollSectionId",
  "isDeductable",
  "isFixed",
  "workingDays",
  "hourlyRate",
  "salary",
  "breakfastAllowance",
  "foodAllowance",
  "mobileAllowance",
  "otherAllowance",
  "contractStartDate",
  "contractEndDate",
  "contractDocument",
  "contractEndReason",
  "joiningDate",
  "idCardNo",
  "idCardExpiryDate",
  "idCardDocument",
  "profession",
  "nationalityId",
  "passportNo",
  "passportExpiryDate",
  "passportDocument",
  "bankName",
  "bankCode",
  "iban",
  "gosiSalary",
  "gosiCityId",
  "isCardDelivered",
  "cardDocument",
  "profilePicture",
]);

/**
 * Helper to build update data from a row, converting types appropriately
 */
const buildUpdateData = (row: any) => {
  const updateData: Record<string, any> = {};

  for (const [key, value] of Object.entries(row)) {
    if (key === "employeeCode") continue; // Skip the lookup key
    if (!VALID_FIELDS.has(key)) continue; // Skip unknown fields

    // Handle empty / blank values — skip them
    if (value === "" || value === null || value === undefined) continue;

    if (DATE_FIELDS.includes(key)) {
      updateData[key] = normalizeDate(value as string | Date | undefined);
    } else if (NUMERIC_FIELDS.includes(key)) {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid numeric value for ${key}: "${value}"`);
      }
      updateData[key] = num;
    } else if (BOOLEAN_FIELDS.includes(key)) {
      if (typeof value === "boolean") {
        updateData[key] = value;
      } else {
        const strVal = String(value).toLowerCase().trim();
        updateData[key] =
          strVal === "true" || strVal === "yes" || strVal === "1";
      }
    } else if (LINKED_ID_FIELDS.includes(key)) {
      const id = Number(value);
      if (isNaN(id) || id <= 0) {
        throw new Error(`Invalid ID value for ${key}: "${value}"`);
      }
      updateData[key] = id;
    } else {
      // String fields
      let strVal = String(value);
      if (key === "phone" && !strVal.startsWith("0")) {
        strVal = "0" + strVal;
      }
      updateData[key] = strVal;
    }
  }

  return updateData;
};

/**
 * Bulk update employees by employee code
 * Each row must contain an employeeCode, and only provided fields will be updated.
 */
export const bulkUpdateEmployees = async (
  data: BulkUpdateEmployeeData
): Promise<BulkUpdateEmployeeResult> => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const res: BulkUpdateEmployeeResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    details: [],
    errors: [],
  };

  for (let i = 0; i < data.employees.length; i++) {
    const row = data.employees[i];
    const rowNumber = i + 1;

    try {
      await prisma.$transaction(async (tx: PrismaTransactionClient) => {
        // Find employee by employeeCode
        const employee = await tx.employee.findUnique({
          where: { employeeCode: row.employeeCode },
          select: { id: true },
        });

        if (!employee) {
          throw new Error(`Employee with code ${row.employeeCode} not found`);
        }

        // Build update data from only valid fields
        const updateData = buildUpdateData(row);

        if (Object.keys(updateData).length === 0) {
          throw new Error("No valid fields to update");
        }

        // Apply the update
        await tx.employee.update({
          where: { id: employee.id },
          data: {
            ...updateData,
            ...(userId && { updatedBy: userId }),
          },
        });
      });

      res.success++;
      res.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        status: "success",
        message: "Updated successfully",
      });
    } catch (error: any) {
      console.error(error);
      res.failed++;
      res.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        status: "failed",
        message: error.message || "Unknown error",
      });
      res.errors.push({
        row: rowNumber,
        data: row,
        error: error.message || "Unknown error",
      });
    }
  }

  return res;
};
