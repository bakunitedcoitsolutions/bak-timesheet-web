export interface MonthlyWorkingDays {
  month: string; // e.g., "January 2026"
  workingDays: number;
}

export interface LeaveEligibilityReport {
  employee: {
    id: number;
    employeeCode: number;
    nameEn: string;
    nameAr: string | null;
    status: string;
    designation: string;
    designationHours: number;
    idCardNo: string | null;
    nationalityCode: string | null;
    lastExitDate: string | null;
    lastEntryDate: string | null;
  };
  eligibilityStatus: {
    isEligible: boolean;
    message: string;
    extraDays?: number;
    remainingDays?: number;
  };
  monthlyStats: MonthlyWorkingDays[];
  totalWorkingDays: number;
  startDate: string;
}
