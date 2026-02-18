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
  allowance: number;
  totalSalary: number;
  previousAdvance: number;
  currentAdvance: number;
  deduction: number;
  netLoan: number;
  previousTraffic: number;
  currentTraffic: number;
  trafficDeduction: number;
  netTraffic: number;
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  remarks: string;
  paymentMethod: string | null;
  status: number;
  isLocked: boolean;
  gender: string; // "M" or "F" for gender flag
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
    allowance: convertDecimalToNumber(d.allowance) || 0,
    totalSalary: convertDecimalToNumber(d.salary) || 0,
    previousAdvance: convertDecimalToNumber(d.previousLoan) || 0,
    currentAdvance: convertDecimalToNumber(d.currentLoan) || 0,
    deduction: convertDecimalToNumber(d.deductionLoan) || 0,
    netLoan: convertDecimalToNumber(d.netLoan) || 0,
    previousTraffic: convertDecimalToNumber(d.previousTrafficChallan) || 0,
    currentTraffic: convertDecimalToNumber(d.currentTrafficChallan) || 0,
    trafficDeduction: convertDecimalToNumber(d.deductionTrafficChallan) || 0,
    netTraffic: convertDecimalToNumber(d.netTrafficChallan) || 0,
    netSalaryPayable: convertDecimalToNumber(d.netSalaryPayable) || 0,
    cardSalary: convertDecimalToNumber(d.cardSalary) || 0,
    cashSalary: convertDecimalToNumber(d.cashSalary) || 0,
    remarks: d.remarks || "",
    paymentMethod: d.paymentMethodId?.toString() || "",
    status: d.payrollStatusId ?? 1,
    isLocked: false,
    gender: d?.employee?.gender || "", // Placeholder
  };
};
