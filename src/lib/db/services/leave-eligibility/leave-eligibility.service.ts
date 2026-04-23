import { prisma } from "@/lib/db/prisma";
import { LeaveEligibilityReport, MonthlyWorkingDays } from "./leave-eligibility.dto";
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
        orderBy: { date: "desc" },
        take: 1,
      },
    },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const statusName = employee.status?.nameEn || "Unknown";
  let eligibilityMessage = "";
  let isEligible = false;

  if (statusName === "Vacation") {
    const lastExitReentry = employee.exitReentries[0];
    if (lastExitReentry?.type === "EXIT") {
      const exitDate = dayjs(lastExitReentry.date).format("DD-MM-YYYY");
      eligibilityMessage = `Employee has already gone on vacation on ${exitDate}`;
    } else {
      eligibilityMessage = "Employee has already gone on vacation";
    }
    
    return {
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        nameEn: employee.nameEn,
        nameAr: employee.nameAr,
        status: statusName,
        designation: employee.designation?.nameEn || "",
        designationHours: employee.designation?.hoursPerDay || 0,
        idCardNo: employee.idCardNo,
        nationalityCode: employee.nationality?.nameEn || null,
        lastExitDate: employee.lastExitDate ? dayjs(employee.lastExitDate).format("DD-MM-YYYY") : null,
        lastEntryDate: employee.lastEntryDate ? dayjs(employee.lastEntryDate).format("DD-MM-YYYY") : null,
      },
      eligibilityStatus: {
        isEligible: false,
        message: eligibilityMessage,
      },
      monthlyStats: [],
      totalWorkingDays: 0,
      startDate: "",
    };
  }

  if (statusName !== "Active" && statusName !== "Vacation") {
    return {
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        nameEn: employee.nameEn,
        nameAr: employee.nameAr,
        status: statusName,
        designation: employee.designation?.nameEn || "",
        designationHours: employee.designation?.hoursPerDay || 0,
        idCardNo: employee.idCardNo,
        nationalityCode: employee.nationality?.nameEn || null,
        lastExitDate: employee.lastExitDate ? dayjs(employee.lastExitDate).format("DD-MM-YYYY") : null,
        lastEntryDate: employee.lastEntryDate ? dayjs(employee.lastEntryDate).format("DD-MM-YYYY") : null,
      },
      eligibilityStatus: {
        isEligible: false,
        message: `Employee status is ${statusName}, so he/she is not eligible for vacation`,
      },
      monthlyStats: [],
      totalWorkingDays: 0,
      startDate: "",
    };
  }

  // Step 2: Determine Start Date
  const startDate = employee.lastEntryDate 
    ? dayjs(employee.lastEntryDate) 
    : dayjs("2026-01-01");

  // Step 3: Get Designation Hours
  const designationHours = employee.designation?.hoursPerDay || 0;

  // Step 4: Calculate Monthly Working Days
  const timesheets = await prisma.timesheet.findMany({
    where: {
      employeeId: employee.id,
      date: {
        gte: startDate.toDate(),
      },
    },
    orderBy: { date: "asc" },
  });

  const monthlyStatsMap = new Map<string, number>();

  timesheets.forEach((ts) => {
    const totalHours = 
      (ts.project1Hours || 0) + 
      (ts.project1Overtime || 0) + 
      (ts.project2Hours || 0) + 
      (ts.project2Overtime || 0);

    if (totalHours >= designationHours && designationHours > 0) {
      const monthKey = dayjs(ts.date).format("MMMM YYYY");
      monthlyStatsMap.set(monthKey, (monthlyStatsMap.get(monthKey) || 0) + 1);
    }
  });

  const monthlyStats: MonthlyWorkingDays[] = Array.from(monthlyStatsMap.entries()).map(
    ([month, workingDays]) => ({ month, workingDays })
  );

  const totalWorkingDays = Array.from(monthlyStatsMap.values()).reduce((a, b) => a + b, 0);

  // Step 5: Final Eligibility Calculation
  let extraDays = 0;
  let remainingDays = 0;
  
  if (totalWorkingDays >= 624) {
    isEligible = true;
    extraDays = totalWorkingDays - 624;
    eligibilityMessage = `Employee is eligible for vacation. He/She has exceeded eligibility by ${extraDays} days.`;
  } else {
    isEligible = false;
    remainingDays = 624 - totalWorkingDays;
    eligibilityMessage = `Employee is not eligible for vacation. ${remainingDays} day(s) remaining.`;
  }

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
      lastExitDate: employee.lastExitDate ? dayjs(employee.lastExitDate).format("DD-MM-YYYY") : null,
      lastEntryDate: employee.lastEntryDate ? dayjs(employee.lastEntryDate).format("DD-MM-YYYY") : null,
    },
    eligibilityStatus: {
      isEligible,
      message: eligibilityMessage,
      extraDays: extraDays > 0 ? extraDays : undefined,
      remainingDays: remainingDays > 0 ? remainingDays : undefined,
    },
    monthlyStats,
    totalWorkingDays,
    startDate: startDate.format("DD-MM-YYYY"),
  };
};
