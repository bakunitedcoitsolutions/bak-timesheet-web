import { prisma } from "@/lib/db/prisma";
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

  if (branchId) {
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
      { remarks: { contains: search, mode: "insensitive" } },
    ];

    if (Number.isInteger(searchNum)) {
      orConditions.push({ employee: { employeeCode: searchNum } });
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
      },
    }),
    prisma.payrollDetails.count({ where }),
  ]);

  return {
    details: details.map((d: any) => mapPayrollDetailToEntry(d)),
    total,
  };
};
