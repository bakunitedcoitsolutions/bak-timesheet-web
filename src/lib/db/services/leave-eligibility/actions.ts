"use server";

import { getLeaveEligibilityReport as getReport } from "./leave-eligibility.service";

export async function getLeaveEligibilityReportAction(employeeCode: number) {
  try {
    const data = await getReport(employeeCode);
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || "Failed to fetch report" };
  }
}
