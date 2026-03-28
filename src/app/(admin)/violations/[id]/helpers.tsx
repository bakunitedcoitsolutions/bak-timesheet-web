"use client";

import dayjs from "dayjs";

/**
 * Common field options for traffic violations
 */
export const CHALLAN_TYPE_OPTIONS = [
  { label: "Challan", value: "CHALLAN" },
  { label: "Return", value: "RETURN" },
];

/**
 * Default form values for creating a new violation
 */
export const VIOLATION_DEFAULT_VALUES = {
  employeeId: undefined as number | undefined,
  date: "",
  type: undefined as "CHALLAN" | "RETURN" | undefined,
  amount: undefined as number | undefined,
  description: "",
};

/**
 * Checks if the payroll for the given date is posted
 */
export const checkIsPayrollPosted = (
  payrollStatus: any,
  date: string | Date | null
) => {
  if (!payrollStatus || !date) return false;
  // PayrollStatusId 3 usually means POSTED
  return payrollStatus.payrollStatusId === 3;
};

/**
 * Extracts month and year for payroll status check
 */
export const getMonthYearFromDate = (dateStr: string | Date | undefined) => {
  if (!dateStr) return { month: 0, year: 0 };
  const d = dayjs(dateStr);
  return { month: d.month() + 1, year: d.year() };
};
