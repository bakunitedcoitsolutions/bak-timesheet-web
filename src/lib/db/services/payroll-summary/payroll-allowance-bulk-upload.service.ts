import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { isTruckHouseSection } from "@/utils/helpers/payroll";
import type {
  BulkUploadPayrollAllowanceData,
  BulkUploadPayrollAllowanceResult,
} from "./payroll-allowance-bulk-upload.dto";

/**
 * Bulk upload trip and overtime allowances for payroll details.
 * Looks up each row by payrollId + employeeCode, updates the allowances,
 * recalculates totalAllowances and salary, and returns a detailed per-row report
 * with before/after values.
 */
export const bulkUploadPayrollAllowances = async (
  data: BulkUploadPayrollAllowanceData
): Promise<BulkUploadPayrollAllowanceResult> => {
  const user = await getCurrentUser();
  const userId = user?.id;

  const result: BulkUploadPayrollAllowanceResult = {
    success: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    const rowNumber = i + 1;

    try {
      // Validate that at least one allowance value is provided
      if (
        row.tripAllowance === undefined &&
        row.overtimeAllowance === undefined
      ) {
        result.skipped++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          status: "skipped",
          message: "No allowance values provided",
        });
        continue;
      }

      // Find the payroll detail by payrollId + employeeCode
      const payrollDetail = await prisma.payrollDetails.findFirst({
        where: {
          payrollId: data.payrollId,
          employee: {
            employeeCode: row.employeeCode,
          },
        },
        select: {
          id: true,
          tripAllowance: true,
          overtimeAllowance: true,
          breakfastAllowance: true,
          otherAllowances: true,
          totalAllowances: true,
          salary: true,
          employee: {
            select: {
              payrollSectionId: true,
            },
          },
        },
      });

      if (!payrollDetail) {
        result.failed++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          status: "failed",
          message: `Employee code ${row.employeeCode} not found in this payroll`,
        });
        continue;
      }

      if (!isTruckHouseSection(payrollDetail.employee?.payrollSectionId)) {
        result.failed++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          status: "failed",
          message: `Employee code ${row.employeeCode} does not belong to any truck house section`,
        });
        continue;
      }

      const oldTripAllowance = payrollDetail.tripAllowance || 0;
      const oldOvertimeAllowance = payrollDetail.overtimeAllowance || 0;

      const newTripAllowance =
        row.tripAllowance !== undefined ? row.tripAllowance : oldTripAllowance;
      const newOvertimeAllowance =
        row.overtimeAllowance !== undefined
          ? row.overtimeAllowance
          : oldOvertimeAllowance;

      // Check if anything actually changed
      const tripChanged = newTripAllowance !== oldTripAllowance;
      const overtimeChanged = newOvertimeAllowance !== oldOvertimeAllowance;

      if (!tripChanged && !overtimeChanged) {
        result.skipped++;
        result.details.push({
          row: rowNumber,
          employeeCode: row.employeeCode,
          status: "skipped",
          message: "No changes detected (values are the same)",
        });
        continue;
      }

      // Recalculate totalAllowances
      const newTotalAllowances =
        (payrollDetail.breakfastAllowance || 0) +
        (payrollDetail.otherAllowances || 0) +
        newTripAllowance +
        newOvertimeAllowance;

      // Recalculate salary: adjust by the difference in totalAllowances
      const oldTotalAllowances = payrollDetail.totalAllowances || 0;
      const allowanceDiff = newTotalAllowances - oldTotalAllowances;
      const newSalary = (payrollDetail.salary || 0) + allowanceDiff;

      // Update the payroll detail
      await prisma.payrollDetails.update({
        where: { id: payrollDetail.id },
        data: {
          tripAllowance: newTripAllowance,
          overtimeAllowance: newOvertimeAllowance,
          totalAllowances: newTotalAllowances,
          salary: newSalary,
          ...(userId && { updatedBy: userId }),
        },
      });

      // Build message with before/after values
      const changes: string[] = [];
      if (tripChanged) {
        changes.push(
          `Trip Allowance: ${oldTripAllowance} → ${newTripAllowance}`
        );
      }
      if (overtimeChanged) {
        changes.push(
          `Overtime Allowance: ${oldOvertimeAllowance} → ${newOvertimeAllowance}`
        );
      }

      result.success++;
      result.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        status: "success",
        message: changes.join(", "),
      });
    } catch (error: any) {
      result.failed++;
      result.details.push({
        row: rowNumber,
        employeeCode: row.employeeCode,
        status: "failed",
        message: error.message || "Unknown error",
      });
    }
  }

  return result;
};
