export interface MonthlyWorkingDays {
  month: string; // e.g., "January 2026"
  workingDays: number;
}

export interface EligibilityStatus {
  isEligible: boolean;
  message: string;
  extraDays?: number;
  remainingDays?: number;
}

export interface LeaveCycle {
  startDate: string;
  endDate: string | null; // null for current cycle
  monthlyStats: MonthlyWorkingDays[];
  totalWorkingDays: number;
  eligibilityStatus?: EligibilityStatus;
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
    gender: string | null;
    lastExitDate: string | null;
    lastEntryDate: string | null;
  };
  // To maintain backward compatibility while supporting multiple cycles
  eligibilityStatus: EligibilityStatus;
  monthlyStats: MonthlyWorkingDays[];
  totalWorkingDays: number;
  startDate: string;

  // New field for multiple cycles
  previousCycles: LeaveCycle[];
}
