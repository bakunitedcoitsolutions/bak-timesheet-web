import { prisma } from "@/lib/db/prisma";
import { GetSalarySlipDataInput } from "./payroll-summary.schemas";
import { mapPayrollDetailToEntry, PayrollDetailEntry } from "./mappers";

const getMonthDateRange = (year: number, month: number) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

/**
 * Returns salary slip data for a given month.
 *
 * Strategy:
 *  1. Resolve target employees from filters (designationId | payrollSectionId | employeeCodes).
 *  2. Look for saved PayrollDetails for those employees in that month.
 *  3. If all found → return mapped entries from DB.
 *  4. If any missing → calculate payroll on-the-fly (NO DB writes) and return.
 */
export const getSalarySlipData = async (
  input: GetSalarySlipDataInput
): Promise<PayrollDetailEntry[]> => {
  const {
    payrollYear,
    payrollMonth,
    designationId,
    payrollSectionId,
    employeeCodes,
  } = input;

  const { startDate, endDate } = getMonthDateRange(payrollYear, payrollMonth);

  // ── 1. Resolve target employees ──────────────────────────────────────────
  const employeeWhere: any = { statusId: 1 };

  if (employeeCodes && employeeCodes.length > 0) {
    employeeWhere.employeeCode = { in: employeeCodes };
  } else {
    if (designationId) employeeWhere.designationId = designationId;
    if (payrollSectionId) employeeWhere.payrollSectionId = payrollSectionId;
  }

  const employees = await prisma.employee.findMany({
    where: employeeWhere,
    include: { designation: true },
    orderBy: { employeeCode: "asc" },
  });

  if (employees.length === 0) return [];

  const employeeIds = employees.map((e) => e.id);

  // ── 2. Check for saved PayrollDetails for this month ─────────────────────
  const PAYROLL_DETAIL_INCLUDE = {
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
    payrollSummary: { select: { payrollStatusId: true } },
  } as const;

  const savedDetails = await prisma.payrollDetails.findMany({
    where: {
      payrollYear,
      payrollMonth,
      employeeId: { in: employeeIds },
    },
    include: PAYROLL_DETAIL_INCLUDE,
    orderBy: { employee: { employeeCode: "asc" } },
  });

  // If every target employee has a saved record → return DB data
  const savedEmployeeIds = new Set(savedDetails.map((d) => d.employeeId));
  const allSaved = employees.every((e) => savedEmployeeIds.has(e.id));

  if (allSaved && savedDetails.length > 0) {
    return savedDetails.map((d: any) => mapPayrollDetailToEntry(d));
  }

  // ── 3. On-the-fly calculation (no DB writes) ──────────────────────────────
  let prevMonth = payrollMonth - 1;
  let prevYear = payrollYear;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }

  // Fetch all source data in bulk
  const [timesheets, loans, challans, prevDetails] = await Promise.all([
    prisma.timesheet.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: startDate, lte: endDate },
      },
    }),
    prisma.loan.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: startDate, lte: endDate },
      },
    }),
    prisma.trafficChallan.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: { gte: startDate, lte: endDate },
      },
    }),
    prisma.payrollDetails.findMany({
      where: {
        payrollMonth: prevMonth,
        payrollYear: prevYear,
        employeeId: { in: employeeIds },
      },
      select: { employeeId: true, netLoan: true, netChallan: true },
    }),
  ]);

  const prevMap = new Map(
    prevDetails.map((p) => [
      p.employeeId,
      {
        netLoan: Number(p.netLoan || 0),
        netChallan: Number(p.netChallan || 0),
      },
    ])
  );

  // Build a map of saved details keyed by employeeId (partial saves)
  const savedMap = new Map(savedDetails.map((d) => [d.employeeId, d]));

  const results: PayrollDetailEntry[] = [];

  for (const emp of employees) {
    // If this employee has a saved record, use it
    if (savedMap.has(emp.id)) {
      results.push(mapPayrollDetailToEntry(savedMap.get(emp.id) as any));
      continue;
    }

    const empTimesheets = timesheets.filter((t) => t.employeeId === emp.id);
    const empLoans = loans.filter((l) => l.employeeId === emp.id);
    const empChallans = challans.filter((c) => c.employeeId === emp.id);

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
      totalDutyHours += duty;
      totalOTHours += ot;
      totalHours += duty + ot;

      if (emp.breakfastAllowance) {
        const isFriday = t.date.getDay() === 5;
        const isFullDay = p1 === designationHours;
        if (!isFriday && isFullDay) breakfastAllowanceCount++;
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

    const prevData = prevMap.get(emp.id);
    const previousLoanBalance = prevData?.netLoan
      ? prevData.netLoan + Number(emp.openingAdvanceBalance || 0)
      : Number(emp.openingAdvanceBalance || 0);
    const currentNetLoan =
      empLoans
        .filter((l) => l.type === "LOAN")
        .reduce((s, l) => s + Number(l.amount), 0) -
      empLoans
        .filter((l) => l.type === "RETURN")
        .reduce((s, l) => s + Number(l.amount), 0);
    const loanDeduction = 0;
    const netLoan = previousLoanBalance + currentNetLoan;

    const previousChallanBalance = prevData?.netChallan
      ? prevData.netChallan + Number(emp.openingTrafficViolationBalance || 0)
      : Number(emp.openingTrafficViolationBalance || 0);
    const currentNetChallan =
      empChallans
        .filter((c) => c.type === "CHALLAN")
        .reduce((s, c) => s + Number(c.amount), 0) -
      empChallans
        .filter((c) => c.type === "RETURN")
        .reduce((s, c) => s + Number(c.amount), 0);
    const challanDeduction = 0;
    const netChallan = previousChallanBalance + currentNetChallan;

    const netSalaryPayable = totalSalary - loanDeduction - challanDeduction;

    // Build a synthetic PayrollDetailEntry (no DB id — use employeeId as placeholder)
    const entry: PayrollDetailEntry = {
      id: emp.id, // synthetic — no real PayrollDetails row
      empCode: emp.employeeCode.toString(),
      name: emp.nameEn,
      arabicName: emp.nameAr || "",
      designation: emp.designation?.nameEn || "",
      idNumber: (emp as any).idCardNo || "",
      nationality: "",
      professionInId: (emp as any).profession || "",
      passportNumber: (emp as any).passportNo || "",
      passportExpiryDate: (emp as any).passportExpiryDate
        ? new Date((emp as any).passportExpiryDate).toLocaleDateString()
        : "",
      joiningDate: (emp as any).joiningDate
        ? new Date((emp as any).joiningDate).toLocaleDateString()
        : "",
      iban: (emp as any).iban || "",
      bankCode: (emp as any).bankCode || "",
      workDays: Math.round(workDays),
      overTime: Number(totalOTHours.toFixed(0)),
      totalHours: Number(totalHours.toFixed(0)),
      hourlyRate: Number(hourlyRate.toFixed(2)),
      breakfastAllowance: Number(totalBreakfastAllowance.toFixed(0)),
      otherAllowances: Number(fixedAllowances.toFixed(0)),
      totalAllowances: Number(totalAllowances.toFixed(0)),
      totalSalary: Number(totalSalary.toFixed(0)),
      previousAdvance: Number(previousLoanBalance.toFixed(0)),
      currentAdvance: Number(currentNetLoan.toFixed(0)),
      loanDeduction: Number(loanDeduction.toFixed(0)),
      netLoan,
      previousChallan: Number(previousChallanBalance.toFixed(0)),
      currentChallan: Number(currentNetChallan.toFixed(0)),
      challanDeduction: Number(challanDeduction.toFixed(0)),
      netChallan,
      netSalaryPayable: Number(netSalaryPayable.toFixed(0)),
      cardSalary: Number(netSalaryPayable.toFixed(0)),
      cashSalary: 0,
      remarks: "",
      paymentMethodId: null,
      payrollStatusId: 1,
      isLocked: false,
      gender: (emp as any).gender || "",
      payrollSummaryStatusId: 1,
      isFixed: emp.isFixed,
      isDeductable: emp.isDeductable,
      isCardDelivered: emp.isCardDelivered,
    };

    results.push(entry);
  }

  return results;
};
