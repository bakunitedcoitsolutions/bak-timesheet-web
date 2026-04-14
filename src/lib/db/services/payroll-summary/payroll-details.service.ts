import { prisma } from "@/lib/db/prisma";
import {
  GetPayrollReportInput,
  SavePayrollDetailsBatchInput,
} from "./payroll-summary.schemas";
import { getServerAccessContext } from "@/lib/auth/helpers";
import type { GetPayrollDetailsParams } from "./payroll-summary.dto";
import { mapPayrollDetailToEntry, PayrollDetailEntry } from "./mappers";

export const getPayrollDetails = async (
  params: GetPayrollDetailsParams
): Promise<{ details: PayrollDetailEntry[]; total: number }> => {
  const {
    payrollId,
    year,
    month,
    branchId,
    designationId,
    payrollSectionId,
    search,
    page = 1,
    limit = 1000,
  } = params;
  const { isBranchScoped, userBranchId } = await getServerAccessContext();

  const where: any = {};

  if (!designationId && !payrollSectionId) {
    throw new Error(
      "Either designationId or payrollSectionId must be provided"
    );
  }

  if (payrollId) {
    where.payrollId = payrollId;
  } else if (year && month) {
    where.payrollYear = year;
    where.payrollMonth = month;
  } else {
    // This case should ideally not be reached if types are strict, but good for runtime safety
    throw new Error("PayrollId is required");
  }

  if (isBranchScoped) {
    where.branchId = userBranchId;
  } else if (branchId) {
    where.branchId = branchId;
  }

  if (designationId) {
    where.employee = { ...where.employee, designationId };
  }

  if (payrollSectionId) {
    where.employee = { ...where.employee, payrollSectionId };
  }

  if (search) {
    const searchNum = parseFloat(search);

    const orConditions: any[] = [
      { employee: { nameEn: { contains: search, mode: "insensitive" } } },
      { employee: { nameAr: { contains: search, mode: "insensitive" } } },
      { employee: { idCardNo: { contains: search, mode: "insensitive" } } },
      { remarks: { contains: search, mode: "insensitive" } },
    ];

    if (Number.isInteger(searchNum)) {
      orConditions.push({ employee: { employeeCode: searchNum } });

      // If it's a number (employee code search), we should avoid all other filters
      // regardless of designation or payroll sections.
      // We keep the top-level payroll boundaries though (payrollId, branchId)
      if (where.employee && where.employee.designationId) {
        delete where.employee.designationId;
      }
      if (where.employee && where.employee.payrollSectionId) {
        delete where.employee.payrollSectionId;
      }

      // If employee object is now empty, clean it up
      if (where.employee && Object.keys(where.employee).length === 0) {
        delete where.employee;
      }
    }

    where.OR = orConditions;
  }

  const [details, total] = await Promise.all([
    prisma.payrollDetails.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        employee: {
          employeeCode: "asc",
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            isDeductable: true,
            isFixed: true,
            isCardDelivered: true,
            nameEn: true,
            nameAr: true,
            designationId: true,
            idCardNo: true,
            profession: true,
            passportNo: true,
            passportExpiryDate: true,
            joiningDate: true,
            iban: true,
            bankCode: true,
            gender: true,
            nationality: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
              },
            },
            designation: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
              },
            },
          },
        },
        payrollSummary: {
          select: {
            payrollStatusId: true,
          },
        },
        paymentMethod: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
          },
        },
      },
    }),
    prisma.payrollDetails.count({ where }),
  ]);

  return {
    details: details.map((d: any) => mapPayrollDetailToEntry(d)),
    total,
  };
};

/**
 * Save multiple payroll detail entries.
 * Processes entries in batches, each batch in its own transaction.
 */
export const savePayrollDetailsBatch = async (
  input: SavePayrollDetailsBatchInput
): Promise<{ saved: number }> => {
  const { entries } = input;
  const batchSize = 50;
  let saved = 0;

  const { isBranchScoped, userBranchId } = await getServerAccessContext();

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await prisma.$transaction(
      async (tx) => {
        for (const entry of batch) {
          const { id, ...data } = entry;

          // Prepare update data, only including defined fields
          const updateData: any = {};
          if (data.loanDeduction !== undefined && data.loanDeduction !== null)
            updateData.loanDeduction = data.loanDeduction;

          if (
            data.challanDeduction !== undefined &&
            data.challanDeduction !== null
          )
            updateData.challanDeduction = data.challanDeduction;

          if (data.cardSalary !== undefined && data.cardSalary !== null)
            updateData.cardSalary = data.cardSalary;

          if (data.cashSalary !== undefined && data.cashSalary !== null)
            updateData.cashSalary = data.cashSalary;

          if (data.remarks !== undefined) updateData.remarks = data.remarks;

          if (data.paymentMethodId !== undefined)
            updateData.paymentMethodId = data.paymentMethodId;

          if (
            data.payrollStatusId !== undefined &&
            data.payrollStatusId !== null
          )
            updateData.payrollStatusId = data.payrollStatusId;

          if (
            data.netSalaryPayable !== undefined &&
            data.netSalaryPayable !== null
          )
            updateData.netSalaryPayable = data.netSalaryPayable;

          if (data.netLoan !== undefined && data.netLoan !== null)
            updateData.netLoan = data.netLoan;

          if (data.netChallan !== undefined && data.netChallan !== null)
            updateData.netChallan = data.netChallan;

          if (data.tripAllowance !== undefined && data.tripAllowance !== null)
            updateData.tripAllowance = data.tripAllowance;

          if (
            data.overtimeAllowance !== undefined &&
            data.overtimeAllowance !== null
          )
            updateData.overtimeAllowance = data.overtimeAllowance;

          if (data.salary !== undefined && data.salary !== null)
            updateData.salary = data.salary;

          if (
            data.totalAllowances !== undefined &&
            data.totalAllowances !== null
          )
            updateData.totalAllowances = data.totalAllowances;

          if (Object.keys(updateData).length > 0) {
            await tx.payrollDetails.update({
              where: {
                id,
                ...(isBranchScoped ? { branchId: userBranchId } : {}),
              },
              data: updateData,
            });
          }
          saved++;
        }
      },
      {
        timeout: 20000,
      }
    );
  }

  return { saved };
};

/**
 * Get payroll report data from payroll details for a given month/year.
 * Grouped by payroll section name for display.
 */
export const getPayrollReport = async (
  params: GetPayrollReportInput
): Promise<{ details: PayrollDetailEntry[]; total: number }> => {
  const {
    month,
    year,
    payrollSectionIds,
    designationId,
    employeeCodes,
    paymentMethodId,
  } = params;
  const { isBranchScoped, userBranchId } = await getServerAccessContext();

  const where: any = {
    payrollYear: year,
    payrollMonth: month,
    ...(isBranchScoped ? { branchId: userBranchId } : {}),
  };

  const employeeFilter: any = {};

  if (payrollSectionIds && payrollSectionIds.length > 0)
    employeeFilter.payrollSectionId = { in: payrollSectionIds };
  if (designationId) employeeFilter.designationId = designationId;
  if (employeeCodes && employeeCodes.length > 0)
    employeeFilter.employeeCode = { in: employeeCodes };

  if (Object.keys(employeeFilter).length > 0) {
    where.employee = employeeFilter;
  }

  if (paymentMethodId) where.paymentMethodId = paymentMethodId;

  const details = await prisma.payrollDetails.findMany({
    where,
    orderBy: [
      { employee: { payrollSection: { displayOrderKey: "asc" } } },
      { employee: { employeeCode: "asc" } },
    ],
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          isDeductable: true,
          isFixed: true,
          isCardDelivered: true,
          nameEn: true,
          nameAr: true,
          designationId: true,
          idCardNo: true,
          profession: true,
          passportNo: true,
          passportExpiryDate: true,
          joiningDate: true,
          iban: true,
          bankCode: true,
          gender: true,
          payrollSectionId: true,
          payrollSection: {
            select: { id: true, nameEn: true, displayOrderKey: true },
          },
          nationality: { select: { id: true, nameEn: true, nameAr: true } },
          designation: { select: { id: true, nameEn: true, nameAr: true } },
        },
      },
      payrollSummary: { select: { payrollStatusId: true } },
      paymentMethod: {
        select: { id: true, nameEn: true, nameAr: true },
      },
    },
  });

  const mapped = details.map((d: any) => ({
    ...mapPayrollDetailToEntry(d),
    sectionName: d.employee?.payrollSection?.nameEn ?? "Unassigned",
    sectionOrder: d.employee?.payrollSection?.displayOrderKey ?? 9999,
  }));

  return { details: mapped, total: mapped.length };
};
