import { prisma } from "@/lib/db/prisma";
import {
  RunPayrollInput,
  PostPayrollInput,
  RepostPayrollInput,
  RefreshPayrollDetailRowInput,
  RecalculatePayrollSummaryInput,
  UpdateMonthlyPayrollValuesInput,
} from "./payroll-summary.schemas";
import dayjs from "dayjs";
import { mapPayrollDetailToEntry } from "./mappers";
import { AllowanceType } from "../../../../../prisma/generated/prisma/enums";

// Helper to getting start/end of month
const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

// Helper to determine how net salary is split between card and cash
const getSalarySplit = (
  netSalaryPayable: number,
  existingCard: number = 0,
  existingCash: number = 0
) => {
  const netSal = Number(netSalaryPayable);
  let cardSalary: number;
  let cashSalary: number;

  if (existingCard > 0 && existingCash === 0) {
    // Card only — all goes to card
    cardSalary = netSal;
    cashSalary = 0;
  } else if (existingCash > 0 && existingCard === 0) {
    // Cash only — all goes to cash
    cashSalary = netSal;
    cardSalary = 0;
  } else if (existingCard > 0 && existingCash > 0) {
    // Both — cash stays the same, card = net - cash
    cashSalary = existingCash;
    cardSalary = netSal - existingCash;
  } else {
    // Fallback or new record — default to card
    cardSalary = netSal;
    cashSalary = 0;
  }

  return { cardSalary, cashSalary };
};

// --- Helper: Shared Calculation Logic ---
const calculateAndSavePayroll = async (
  payrollId: number,
  payrollYear: number,
  payrollMonth: number,
  statusId: number,
  allowanceNotAvailableId?: number | null
) => {
  console.log(
    `[calculateAndSavePayroll] Starting — payrollId=${payrollId}, year=${payrollYear}, month=${payrollMonth}, statusId=${statusId}, allowanceNotAvailableId=${allowanceNotAvailableId ?? "none"}`
  );

  // Common dates
  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);
  console.log(
    `[calculateAndSavePayroll] Date range: ${startDate.toISOString()} → ${endDate.toISOString()}`
  );

  // Previous Month
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // 1. Fetch Allowance Exclusion Rule
  console.log(
    `[calculateAndSavePayroll] Step 1: Fetching Allowance Exclusion Rule...`
  );
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
  console.log(
    `[calculateAndSavePayroll] Step 1 done: exclusionData=${exclusionData ? `type=${exclusionData.type}, ${exclusionData.startDate.toISOString()} → ${exclusionData.endDate.toISOString()}` : "none"}`
  );

  // 2. Fetch Active Employees
  console.log(`[calculateAndSavePayroll] Step 2: Fetching active employees...`);
  const employees = await prisma.employee.findMany({
    where: {
      statusId: 1, // Active Only as per user request
    },
    include: {
      designation: true,
    },
  });
  console.log(
    `[calculateAndSavePayroll] Step 2 done: Found ${employees.length} active employee(s).`
  );

  const employeeIds = employees.map((e) => e.id);

  // 3. Fetch Timesheets (Strict Date Range)
  console.log(
    `[calculateAndSavePayroll] Step 3: Fetching timesheets for ${startDate.toISOString()} → ${endDate.toISOString()}...`
  );
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  console.log(
    `[calculateAndSavePayroll] Step 3 done: Found ${timesheets.length} timesheet record(s).`
  );

  // 4. Fetch Loans (Strict Date Range)
  console.log(`[calculateAndSavePayroll] Step 4: Fetching loans...`);
  const loans = await prisma.loan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  console.log(
    `[calculateAndSavePayroll] Step 4 done: Found ${loans.length} loan record(s).`
  );

  // 5. Fetch Traffic Challans (Strict Date Range)
  console.log(`[calculateAndSavePayroll] Step 5: Fetching traffic challans...`);
  const trafficChallans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
  console.log(
    `[calculateAndSavePayroll] Step 5 done: Found ${trafficChallans.length} traffic challan record(s).`
  );

  // 6. Fetch Previous Payroll Details (Closing Balances)
  console.log(
    `[calculateAndSavePayroll] Step 6: Fetching previous payroll details for ${prevMonth}/${prevYear}...`
  );
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
  console.log(
    `[calculateAndSavePayroll] Step 6 done: Found ${previousPayrolls.length} previous payroll detail record(s).`
  );

  const previousPayrollMap = new Map(
    previousPayrolls.map((p) => [
      p.employeeId,
      {
        netLoan: Number(p.netLoan || 0),
        netChallan: Number(p.netChallan || 0),
      },
    ])
  );

  // 7. Calculate Details
  console.log(
    `[calculateAndSavePayroll] Step 7: Calculating payroll details for ${employees.length} employee(s)...`
  );
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
          const tTime = dayjs(t.date).startOf("day");
          const startTime = dayjs(exclusionData.startDate).startOf("day");
          const endTime = dayjs(exclusionData.endDate).startOf("day");
          if (
            tTime.valueOf() >= startTime.valueOf() &&
            tTime.valueOf() <= endTime.valueOf()
          ) {
            isExcludedDate = true;
          }
        }

        const isFriday = dayjs(t.date).day() === 5;
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
    const workDays =
      designationHours > 0
        ? Math.min(totalDutyHours / designationHours, 31)
        : 0;

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
    // Default: LastPayroll.netLoan
    const previousLoanBalance =
      prevDetails && prevDetails.netLoan ? prevDetails.netLoan : 0;

    if (Number(emp.employeeCode) === 20007) {
      console.log("prevDetails ==> ", prevDetails?.netLoan);
      console.log("prevMonth ==> ", prevMonth);
      console.log("prevYear ==> ", prevYear);
    }
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
    const loanDeduction = 0; // As per instructions "Deduction Advance... + Net Advance"

    const netLoan = totalLoanDebt; // fully deducted

    // E. Traffic Challans
    // "Previous Traffic Challan" logic
    // Default: LastPayroll.netLoan
    const previousChallanBalance =
      prevDetails && prevDetails.netChallan ? prevDetails.netChallan : 0;

    const currentMonthChallans = trafficChallans
      .filter((c) => c.employeeId === emp.id && c.type === "CHALLAN")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const currentMonthChallanReturns = trafficChallans
      .filter((c) => c.employeeId === emp.id && c.type === "RETURN")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const currentNetChallan = currentMonthChallans - currentMonthChallanReturns;

    const totalChallanDebt = previousChallanBalance + currentNetChallan;
    const challanDeduction = 0;
    const netChallan = totalChallanDebt;

    // F. Net Salary Payable
    const netSalaryPayable = totalSalary - loanDeduction - challanDeduction;

    return {
      payrollId,
      payrollMonth,
      payrollYear,
      employeeId: emp.id,
      workDays: Math.round(Number(workDays)),
      totalHours: Number(totalHours),
      hourlyRate: Number(hourlyRate.toFixed(2)),
      breakfastAllowance: Number(totalBreakfastAllowance),
      otherAllowances: Number(fixedAllowances),
      totalAllowances: Number(totalAllowances),
      salary: Number(totalSalary), // Gross Salary
      previousLoan: Number(previousLoanBalance),
      currentLoan: Number(currentNetLoan),
      loanDeduction: Number(loanDeduction),
      netLoan: Number(netLoan),
      previousChallan: Number(previousChallanBalance),
      currentChallan: Number(currentNetChallan),
      challanDeduction: Number(challanDeduction),
      netChallan: Number(netChallan),
      netSalaryPayable: Number(netSalaryPayable),
      ...getSalarySplit(netSalaryPayable),
      overTime: Number(totalOTHours),
      remarks: "",
      payrollStatusId: statusId,
      branchId: emp.branchId,
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
  console.log(
    `[calculateAndSavePayroll] Step 8: Saving ${payrollDetailsData.length} PayrollDetail record(s)...`
  );
  if (payrollDetailsData.length > 0) {
    await prisma.payrollDetails.createMany({
      data: payrollDetailsData,
    });
  }
  console.log(`[calculateAndSavePayroll] Step 8 done: PayrollDetails saved.`);

  // Update Summary
  console.log(
    `[calculateAndSavePayroll] Step 9: Updating PayrollSummary (id=${payrollId})...`
  );
  const updatedSummary = await prisma.payrollSummary.update({
    where: { id: payrollId },
    data: {
      ...totals,
      payrollStatusId: statusId,
    },
  });
  console.log(
    `[calculateAndSavePayroll] Step 9 done: PayrollSummary updated. calculateAndSavePayroll finished.`
  );
  return updatedSummary;
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
    totalPreviousLoan,
    totalCurrentLoan,
    totalLoanDeduction,
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
  console.log(
    `[runPayroll] Starting — year=${payrollYear}, month=${payrollMonth}, allowanceNotAvailableId=${allowanceNotAvailableId ?? "none"}`
  );

  // 1. Check if there is any active payroll (Pending)
  console.log(
    `[runPayroll] Step 1: Checking for an active (Pending) payroll...`
  );
  const activePayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollStatusId: 1, // Pending
    },
  });

  if (activePayroll) {
    console.log(
      `[runPayroll] Step 1 failed: Active payroll found (id=${activePayroll.id}). Aborting.`
    );
    throw new Error(
      "There is active payroll, you cannot run the payroll when there is an active payroll"
    );
  }
  console.log(`[runPayroll] Step 1 passed: No active payroll found.`);

  // 2. Check if payroll already exists
  console.log(
    `[runPayroll] Step 2: Checking if payroll already exists for ${payrollMonth}/${payrollYear}...`
  );
  const existingPayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollYear,
      payrollMonth,
    },
  });

  if (existingPayroll) {
    console.log(
      `[runPayroll] Step 2 failed: Payroll already exists (id=${existingPayroll.id}). Aborting.`
    );
    throw new Error(
      `Payroll for the month of ${payrollMonth}/${payrollYear} has already been generated!`
    );
  }
  console.log(`[runPayroll] Step 2 passed: No existing payroll found.`);

  // 3. Create Empty Payroll Summary (Status 1: Pending)
  console.log(`[runPayroll] Step 3: Creating empty PayrollSummary record...`);
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
  console.log(
    `[runPayroll] Step 3 done: PayrollSummary created with id=${newPayroll.id}.`
  );

  // 4. Calculate and Save
  console.log(`[runPayroll] Step 4: Calling calculateAndSavePayroll...`);
  const result = await calculateAndSavePayroll(
    newPayroll.id,
    payrollYear,
    payrollMonth,
    1,
    allowanceNotAvailableId
  );
  console.log(
    `[runPayroll] Step 4 done: runPayroll completed successfully for payrollId=${newPayroll.id}.`
  );
  return result;
};

export const repostPayroll = async ({
  id,
  designationId,
  payrollSectionId,
}: RepostPayrollInput) => {
  // Check if there is any active payroll (Pending) that is NOT this one
  const activePayroll = await prisma.payrollSummary.findFirst({
    where: {
      payrollStatusId: 1, // Pending
      NOT: { id }, // exclude the payroll being reposted
    },
  });

  if (activePayroll) {
    throw new Error(
      "There is an active payroll, you cannot repost while another payroll is active"
    );
  }

  // Verify it exists
  const existingPayroll = await prisma.payrollSummary.findUnique({
    where: { id },
  });

  if (!existingPayroll) {
    throw new Error(`Payroll with ID ${id} not found!`);
  }

  const { payrollYear, payrollMonth } = existingPayroll;
  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);

  // Previous month
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Fetch existing detail rows keyed by employeeId so we can update in-place
  const existingDetails = await prisma.payrollDetails.findMany({
    where: { payrollId: id },
  });
  const existingDetailMap = new Map(
    existingDetails.map((d) => [d.employeeId, d])
  );

  // Derive the allowanceNotAvailableId from existing rows (it's stored per detail, not on the summary)
  const allowanceNotAvailableId =
    existingDetails.find((d) => d.allowanceNotAvailableId != null)
      ?.allowanceNotAvailableId ?? null;

  // Fetch allowance exclusion rule
  let exclusionData: {
    type: AllowanceType;
    startDate: Date;
    endDate: Date;
  } | null = null;
  if (allowanceNotAvailableId) {
    const exclusion = await prisma.allowanceNotAvailable.findUnique({
      where: { id: allowanceNotAvailableId },
    });
    if (exclusion) exclusionData = exclusion;
  }

  // Fetch active employees matching the filter
  const employeeWhere: any = { statusId: 1 };
  if (designationId) employeeWhere.designationId = designationId;
  if (payrollSectionId) employeeWhere.payrollSectionId = payrollSectionId;

  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    include: { designation: true },
  });
  const employeeIds = employees.map((e) => e.id);

  // Fetch source data for the month
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: { gte: startDate, lte: endDate },
    },
  });
  const loans = await prisma.loan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: { gte: startDate, lte: endDate },
    },
  });
  const trafficChallans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: { in: employeeIds },
      date: { gte: startDate, lte: endDate },
    },
  });

  // Fetch previous month closing balances
  const previousPayrolls = await prisma.payrollDetails.findMany({
    where: {
      payrollMonth: prevMonth,
      payrollYear: prevYear,
      employeeId: { in: employeeIds },
    },
    select: { employeeId: true, netLoan: true, netChallan: true },
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

  // Recalculate each employee and update/create rows
  for (const emp of employees) {
    const designationHours = emp.designation?.hoursPerDay || 0;
    const empTimesheets = timesheets.filter((t) => t.employeeId === emp.id);

    let totalDutyHours = 0;
    let totalOTHours = 0;
    let totalHours = 0;
    let breakfastAllowanceCount = 0;

    empTimesheets.forEach((t) => {
      const p1 = t.project1Hours || 0;
      const p2 = t.project2Hours || 0;
      const p1OT = t.project1Overtime || 0;
      const p2OT = t.project2Overtime || 0;
      const duty = p1 + p2;
      const ot = p1OT + p2OT;
      totalDutyHours += duty;
      totalOTHours += ot;
      totalHours += duty + ot;

      if (emp.breakfastAllowance) {
        let isExcludedDate = false;
        if (exclusionData && exclusionData.type === "BREAKFAST") {
          const tTime = dayjs(t.date).startOf("day");
          const startTime = dayjs(exclusionData.startDate).startOf("day");
          const endTime = dayjs(exclusionData.endDate).startOf("day");
          if (
            tTime.valueOf() >= startTime.valueOf() &&
            tTime.valueOf() <= endTime.valueOf()
          ) {
            isExcludedDate = true;
          }
        }
        const isFriday = dayjs(t.date).day() === 5;
        if (!isExcludedDate && !isFriday && p1 === designationHours) {
          breakfastAllowanceCount++;
        }
      }
    });

    const totalBreakfastAllowance = breakfastAllowanceCount * 10;
    const workDays =
      designationHours > 0
        ? Math.min(totalDutyHours / designationHours, 31)
        : 0;

    const fixedAllowances =
      Number(emp.foodAllowance || 0) +
      Number(emp.mobileAllowance || 0) +
      Number(emp.otherAllowance || 0);
    const totalAllowances = totalBreakfastAllowance + fixedAllowances;

    const hourlyRate = Number(emp.hourlyRate || 0);
    const baseSalary =
      emp.isFixed && !emp.isDeductable
        ? hourlyRate * designationHours * 30
        : hourlyRate * totalHours;
    const totalSalary = baseSalary + totalAllowances;

    // Running loan totals (display fields)
    const prevData = previousPayrollMap.get(emp.id);
    const previousLoanBalance = prevData?.netLoan ? prevData.netLoan : 0;
    const currentNetLoan =
      loans
        .filter((l) => l.employeeId === emp.id && l.type === "LOAN")
        .reduce((s, l) => s + Number(l.amount), 0) -
      loans
        .filter((l) => l.employeeId === emp.id && l.type === "RETURN")
        .reduce((s, l) => s + Number(l.amount), 0);

    const previousChallanBalance = prevData?.netChallan
      ? prevData.netChallan
      : 0;
    const currentNetChallan =
      trafficChallans
        .filter((c) => c.employeeId === emp.id && c.type === "CHALLAN")
        .reduce((s, c) => s + Number(c.amount), 0) -
      trafficChallans
        .filter((c) => c.employeeId === emp.id && c.type === "RETURN")
        .reduce((s, c) => s + Number(c.amount), 0);

    const existingRow = existingDetailMap.get(emp.id);

    if (existingRow) {
      // Preserve user-editable fields; update only calculated ones
      const preservedLoanDeduction = Number(existingRow.loanDeduction || 0);
      const preservedChallanDeduction = Number(
        existingRow.challanDeduction || 0
      );
      const netSalaryPayable =
        totalSalary - preservedLoanDeduction - preservedChallanDeduction;
      const netSal = Number(netSalaryPayable);

      const split = getSalarySplit(
        netSal,
        Number(existingRow.cardSalary || 0),
        Number(existingRow.cashSalary || 0)
      );

      await prisma.payrollDetails.update({
        where: { id: existingRow.id },
        data: {
          workDays: Math.round(workDays),
          overTime: Number(totalOTHours),
          totalHours: Number(totalHours),
          hourlyRate: Number(hourlyRate.toFixed(2)),
          breakfastAllowance: Number(totalBreakfastAllowance),
          otherAllowances: Number(fixedAllowances),
          totalAllowances: Number(totalAllowances),
          salary: Number(totalSalary),
          previousLoan: Number(previousLoanBalance),
          currentLoan: Number(currentNetLoan),
          previousChallan: Number(previousChallanBalance),
          currentChallan: Number(currentNetChallan),
          netSalaryPayable: netSal,
          cardSalary: split.cardSalary,
          cashSalary: split.cashSalary,
          // loanDeduction, netLoan, challanDeduction, netChallan,
          // remarks, paymentMethodId, payrollStatusId preserved
        },
      });
    } else {
      // New employee — create a fresh row
      const loanDeduction = 0;
      const challanDeduction = 0;
      const netSalaryPayable = totalSalary - loanDeduction - challanDeduction;
      await prisma.payrollDetails.create({
        data: {
          payrollId: id,
          payrollMonth,
          payrollYear,
          employeeId: emp.id,
          workDays: Math.round(workDays),
          overTime: Number(totalOTHours),
          totalHours: Number(totalHours),
          hourlyRate: Number(hourlyRate.toFixed(2)),
          breakfastAllowance: Number(totalBreakfastAllowance),
          otherAllowances: Number(fixedAllowances),
          totalAllowances: Number(totalAllowances),
          salary: Number(totalSalary),
          previousLoan: Number(previousLoanBalance),
          currentLoan: Number(currentNetLoan),
          loanDeduction: Number(loanDeduction),
          netLoan: previousLoanBalance + currentNetLoan,
          previousChallan: Number(previousChallanBalance),
          currentChallan: Number(currentNetChallan),
          challanDeduction: Number(challanDeduction),
          netChallan: previousChallanBalance + currentNetChallan,
          netSalaryPayable: Number(netSalaryPayable),
          ...getSalarySplit(netSalaryPayable),
          remarks: "",
          payrollStatusId: 1, // Pending
          branchId: emp.branchId,
          allowanceNotAvailableId: allowanceNotAvailableId,
        },
      });
    }
  }

  // Set payroll status to Revision (4) and recalculate summary totals
  await prisma.payrollSummary.update({
    where: { id },
    data: { payrollStatusId: 4 },
  });

  return await recalculatePayrollSummary({ id });
};

export const postPayroll = async ({ id }: PostPayrollInput) => {
  // Reuse recalculatePayrollSummary with statusId 3 (Posted)
  await recalculatePayrollSummary({ id, statusId: 3 });

  // Update all related payroll details status to 2 (Done)
  await prisma.payrollDetails.updateMany({
    where: { payrollId: id },
    data: { payrollStatusId: 2 },
  });

  return { id };
};

export const recalculatePayrollSummary = async ({
  id,
  statusId,
}: RecalculatePayrollSummaryInput) => {
  // 1. Verify existence
  const existingPayroll = await prisma.payrollSummary.findUnique({
    where: { id },
  });

  if (!existingPayroll) {
    throw new Error(`Payroll with ID ${id} not found!`);
  }

  // 2. Fetch all details for this payroll
  const details = await prisma.payrollDetails.findMany({
    where: {
      payrollId: id,
    },
  });

  // 3. Calculate Aggregates
  const totals = details.reduce(
    (acc, curr) => ({
      totalSalary: acc.totalSalary + Number(curr.salary || 0),
      totalBreakfastAllowance:
        acc.totalBreakfastAllowance + Number(curr.breakfastAllowance || 0),
      totalOtherAllowances:
        acc.totalOtherAllowances + Number(curr.otherAllowances || 0),
      totalPreviousLoan: acc.totalPreviousLoan + Number(curr.previousLoan || 0),
      totalCurrentLoan: acc.totalCurrentLoan + Number(curr.currentLoan || 0),
      totalLoanDeduction:
        acc.totalLoanDeduction + Number(curr.loanDeduction || 0),
      totalNetLoan: acc.totalNetLoan + Number(curr.netLoan || 0),
      totalPreviousChallan:
        acc.totalPreviousChallan + Number(curr.previousChallan || 0),
      totalCurrentChallan:
        acc.totalCurrentChallan + Number(curr.currentChallan || 0),
      totalChallanDeduction:
        acc.totalChallanDeduction + Number(curr.challanDeduction || 0),
      totalNetChallan: acc.totalNetChallan + Number(curr.netChallan || 0),
      totalNetSalaryPayable:
        acc.totalNetSalaryPayable + Number(curr.netSalaryPayable || 0),
      totalCardSalary: acc.totalCardSalary + Number(curr.cardSalary || 0),
      totalCashSalary: acc.totalCashSalary + Number(curr.cashSalary || 0),
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

  // 4. Update Summary with new totals (and optional status)
  return await prisma.payrollSummary.update({
    where: { id },
    data: {
      ...totals,
      ...(statusId !== undefined ? { payrollStatusId: statusId } : {}),
    },
  });
};

/**
 * Refresh a single PayrollDetails row by re-running calculations
 * for that specific employee scoped to the payroll month/year.
 * After updating the row, the parent PayrollSummary totals are recalculated.
 */
export const refreshPayrollDetailRow = async ({
  payrollDetailId,
}: RefreshPayrollDetailRowInput) => {
  // 1. Fetch the existing PayrollDetails row with its parent summary
  const existingDetail = await prisma.payrollDetails.findUnique({
    where: { id: payrollDetailId },
    include: {
      payrollSummary: true,
      employee: {
        include: { designation: true },
      },
    },
  });

  if (!existingDetail) {
    throw new Error(`PayrollDetail with ID ${payrollDetailId} not found!`);
  }

  const { payrollMonth, payrollYear, payrollId, employee } = existingDetail;
  const emp = employee;

  if (!emp) {
    throw new Error(
      `Employee not found for PayrollDetail ID ${payrollDetailId}`
    );
  }

  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);

  // Previous month
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // 2. Fetch allowance exclusion rule (from the existing detail's reference)
  let exclusionData: {
    type: AllowanceType;
    startDate: Date;
    endDate: Date;
  } | null = null;
  if (existingDetail.allowanceNotAvailableId) {
    const exclusion = await prisma.allowanceNotAvailable.findUnique({
      where: { id: existingDetail.allowanceNotAvailableId },
    });
    if (exclusion) exclusionData = exclusion;
  }

  // 3. Timesheets
  const empTimesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: emp.id,
      date: { gte: startDate, lte: endDate },
    },
    orderBy: {
      date: "asc",
    },
  });

  // 4. Loans
  const empLoans = await prisma.loan.findMany({
    where: {
      employeeId: emp.id,
      date: { gte: startDate, lte: endDate },
    },
  });

  // 5. Traffic Challans
  const empChallans = await prisma.trafficChallan.findMany({
    where: {
      employeeId: emp.id,
      date: { gte: startDate, lte: endDate },
    },
  });

  // 6. Previous payroll closing balance
  const prevDetail = await prisma.payrollDetails.findFirst({
    where: {
      payrollMonth: prevMonth,
      payrollYear: prevYear,
      employeeId: emp.id,
    },
    select: { netLoan: true, netChallan: true },
  });

  // --- Recalculate (mirrors calculateAndSavePayroll logic) ---

  const designationHours = emp.designation?.hoursPerDay || 0;
  let totalDutyHours = 0;
  let totalOTHours = 0;
  let totalHours = 0;
  let breakfastAllowanceCount = 0;

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

    if (emp.breakfastAllowance) {
      let isExcludedDate = false;
      const tTime = dayjs(t.date).startOf("day");
      const startTime = exclusionData
        ? dayjs(exclusionData.startDate).startOf("day")
        : null;
      const endTime = exclusionData
        ? dayjs(exclusionData.endDate).startOf("day")
        : null;

      console.log(`\n--- Processing date: ${tTime.format("YYYY-MM-DD")} ---`);

      if (
        exclusionData &&
        exclusionData.type === "BREAKFAST" &&
        startTime &&
        endTime
      ) {
        console.log(
          `Checking exclusion range: >= ${startTime.format("YYYY-MM-DD")} to <= ${endTime.format("YYYY-MM-DD")}`
        );

        if (
          tTime.valueOf() >= startTime.valueOf() &&
          tTime.valueOf() <= endTime.valueOf()
        ) {
          isExcludedDate = true;
          console.log(`Date IS excluded!`);
        } else {
          console.log(`Date NOT excluded.`);
        }
      }

      const isFriday = tTime.day() === 5;
      console.log(`Is Friday? ${isFriday}`);

      const isFullDay = p1 === designationHours;
      console.log(
        `Is Full Day? ${isFullDay} (p1: ${p1}, req: ${designationHours})`
      );

      if (!isExcludedDate && !isFriday && isFullDay) {
        breakfastAllowanceCount++;
        console.log(
          `Counted +1 Breakfast! Current Total: ${breakfastAllowanceCount}`
        );
      } else {
        console.log(
          `Did NOT count Breakfast (Excluded: ${isExcludedDate}, Friday: ${isFriday}, Full Day: ${isFullDay})`
        );
      }
    }
  });

  const totalBreakfastAllowance = breakfastAllowanceCount * 10;

  const workDays =
    designationHours > 0 ? Math.min(totalDutyHours / designationHours, 31) : 0;

  const foodAllowance = Number(emp.foodAllowance || 0);
  const mobileAllowance = Number(emp.mobileAllowance || 0);
  const otherAllowance = Number(emp.otherAllowance || 0);
  const fixedAllowances = foodAllowance + mobileAllowance + otherAllowance;
  const totalAllowances = totalBreakfastAllowance + fixedAllowances;

  const hourlyRate = Number(emp.hourlyRate || 0);
  let baseSalary = 0;
  if (emp.isFixed && !emp.isDeductable) {
    baseSalary = hourlyRate * designationHours * 30;
  } else {
    baseSalary = hourlyRate * totalHours;
  }
  const totalSalary = baseSalary + totalAllowances;

  // Loans — recalculate display fields (previousLoan, currentLoan) but PRESERVE
  // the user-set loanDeduction and netLoan.
  const previousLoanBalance =
    prevDetail && prevDetail.netLoan ? Number(prevDetail.netLoan) : 0;

  const currentMonthLoans = empLoans
    .filter((l) => l.type === "LOAN")
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const currentMonthReturns = empLoans
    .filter((l) => l.type === "RETURN")
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const currentNetLoan = currentMonthLoans - currentMonthReturns;

  // Challan — recalculate display fields (previousLoan, currentLoan) but PRESERVE
  // the user-set challanDeduction and netChallan.
  const previousChallanBalance =
    prevDetail && prevDetail.netChallan ? Number(prevDetail.netChallan) : 0;
  const currentMonthChallans = empChallans
    .filter((c) => c.type === "CHALLAN")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const currentMonthChallanReturns = empChallans
    .filter((c) => c.type === "RETURN")
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const currentNetChallan = currentMonthChallans - currentMonthChallanReturns;

  // Preserved deductions (user-edited values stay intact)
  const preservedLoanDeduction = Number(existingDetail.loanDeduction || 0);
  const preservedChallanDeduction = Number(
    existingDetail.challanDeduction || 0
  );

  // netSalaryPayable is always fresh salary minus the preserved deductions
  const netSalaryPayable =
    totalSalary - preservedLoanDeduction - preservedChallanDeduction;

  // 7. Persist — update only calculated fields; preserved fields are left untouched
  await prisma.payrollDetails.update({
    where: { id: payrollDetailId },
    data: {
      // Recalculated (attendance / salary / allowance)
      workDays: Math.round(workDays),
      overTime: Number(totalOTHours),
      totalHours: Number(totalHours),
      hourlyRate: Number(hourlyRate.toFixed(2)),
      breakfastAllowance: Number(totalBreakfastAllowance),
      otherAllowances: Number(fixedAllowances),
      totalAllowances: Number(totalAllowances),
      salary: Number(totalSalary),
      // Recalculated display-only loan/challan running totals
      previousLoan: Number(previousLoanBalance),
      currentLoan: Number(currentNetLoan),
      previousChallan: Number(previousChallanBalance),
      currentChallan: Number(currentNetChallan),
      // Net salary recalculated against preserved deductions
      netSalaryPayable: Number(netSalaryPayable),
      ...getSalarySplit(
        netSalaryPayable,
        Number(existingDetail.cardSalary || 0),
        Number(existingDetail.cashSalary || 0)
      ),
      // Preserved — loanDeduction, netLoan, challanDeduction, netChallan,
      // remarks, paymentMethodId, payrollStatusId
      // are intentionally NOT updated here.
    },
  });

  // 8. Recalculate parent summary totals
  await recalculatePayrollSummary({ id: payrollId });

  // 9. Return the freshly updated row (with all relations) so the UI can
  //    immediately patch its local state without waiting for a background refetch.
  const updatedDetail = await prisma.payrollDetails.findUnique({
    where: { id: payrollDetailId },
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
          nationality: { select: { id: true, nameEn: true, nameAr: true } },
          designation: { select: { id: true, nameEn: true, nameAr: true } },
        },
      },
      payrollSummary: {
        select: { payrollStatusId: true },
      },
    },
  });

  if (!updatedDetail) {
    throw new Error(`PayrollDetail ${payrollDetailId} not found after update`);
  }

  return {
    payrollDetailId,
    payrollId,
    updatedEntry: mapPayrollDetailToEntry(updatedDetail as any),
  };
};
