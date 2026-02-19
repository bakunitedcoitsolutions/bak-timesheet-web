export interface PayrollDetailEntry {
  id: number;
  empCode: string;
  name: string;
  arabicName: string;
  designation: string;
  idNumber: string;
  nationality: string;
  professionInId: string;
  passportNumber: string;
  passportExpiryDate: string;
  joiningDate: string;
  iban: string;
  bankCode: string;
  workDays: number;
  overTime: number;
  totalHours: number;
  hourlyRate: number;
  breakfastAllowance: number;
  otherAllowances: number;
  totalAllowances: number;
  totalSalary: number;
  previousAdvance: number;
  currentAdvance: number;
  loanDeduction: number;
  netLoan: number;
  previousChallan: number;
  currentChallan: number;
  challanDeduction: number;
  netChallan: number;
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  remarks: string;
  paymentMethodId: number | null;
  payrollStatusId: number;
  isLocked: boolean;
  gender: string; // "M" or "F" for gender flag
  payrollSummaryStatusId: number;
  isFixed: boolean;
  isDeductable: boolean;
  isCardDelivered: boolean;
}

import { PayrollDetailWithRelations } from "./payroll-summary.dto";
import { convertDecimalToNumber } from "@/lib/db/utils";

export const mapPayrollDetailToEntry = (
  d: PayrollDetailWithRelations
): PayrollDetailEntry => {
  return {
    id: d.id,
    empCode: d.employee.employeeCode.toString(),
    name: d.employee.nameEn,
    arabicName: d.employee.nameAr || "",
    designation: d.employee.designation?.nameEn || "",
    idNumber: d.employee.idCardNo || "",
    nationality: d.employee.nationality?.nameEn || "",
    professionInId: d.employee.profession || "",
    passportNumber: d.employee.passportNo || "",
    passportExpiryDate: d.employee.passportExpiryDate
      ? new Date(d.employee.passportExpiryDate).toLocaleDateString()
      : "",
    joiningDate: d.employee.joiningDate
      ? new Date(d.employee.joiningDate).toLocaleDateString()
      : "",
    iban: d.employee.iban || "",
    bankCode: d.employee.bankCode || "",
    workDays: convertDecimalToNumber(d.workDays) || 0,
    overTime: convertDecimalToNumber(d.overTime) || 0,
    totalHours: convertDecimalToNumber(d.totalHours) || 0,
    hourlyRate: convertDecimalToNumber(d.hourlyRate) || 0,
    breakfastAllowance: convertDecimalToNumber(d.breakfastAllowance) || 0,
    otherAllowances: convertDecimalToNumber(d.otherAllowances) || 0,
    totalAllowances: convertDecimalToNumber(d.totalAllowances) || 0,
    totalSalary: convertDecimalToNumber(d.salary) || 0,
    previousAdvance: convertDecimalToNumber(d.previousLoan) || 0,
    currentAdvance: convertDecimalToNumber(d.currentLoan) || 0,
    loanDeduction: convertDecimalToNumber(d.loanDeduction) || 0,
    netLoan: convertDecimalToNumber(d.netLoan) || 0,
    previousChallan: convertDecimalToNumber(d.previousChallan) || 0,
    currentChallan: convertDecimalToNumber(d.currentChallan) || 0,
    challanDeduction: convertDecimalToNumber(d.challanDeduction) || 0,
    netChallan: convertDecimalToNumber(d.netChallan) || 0,
    netSalaryPayable: convertDecimalToNumber(d.netSalaryPayable) || 0,
    cardSalary: convertDecimalToNumber(d.cardSalary) || 0,
    cashSalary: convertDecimalToNumber(d.cashSalary) || 0,
    remarks: d.remarks || "",
    paymentMethodId: d.paymentMethodId || null,
    payrollStatusId: d.payrollStatusId ?? 1,
    isLocked: false,
    gender: d?.employee?.gender || "",
    payrollSummaryStatusId: d.payrollSummary?.payrollStatusId ?? 1,
    isFixed: d?.employee?.isFixed ?? false,
    isDeductable: d?.employee?.isDeductable ?? false,
    isCardDelivered: d?.employee?.isCardDelivered ?? false,
  };
};
