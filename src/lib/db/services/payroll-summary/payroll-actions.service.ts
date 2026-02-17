import { prisma } from "@/lib/db/prisma";
import {
  RunPayrollInput,
  RepostPayrollInput,
  UpdateMonthlyPayrollValuesInput,
} from "./payroll-summary.schemas";
import { AllowanceType } from "../../../../../prisma/generated/prisma/enums";

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
  statusId: number,
  allowanceNotAvailableId?: number | null
) => {
  // Common dates
  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);

  // Previous Month
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // 1. Fetch Allowance Exclusion Rule
  let exclusionData: {
    type: AllowanceType;
    startDate: Date;
    endDate: Date;
  } | null = null;
  if (allowanceNotAvailableId) {
    const exclusion = await prisma.allowanceNotAvailable.findUnique({
      where: { id: allowanceNotAvailableId },
    });
    if (exclusion) {
      exclusionData = exclusion;
    }
  }

  // 2. Fetch Active Employees
  const employees = await prisma.employee.findMany({
    where: {
      statusId: 1, // Active Only as per user request
    },
    include: {
      designation: true,
    },
  });

  const employeeIds = employees.map((e) => e.id);

  // 3. Fetch Timesheets (Strict Date Range)
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 4. Fetch Loans (Strict Date Range)
  const loans = await prisma.loan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 5. Fetch Traffic Challans (Strict Date Range)
  const trafficChallans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // 6. Fetch Previous Payroll Details (Closing Balances)
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
      loanDeduction: true,
      challanDeduction: true,
    },
  });

  const previousPayrollMap = new Map(
    previousPayrolls.map((p) => [
      p.employeeId,
      {
        netLoan: Number(p.netLoan || 0),
        netChallan: Number(p.netChallan || 0),
        loanDeduction: Number(p.loanDeduction || 0),
        challanDeduction: Number(p.challanDeduction || 0),
      },
    ])
  );

  // 7. Calculate Details
  const payrollDetailsData = employees.map((emp) => {
    // A. Timesheet Aggregation
    const empTimesheets = timesheets.filter((t) => t.employeeId === emp.id);
    let totalDutyHours = 0; // Project 1 + Project 2
    let totalOTHours = 0; // OT 1 + OT 2
    let totalHours = 0; // Duty + OT
    const workedDaysSet = new Set<string>();

    // Breakfast Calculation Vars
    let breakfastAllowanceCount = 0;
    const designationHours = emp.designation?.hoursPerDay || 0;

    empTimesheets.forEach((t) => {
      const p1 = t.project1Hours || 0;
      const p2 = t.project2Hours || 0;
      const p1OT = t.project1Overtime || 0;
      const p2OT = t.project2Overtime || 0;

      const duty = p1 + p2;
      const ot = p1OT + p2OT;
      const dayTotal = duty + ot;

      totalDutyHours += duty;
      totalOTHours += ot;
      totalHours += dayTotal;

      if (dayTotal > 0) {
        workedDaysSet.add(t.date.toISOString().split("T")[0]);
      }

      // Breakfast Allowance Validations
      // Condition 1: Employee check
      if (emp.breakfastAllowance) {
        // Condition 2: Not in Exclusion Date Check
        let isExcludedDate = false;
        if (exclusionData && exclusionData.type === "BREAKFAST") {
          if (
            t.date >= exclusionData.startDate &&
            t.date <= exclusionData.endDate
          ) {
            isExcludedDate = true;
          }
        }

        const isFriday = t.date.getDay() === 5;
        // Condition 3: Project 1 Hours must equal Designation Hours
        // Note: Strict equality might be tricky with floats, but schema says Int.
        const isFullDay = p1 === designationHours;

        if (!isExcludedDate && !isFriday && isFullDay) {
          breakfastAllowanceCount++;
        }
      }
    });

    // Total Breakfast Allowance
    let totalBreakfastAllowance = breakfastAllowanceCount * 10;

    // Working Days
    let workDays = 0;
    if (designationHours > 0) {
      workDays = totalHours / designationHours;
    }

    // B. Other Allowances (Fixed)
    // "Calculate the Allowances Other than Breakfast (Mobile + Food + Other)"
    const foodAllowance = Number(emp.foodAllowance || 0);
    const mobileAllowance = Number(emp.mobileAllowance || 0);
    const otherAllowance = Number(emp.otherAllowance || 0);
    const fixedAllowances = foodAllowance + mobileAllowance + otherAllowance;

    const totalAllowances = totalBreakfastAllowance + fixedAllowances;

    // C. Total Salary (Base)
    let hourlyRate = Number(emp.hourlyRate || 0);
    let baseSalary = 0;

    if (emp.isFixed && !emp.isDeductable) {
      // Fixed Non Deductible: hourlyRate * designationHours * 30 + Allowance
      // Note: usually fixed salary comes from `emp.salary`.
      // But prompt says: `hourlyRate * (hoursPerDay) * 30`.
      baseSalary = hourlyRate * designationHours * 30;
    } else {
      // Non Fixed (Hourly)
      baseSalary = hourlyRate * totalHours;
    }

    const totalSalary = baseSalary + totalAllowances;

    // D. Loans / Advance
    const prevDetails = previousPayrollMap.get(emp.id);

    // "Previous Advance" logic
    // Default: LastPayroll.netLoan + OpeningBalance
    const previousLoanBalance =
      prevDetails && prevDetails.netLoan
        ? prevDetails.netLoan + Number(emp.openingBalance || 0)
        : Number(emp.openingBalance || 0);

    const currentMonthLoans = loans
      .filter((l) => l.employeeId === emp.id && l.type === "LOAN")
      .reduce((sum, l) => sum + Number(l.amount), 0);

    const currentMonthReturns = loans
      .filter((l) => l.employeeId === emp.id && l.type === "RETURN")
      .reduce((sum, l) => sum + Number(l.amount), 0);

    const currentNetLoan = currentMonthLoans - currentMonthReturns;

    // Total Debt to Recover
    const totalLoanDebt = previousLoanBalance + currentNetLoan;

    // Deduction: Full Recovery
    const loanDeduction = totalLoanDebt; // As per instructions "Deduction Advance... + Net Advance"

    const netLoan = 0; // fully deducted

    // E. Traffic Challans
    const previousChallanBalance = prevDetails ? prevDetails.netChallan : 0;

    const currentMonthChallans = trafficChallans
      .filter((c) => c.employeeId === emp.id && c.type === "CHALLAN")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const currentMonthChallanReturns = trafficChallans
      .filter((c) => c.employeeId === emp.id && c.type === "RETURN")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const currentNetChallan = currentMonthChallans - currentMonthChallanReturns;

    const totalChallanDebt = previousChallanBalance + currentNetChallan;
    const challanDeduction = totalChallanDebt;
    const netChallan = 0;

    // F. Net Salary Payable
    const netSalaryPayable = totalSalary - loanDeduction - challanDeduction;

    return {
      payrollId,
      payrollMonth,
      payrollYear,
      employeeId: emp.id,
      workDays: Number(workDays.toFixed(2)),
      totalHours: Number(totalHours.toFixed(2)),
      hourlyRate: Number(hourlyRate.toFixed(2)),
      breakfastAllowance: Number(totalBreakfastAllowance.toFixed(2)),
      otherAllowances: Number(fixedAllowances.toFixed(2)),
      totalAllowances: Number(totalAllowances.toFixed(2)),
      salary: Number(totalSalary.toFixed(2)), // Gross Salary
      previousLoan: Number(previousLoanBalance.toFixed(2)),
      currentLoan: Number(currentNetLoan.toFixed(2)),
      loanDeduction: Number(loanDeduction.toFixed(2)),
      netLoan: Number(netLoan.toFixed(2)),
      previousChallan: Number(previousChallanBalance.toFixed(2)),
      currentChallan: Number(currentNetChallan.toFixed(2)),
      challanDeduction: Number(challanDeduction.toFixed(2)),
      netChallan: Number(netChallan.toFixed(2)),
      netSalaryPayable: Number(netSalaryPayable.toFixed(2)),
      cardSalary: 0,
      cashSalary: 0,
      overTime: Number(totalOTHours.toFixed(2)),
      remarks: "",
      payrollStatusId: statusId,
      branchId: emp.branchId,
      payrollSectionId: emp.payrollSectionId,
      allowanceNotAvailableId: allowanceNotAvailableId || null,
    };
  });

  // Calculate Aggregates
  const totals = payrollDetailsData.reduce(
    (acc, curr) => ({
      totalSalary: acc.totalSalary + curr.salary,
      totalBreakfastAllowance:
        acc.totalBreakfastAllowance + curr.breakfastAllowance,
      totalOtherAllowances: acc.totalOtherAllowances + curr.otherAllowances,
      totalPreviousLoan: acc.totalPreviousLoan + curr.previousLoan,
      totalCurrentLoan: acc.totalCurrentLoan + curr.currentLoan,
      totalLoanDeduction: acc.totalLoanDeduction + curr.loanDeduction,
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

  // Save Details
  if (payrollDetailsData.length > 0) {
    await prisma.payrollDetails.createMany({
      data: payrollDetailsData,
    });
  }

  // Update Summary
  return await prisma.payrollSummary.update({
    where: { id: payrollId },
    data: {
      ...totals,
      payrollStatusId: statusId,
    },
  });
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

export const runPayroll = async ({
  payrollYear,
  payrollMonth,
  allowanceNotAvailableId,
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
    1,
    allowanceNotAvailableId
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
