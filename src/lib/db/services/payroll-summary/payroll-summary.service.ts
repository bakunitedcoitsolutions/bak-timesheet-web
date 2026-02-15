/**
 * Payroll Summary Service
 * Business logic for payroll summary operations
 */

import { prisma } from "@/lib/db/prisma";
import type {
  GetPayrollSummaryByYearParams,
  PayrollSummaryWithRelations,
} from "./payroll-summary.dto";
import {
  RunPayrollInput,
  RepostPayrollInput,
  UpdateMonthlyPayrollValuesInput,
} from "./payroll-summary.schemas";
import { convertDecimalToNumber } from "@/lib/db/utils";

// Reusable select object
const payrollSummarySelect = {
  id: true,
  payrollMonth: true,
  payrollYear: true,
  totalSalary: true,
  totalBreakfastAllowance: true,
  totalOtherAllowances: true,
  totalPreviousLoan: true, // Corrected from totalPreviousAdvance
  totalCurrentLoan: true, // Corrected from totalCurrentAdvance
  totalLoanDeduction: true, // Corrected from totalDeduction
  totalNetLoan: true,
  totalPreviousChallan: true,
  totalCurrentChallan: true,
  totalChallanDeduction: true,
  totalNetChallan: true,
  totalNetSalaryPayable: true,
  totalCardSalary: true,
  totalCashSalary: true,
  remarks: true,
  payrollStatusId: true,
  branchId: true,
  createdDate: true,
  createdBy: true,
  modifiedDate: true,
  modifiedBy: true,
  payrollStatus: {
    select: {
      id: true,
      nameEn: true,
    },
  },
  branch: {
    select: {
      id: true,
      nameEn: true,
    },
  },
};

/**
 * Get payroll summaries by year
 */
export const getPayrollSummariesByYear = async (
  params: GetPayrollSummaryByYearParams
): Promise<PayrollSummaryWithRelations[]> => {
  const { year, branchId } = params;

  const where: any = {
    payrollYear: year,
  };

  if (branchId) {
    where.branchId = branchId;
  }

  const summaries = await prisma.payrollSummary.findMany({
    where,
    orderBy: {
      payrollMonth: "asc",
    },
    select: payrollSummarySelect,
  });

  return summaries.map((summary) => ({
    ...summary,
    totalSalary: convertDecimalToNumber(summary.totalSalary) || 0,
    totalPreviousAdvance:
      convertDecimalToNumber(summary.totalPreviousLoan) || 0, // Map DB totalPreviousLoan to DTO totalPreviousAdvance
    totalCurrentAdvance: convertDecimalToNumber(summary.totalCurrentLoan) || 0, // Map DB totalCurrentLoan to DTO totalCurrentAdvance
    totalDeduction: convertDecimalToNumber(summary.totalLoanDeduction) || 0, // Map DB totalLoanDeduction to DTO totalDeduction
    totalNetLoan: convertDecimalToNumber(summary.totalNetLoan) || 0,
    totalNetSalaryPayable:
      convertDecimalToNumber(summary.totalNetSalaryPayable) || 0,
    totalCardSalary: convertDecimalToNumber(summary.totalCardSalary) || 0,
    totalCashSalary: convertDecimalToNumber(summary.totalCashSalary) || 0,
  }));
};

/**
 * Update monthly payroll values (Recalculate / Post)
 */
export const updateMonthlyPayrollValues = async (
  input: UpdateMonthlyPayrollValuesInput
) => {
  const { payrollYear, payrollMonth, isPosted } = input;

  // 1. Fetch all details for the month/year
  const payrollDetails = await prisma.payrollDetails.findMany({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  // 2. Calculate sums
  const totalSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.salary) || 0),
    0
  );
  const totalBreakfastAllowance = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.breakfastAllowance) || 0),
    0
  );
  const totalOtherAllowances = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.otherAllowances) || 0),
    0
  );

  const totalPreviousLoan = payrollDetails.reduce(
    // Corrected variable
    (sum, d) => sum + (Number(d.previousLoan) || 0),
    0
  );
  const totalCurrentLoan = payrollDetails.reduce(
    // Corrected variable
    (sum, d) => sum + (Number(d.currentLoan) || 0),
    0
  );
  const totalLoanDeduction = payrollDetails.reduce(
    // Corrected variable
    (sum, d) => sum + (Number(d.loanDeduction) || 0),
    0
  );
  const totalNetLoan = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.netLoan) || 0),
    0
  );

  const totalPreviousChallan = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.previousChallan) || 0),
    0
  );
  const totalCurrentChallan = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.currentChallan) || 0),
    0
  );
  const totalChallanDeduction = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.challanDeduction) || 0),
    0
  );
  const totalNetChallan = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.netChallan) || 0),
    0
  );

  const totalNetSalaryPayable = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.netSalaryPayable) || 0),
    0
  );
  const totalCardSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.cardSalary) || 0),
    0
  );
  const totalCashSalary = payrollDetails.reduce(
    (sum, d) => sum + (Number(d.cashSalary) || 0),
    0
  );

  // 3. Find summary
  let payrollSummary = await prisma.payrollSummary.findFirst({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  const payrollData = {
    payrollYear,
    payrollMonth,
    totalSalary,
    totalBreakfastAllowance,
    totalOtherAllowances,
    totalPreviousLoan, // Corrected field
    totalCurrentLoan, // Corrected field
    totalLoanDeduction, // Corrected field
    totalNetLoan,
    totalPreviousChallan,
    totalCurrentChallan,
    totalChallanDeduction,
    totalNetChallan,
    totalNetSalaryPayable,
    totalCardSalary,
    totalCashSalary,
    ...(isPosted ? { payrollStatusId: 3 } : {}),
  };

  if (payrollSummary) {
    payrollSummary = await prisma.payrollSummary.update({
      where: { id: payrollSummary.id },
      data: payrollData,
    });
  } else {
    payrollSummary = await prisma.payrollSummary.create({
      data: {
        ...payrollData,
        payrollStatusId: isPosted ? 3 : 1,
      },
    });
  }

  return payrollSummary;
};

// Helper to getting start/end of month
const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

// --- Helper: Shared Calculation Logic ---
const calculateAndSavePayroll = async (
  payrollId: number,
  payrollYear: number,
  payrollMonth: number,
  statusId: number
) => {
  // Calculate Previous Period
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Fetch related data for calculations
  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);

  // Fetch Timesheets
  const timesheets = await prisma.timesheet.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Eligible Employees: Active OR Has Timesheets
  const employeesWithTimesheets = new Set(timesheets.map((t) => t.employeeId));

  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { statusId: 1 }, // Active
        { id: { in: Array.from(employeesWithTimesheets) } }, // Inactive/Vacation but has records
      ],
    },
    include: {
      designation: true,
    },
  });

  // Fetch Loans & Challans (Current Month)
  const employeeIds = employees.map((e) => e.id);

  const loans = await prisma.loan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const trafficChallans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Fetch Previous PayrollDetails
  const previousPayrolls = await prisma.payrollDetails.findMany({
    where: {
      payrollMonth: prevMonth,
      payrollYear: prevYear,
      employeeId: { in: employeeIds },
    },
    select: {
      employeeId: true,
      netLoan: true,
      netChallan: true,
    },
  });

  const previousPayrollMap = new Map(
    previousPayrolls.map((p) => [
      p.employeeId,
      {
        netLoan: Number(p.netLoan || 0),
        netChallan: Number(p.netChallan || 0),
      },
    ])
  );

  // Calculate Details
  const payrollDetailsData = employees.map((emp) => {
    // Timesheet Stats
    const empTimesheets = timesheets.filter((t) => t.employeeId === emp.id);
    let totalDutyHours = 0;
    let totalOTHours = 0;
    let totalHours = 0;
    const workedDaysSet = new Set<string>();

    empTimesheets.forEach((t) => {
      const p1 = t.project1Hours || 0;
      const p2 = t.project2Hours || 0;
      const p1OT = t.project1Overtime || 0;
      const p2OT = t.project2Overtime || 0;
      const dayTotal = p1 + p2 + p1OT + p2OT;
      const duty = p1 + p2;

      totalDutyHours += duty;
      totalOTHours += p1OT + p2OT;
      totalHours += dayTotal;

      if (dayTotal > 0) {
        workedDaysSet.add(t.date.toISOString().split("T")[0]);
      }
    });

    let workDays = workedDaysSet.size;

    // Breakfast Allowance (Flags)
    let calculatedFoodAllowance = 0;
    // empTimesheets.forEach((t) => {
    //   if (t.project1BfAllowance) calculatedFoodAllowance += 10;
    //   if (t.project2BfAllowance) calculatedFoodAllowance += 10;
    // });

    // Salary Logic (Fixed vs Hourly)
    let hourlyRate = Number(emp.hourlyRate || 0);
    let baseSalary = 0;

    if (emp.isFixed) {
      const salary = Number(emp.salary || 0);
      const dailyRate = Math.round(salary / 30);
      hourlyRate = dailyRate;

      if (emp.isDeductable) {
        // Deductable: Timesheet Days + All Fridays in current month
        let payableDays = 0;
        const tempD = new Date(startDate);
        while (tempD <= endDate) {
          const dayStr = tempD.toISOString().split("T")[0];
          const isFriday = tempD.getDay() === 5;
          if (isFriday || workedDaysSet.has(dayStr)) {
            payableDays++;
          }
          tempD.setDate(tempD.getDate() + 1);
        }
        workDays = payableDays;
        baseSalary = payableDays * dailyRate;
      } else {
        // Non-Deductable: Fixed 30 days
        workDays = 30;
        baseSalary = salary;
      }
    } else {
      // Hourly
      baseSalary = hourlyRate * totalHours;
    }

    // Allowances
    const fixedAllowances =
      Number(emp.foodAllowance || 0) +
      Number(emp.mobileAllowance || 0) +
      Number(emp.otherAllowance || 0);
    const totalAllowances = fixedAllowances + calculatedFoodAllowance;
    const totalSalary = baseSalary + totalAllowances;

    // Loan Balance
    const prevDetails = previousPayrollMap.get(emp.id);
    const previousAdvance = prevDetails
      ? Number(prevDetails.netLoan || 0)
      : Number(emp.openingBalance || 0);

    const currentAdvance = loans
      .filter((l) => l.employeeId === emp.id)
      .reduce((sum, l) => {
        const amt = Number(l.amount);
        return l.type === "LOAN" ? sum + amt : sum - amt;
      }, 0);

    const loanDeduction = 0;
    const netLoan = previousAdvance + currentAdvance - loanDeduction;

    // Traffic Challan Balance
    const previousChallan = prevDetails
      ? Number(prevDetails.netChallan || 0)
      : 0;

    const currentChallan = trafficChallans
      .filter((c) => c.employeeId === emp.id)
      .reduce((sum, c) => {
        const amt = Number(c.amount);
        return c.type === "CHALLAN" ? sum + amt : sum - amt;
      }, 0);

    const challanDeduction = 0;
    const netChallan = previousChallan + currentChallan - challanDeduction;

    // Net Payable
    const netSalaryPayable = totalSalary - loanDeduction - challanDeduction;

    return {
      payrollId,
      payrollMonth,
      payrollYear,
      employeeId: emp.id,
      workDays,
      totalHours,
      hourlyRate,
      breakfastAllowance: 0,
      otherAllowances: fixedAllowances,
      totalAllowances,
      salary: totalSalary,
      previousLoan: previousAdvance,
      currentLoan: currentAdvance,
      loanDeduction,
      netLoan,
      previousChallan,
      currentChallan,
      challanDeduction,
      netChallan,
      netSalaryPayable,
      cardSalary: 0,
      cashSalary: 0,
      overTime: totalOTHours,
      remarks: "",
      payrollStatusId: statusId,
      branchId: emp.branchId,
      payrollSectionId: emp.payrollSectionId,
    };
  });

  // Save Data
  if (payrollDetailsData.length > 0) {
    await prisma.payrollDetails.createMany({
      data: payrollDetailsData,
    });
  }

  // Update Summary Totals
  const totals = payrollDetailsData.reduce(
    (acc, curr) => ({
      totalSalary: acc.totalSalary + curr.salary,
      totalBreakfastAllowance:
        acc.totalBreakfastAllowance + curr.breakfastAllowance,
      totalOtherAllowances: acc.totalOtherAllowances + curr.otherAllowances,

      // Fix reduce accumulators for Loan
      totalPreviousLoan: acc.totalPreviousLoan + curr.previousLoan, // WAS totalPreviousAdvance incorrectly used as key
      totalCurrentLoan: acc.totalCurrentLoan + curr.currentLoan, // WAS totalCurrentAdvance
      totalLoanDeduction: acc.totalLoanDeduction + curr.loanDeduction, // WAS totalDeduction

      totalNetLoan: acc.totalNetLoan + curr.netLoan,
      totalPreviousChallan: acc.totalPreviousChallan + curr.previousChallan,
      totalCurrentChallan: acc.totalCurrentChallan + curr.currentChallan,
      totalChallanDeduction: acc.totalChallanDeduction + curr.challanDeduction,
      totalNetChallan: acc.totalNetChallan + curr.netChallan,
      totalNetSalaryPayable: acc.totalNetSalaryPayable + curr.netSalaryPayable,
      totalCardSalary: acc.totalCardSalary + curr.cardSalary,
      totalCashSalary: acc.totalCashSalary + curr.cashSalary,
    }),
    {
      totalSalary: 0,
      totalBreakfastAllowance: 0,
      totalOtherAllowances: 0,

      // Fix initial accumulator keys
      totalPreviousLoan: 0,
      totalCurrentLoan: 0,
      totalLoanDeduction: 0,

      totalNetLoan: 0,
      totalPreviousChallan: 0,
      totalCurrentChallan: 0,
      totalChallanDeduction: 0,
      totalNetChallan: 0,
      totalNetSalaryPayable: 0,
      totalCardSalary: 0,
      totalCashSalary: 0,
    }
  );

  return await prisma.payrollSummary.update({
    where: { id: payrollId },
    data: {
      ...totals,
      payrollStatusId: statusId,
    },
  });
};

export const runPayroll = async ({
  payrollYear,
  payrollMonth,
}: RunPayrollInput) => {
  // 1. Check if there is any active payroll (Pending)
  const activePayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollStatusId: 1, // Pending
    },
  });

  if (activePayroll) {
    throw new Error(
      "There is active payroll, you cannot run the payroll when there is an active payroll"
    );
  }

  // 2. Check if payroll already exists
  const existingPayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  if (existingPayroll) {
    throw new Error(
      `Payroll for the month of ${payrollMonth}/${payrollYear} has already been generated!`
    );
  }

  // 1. Create Empty Payroll Summary (Status 1: Pending)
  const newPayroll = await prisma.payrollSummary.create({
    data: {
      payrollYear,
      payrollMonth,
      payrollStatusId: 1, // Pending
      totalSalary: 0,
      totalBreakfastAllowance: 0,
      totalOtherAllowances: 0,

      // Corrected Fields for Create
      totalPreviousLoan: 0,
      totalCurrentLoan: 0,
      totalLoanDeduction: 0,

      totalNetLoan: 0,
      totalPreviousChallan: 0,
      totalCurrentChallan: 0,
      totalChallanDeduction: 0,
      totalNetChallan: 0,
      totalNetSalaryPayable: 0,
      totalCardSalary: 0,
      totalCashSalary: 0,
    },
  });

  // 2. Calculate and Save
  return await calculateAndSavePayroll(
    newPayroll.id,
    payrollYear,
    payrollMonth,
    1
  );
};

export const repostPayroll = async ({ id }: RepostPayrollInput) => {
  // Check if there is any active payroll (Pending) that is NOT this one
  const activePayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollStatusId: 1, // Pending
    },
  });

  if (activePayroll) {
    throw new Error(
      "There is active payroll, you cannot run the payroll when there is an active payroll"
    );
  }

  // Verify it exists
  const existingPayroll = await prisma.payrollSummary.findUnique({
    where: {
      id,
    },
  });

  if (!existingPayroll) {
    throw new Error(`Payroll with ID ${id} not found!`);
  }

  const { payrollYear, payrollMonth } = existingPayroll;

  // 1. Delete Existing Details
  await prisma.payrollDetails.deleteMany({
    where: {
      payrollId: existingPayroll.id,
    },
  });

  // 2. Recalculate (Status 4: Revision)
  return await calculateAndSavePayroll(
    existingPayroll.id,
    payrollYear,
    payrollMonth,
    4
  );
};

// --- Get Payroll Details for Salary Slips ---
import {
  GetPayrollDetailsParams,
  PayrollDetailWithRelations,
} from "./payroll-summary.dto";

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
