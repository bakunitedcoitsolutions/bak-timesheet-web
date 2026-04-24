import { prisma } from "@/lib/db/prisma";
import { LeaveEligibilityReport, MonthlyWorkingDays, LeaveCycle } from "./leave-eligibility.dto";
import dayjs from "@/lib/dayjs";

export const getLeaveEligibilityReport = async (
  employeeCode: number
): Promise<LeaveEligibilityReport> => {
  // Step 1: Check Employee Status
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    include: {
      status: true,
      designation: true,
      nationality: true,
      exitReentries: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const statusName = employee.status?.nameEn || "Unknown";
  const designationHours = employee.designation?.hoursPerDay || 0;
  const gender = (employee.gender || "Male").toLowerCase();
  const pronoun = gender === "male" ? "He" : "She";
  const pronounSmall = gender === "male" ? "he" : "she";

  // Reconstruct all working cycles
  const allCycles: { start: dayjs.Dayjs; end: dayjs.Dayjs | null }[] = [];
  
  // 1. Process all EXIT records to find completed cycles
  employee.exitReentries.forEach((er) => {
    if (er.type === "EXIT") {
      // Find the most recent ENTRY before this EXIT
      const precedingEntry = employee.exitReentries
        .filter(e => e.type === "ENTRY" && dayjs(e.date).isBefore(dayjs(er.date)))
        .pop();
      
      const start = precedingEntry 
        ? dayjs(precedingEntry.date) 
        : (employee.joiningDate ? dayjs(employee.joiningDate) : dayjs(er.date).startOf('year'));
      
      allCycles.push({ start, end: dayjs(er.date) });
    }
  });

  // 2. Add the Current/Most Recent cycle if Active
  const isActive = statusName === "Active";
  if (isActive) {
    // Current cycle starts at lastEntryDate or latest ENTRY record
    const latestEntry = employee.exitReentries
      .filter(e => e.type === "ENTRY")
      .pop();
    
    const start = employee.lastEntryDate 
      ? dayjs(employee.lastEntryDate) 
      : (latestEntry ? dayjs(latestEntry.date) : (employee.joiningDate ? dayjs(employee.joiningDate) : dayjs("2026-01-01")));
    
    // Ensure we don't add a cycle that was already closed by an EXIT
    const alreadyClosed = allCycles.some(c => c.start.isSame(start, 'day'));
    if (!alreadyClosed) {
      allCycles.push({ start, end: null });
    }
  }

  // 3. Fallback: If no cycles found at all
  if (allCycles.length === 0) {
    const start = employee.lastEntryDate ? dayjs(employee.lastEntryDate) : (employee.joiningDate ? dayjs(employee.joiningDate) : dayjs("2026-01-01"));
    allCycles.push({ start, end: isActive ? null : (employee.lastExitDate ? dayjs(employee.lastExitDate) : dayjs()) });
  }

  // Fetch all timesheets once
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: employee.id,
    },
    orderBy: { date: "asc" },
  });

  // Helper to calculate stats for a date range
  const calculateStats = (start: dayjs.Dayjs, end: dayjs.Dayjs | null) => {
    const monthlyStatsMap = new Map<string, number>();
    let totalWorkingDays = 0;

    timesheets.forEach((ts) => {
      const tsDate = dayjs(ts.date);
      
      // Strict range check
      if (tsDate.isBefore(start, 'day')) return;
      if (end && tsDate.isAfter(end, 'day')) return;

      const totalHours =
        (ts.project1Hours || 0) +
        (ts.project1Overtime || 0) +
        (ts.project2Hours || 0) +
        (ts.project2Overtime || 0);

      if (totalHours >= designationHours && designationHours > 0) {
        const monthKey = tsDate.format("MMMM YYYY");
        monthlyStatsMap.set(monthKey, (monthlyStatsMap.get(monthKey) || 0) + 1);
        totalWorkingDays += 1;
      }
    });

    const monthlyStats: MonthlyWorkingDays[] = Array.from(monthlyStatsMap.entries()).map(
      ([month, workingDays]) => ({ month, workingDays })
    );

    return { monthlyStats, totalWorkingDays };
  };

  // Process all cycles
  const processedCycles: LeaveCycle[] = allCycles.map((cycle, index) => {
    const { monthlyStats, totalWorkingDays } = calculateStats(cycle.start, cycle.end);
    
    // Calculate eligibility status for the most recent cycle
    let eligibilityStatus = undefined;
    if (index === allCycles.length - 1) {
        let isEligible = false;
        let eligibilityMessage = "";
        let extraDays = 0;
        let remainingDays = 0;

        if (statusName === "Vacation") {
            const lastExit = employee.exitReentries.filter(er => er.type === 'EXIT').pop();
            const exitDateStr = lastExit ? dayjs(lastExit.date).format("DD-MM-YYYY") : "unknown date";
            eligibilityMessage = `Employee has already gone on vacation on ${exitDateStr}`;
            isEligible = false;
        } else if (statusName !== "Active") {
            eligibilityMessage = `Employee status is ${statusName}, so ${pronounSmall} is not eligible for vacation`;
            isEligible = false;
        } else {
            if (totalWorkingDays >= 624) {
                isEligible = true;
                extraDays = totalWorkingDays - 624;
                eligibilityMessage = `Employee is eligible for vacation. ${pronoun} has exceeded eligibility by ${extraDays} days.`;
            } else {
                isEligible = false;
                remainingDays = 624 - totalWorkingDays;
                eligibilityMessage = `Employee is not eligible for vacation. ${remainingDays} day(s) remaining.`;
            }
        }

        eligibilityStatus = {
            isEligible,
            message: eligibilityMessage,
            extraDays: extraDays > 0 ? extraDays : undefined,
            remainingDays: remainingDays > 0 ? remainingDays : undefined,
        };
    }

    return {
      startDate: cycle.start.format("DD-MM-YYYY"),
      endDate: cycle.end ? cycle.end.format("DD-MM-YYYY") : null,
      monthlyStats,
      totalWorkingDays,
      eligibilityStatus,
    };
  });

  // Display logic
  const currentCycle = isActive ? processedCycles.find(c => c.endDate === null) : null;
  const previousCycles = isActive 
    ? processedCycles.filter(c => c !== currentCycle).reverse()
    : [...processedCycles].reverse();

  return {
    employee: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      nameEn: employee.nameEn,
      nameAr: employee.nameAr,
      status: statusName,
      designation: employee.designation?.nameEn || "",
      designationHours: designationHours,
      idCardNo: employee.idCardNo,
      nationalityCode: employee.nationality?.nameEn || null,
      gender: employee.gender,
      lastExitDate: employee.lastExitDate ? dayjs(employee.lastExitDate).format("DD-MM-YYYY") : null,
      lastEntryDate: employee.lastEntryDate ? dayjs(employee.lastEntryDate).format("DD-MM-YYYY") : null,
    },
    eligibilityStatus: (isActive && currentCycle) 
      ? (currentCycle.eligibilityStatus || { isEligible: false, message: "N/A" })
      : { isEligible: false, message: processedCycles[processedCycles.length - 1]?.eligibilityStatus?.message || `Employee status is ${statusName}` },
    monthlyStats: (isActive && currentCycle) ? currentCycle.monthlyStats : [],
    totalWorkingDays: (isActive && currentCycle) ? currentCycle.totalWorkingDays : 0,
    startDate: (isActive && currentCycle) ? currentCycle.startDate : "",
    previousCycles: previousCycles,
  };
};
