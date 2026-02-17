import { prisma } from "@/lib/db/prisma";
import type {
  GetPayrollDetailsParams,
  PayrollDetailWithRelations,
} from "./payroll-summary.dto";
import { convertDecimalToNumber } from "@/lib/db/utils";

export const getPayrollDetails = async (
  params: GetPayrollDetailsParams
): Promise<{ details: PayrollDetailWithRelations[]; total: number }> => {
  const {
    year,
    month,
    branchId,
    designationId,
    payrollSectionId,
    search,
    page = 1,
    limit = 1000,
  } = params;

  const where: any = {
    payrollYear: year,
    payrollMonth: month,
  };

  if (branchId) {
    where.branchId = branchId;
  }

  if (designationId) {
    where.employee = { ...where.employee, designationId };
  }

  if (payrollSectionId) {
    where.payrollSectionId = payrollSectionId;
  }

  if (search) {
    const searchInt = parseInt(search);
    if (!isNaN(searchInt)) {
      where.employee = {
        ...where.employee,
        OR: [
          { employeeCode: searchInt },
          { nameEn: { contains: search, mode: "insensitive" } },
          { nameAr: { contains: search, mode: "insensitive" } },
        ],
      };
    } else {
      where.employee = {
        ...where.employee,
        OR: [
          { nameEn: { contains: search, mode: "insensitive" } },
          { nameAr: { contains: search, mode: "insensitive" } },
        ],
      };
    }
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
    details: details.map((d) => ({
      id: d.id,
      employeeId: d.employeeId,
      payrollMonth: d.payrollMonth,
      payrollYear: d.payrollYear,
      workDays: d.workDays,
      totalHours: convertDecimalToNumber(d.totalHours) || 0,
      hourlyRate: convertDecimalToNumber(d.hourlyRate) || 0,
      allowance: convertDecimalToNumber(d.totalAllowances) || 0,
      salary: convertDecimalToNumber(d.salary) || 0, // Total Salary
      previousLoan: convertDecimalToNumber(d.previousLoan) || 0,
      currentLoan: convertDecimalToNumber(d.currentLoan) || 0,
      deductionLoan: convertDecimalToNumber(d.loanDeduction) || 0,
      previousTrafficChallan: convertDecimalToNumber(d.previousChallan) || 0,
      currentTrafficChallan: convertDecimalToNumber(d.currentChallan) || 0,
      deductionTrafficChallan: convertDecimalToNumber(d.challanDeduction) || 0,
      netSalaryPayable: convertDecimalToNumber(d.netSalaryPayable) || 0,
      cardSalary: convertDecimalToNumber(d.cardSalary) || 0,
      cashSalary: convertDecimalToNumber(d.cashSalary) || 0,
      overTime: convertDecimalToNumber(d.overTime) || 0,
      employee: d.employee as any,
    })),
    total,
  };
};
