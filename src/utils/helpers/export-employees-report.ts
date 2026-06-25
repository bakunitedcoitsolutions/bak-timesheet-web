import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

export interface EmployeeExportRow {
  groupSerial: number;
  employeeCode: number | string;
  nameEn: string;
  nameAr?: string;
  dob?: string;
  phone?: string;
  gender?: string;
  countryName?: string;
  cityName?: string;
  statusName?: string;
  branchName?: string;
  subBranchName?: string;
  designationName?: string;
  sectionName?: string;
  isFixed?: string;
  isDeductable?: string;
  workingDays?: number;
  salary?: number;
  hourlyRate?: number;
  breakfastAllowance?: string;
  foodAllowance?: number;
  mobileAllowance?: number;
  otherAllowance?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  contractRemainingDays?: number | string;
  joiningDate?: string;
  contractEndReason?: string;
  contractDocument?: string;
  idCardNo?: string;
  idCardExpiryDate?: string;
  profession?: string;
  idCardDocument?: string;
  nationalityName?: string;
  passportNo?: string;
  passportExpiryDate?: string;
  passportDocument?: string;
  bankName?: string;
  bankCode?: string;
  iban?: string;
  gosiSalary?: number;
  gosiCityName?: string;
  isCardDelivered?: string;
  cardDocument?: string;
}

export function mapEmployeeToExportRow(
  emp: ListedEmployee,
  index: number
): EmployeeExportRow {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate contract remaining days
  let contractRemainingDays: number | null = null;
  if (emp.contractStartDate && emp.contractEndDate) {
    const endDate = new Date(emp.contractEndDate);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    contractRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    groupSerial: index + 1,
    employeeCode: emp.employeeCode,
    nameEn: emp.nameEn,
    nameAr: emp.nameAr || "",
    dob: emp.dob ? new Date(emp.dob).toLocaleDateString() : "",
    phone: emp.phone || "",
    gender: emp.gender || "",
    countryName: emp.country?.nameEn || "-",
    cityName: emp.city?.nameEn || "-",
    statusName: emp.status?.nameEn || "-",
    branchName: emp.branch?.nameEn || "-",
    subBranchName: emp.subBranch?.nameEn || "-",
    designationName: emp.designation?.nameEn || "-",
    sectionName: emp.payrollSection?.nameEn || "-",
    isFixed: emp.isFixed ? "Yes" : "No",
    isDeductable: emp.isDeductable ? "Yes" : "No",
    workingDays: emp.workingDays || 0,
    salary: Number(emp.salary) || 0,
    hourlyRate: Number(emp.hourlyRate) || 0,
    breakfastAllowance: emp.breakfastAllowance ? "Yes" : "No",
    foodAllowance: Number(emp.foodAllowance) || 0,
    mobileAllowance: Number(emp.mobileAllowance) || 0,
    otherAllowance: Number(emp.otherAllowance) || 0,
    contractStartDate: emp.contractStartDate
      ? new Date(emp.contractStartDate).toLocaleDateString()
      : "",
    contractEndDate: emp.contractEndDate
      ? new Date(emp.contractEndDate).toLocaleDateString()
      : "",
    contractRemainingDays: contractRemainingDays ?? "-",
    joiningDate: emp.joiningDate
      ? new Date(emp.joiningDate).toLocaleDateString()
      : "",
    contractEndReason: emp.contractEndReason || "",
    contractDocument: emp.contractDocument || "",
    idCardNo: emp.idCardNo || "",
    idCardExpiryDate: emp.idCardExpiryDate
      ? new Date(emp.idCardExpiryDate).toLocaleDateString()
      : "",
    profession: emp.profession || "",
    idCardDocument: emp.idCardDocument || "",
    nationalityName: emp.nationality?.nameEn || "-",
    passportNo: emp.passportNo || "",
    passportExpiryDate: emp.passportExpiryDate
      ? new Date(emp.passportExpiryDate).toLocaleDateString()
      : "",
    passportDocument: emp.passportDocument || "",
    bankName: emp.bankName || "",
    bankCode: emp.bankCode || "",
    iban: emp.iban || "",
    gosiSalary: Number(emp.gosiSalary) || 0,
    gosiCityName: emp.gosiCity?.nameEn || "-",
    isCardDelivered: emp.isCardDelivered ? "Yes" : "No",
    cardDocument: emp.cardDocument || "",
  } as EmployeeExportRow;
}

function buildRow(
  r: EmployeeExportRow,
  columns: { header: string; key: string }[]
): (string | number)[] {
  return columns.map((col) => (r as any)[col.key] ?? "");
}

function buildSheetData(
  data: EmployeeExportRow[],
  columns: { header: string; key: string }[]
): (string | number)[][] {
  const headers = columns.map((col) => col.header);
  const rows: (string | number)[][] = [["EMPLOYEES REPORT"], [], headers];

  data.forEach((r) => {
    rows.push(buildRow(r, columns));
  });

  return rows;
}

export function exportEmployeesExcel(
  data: EmployeeExportRow[],
  columns: { header: string; key: string }[]
) {
  const rows = buildSheetData(data, columns);
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths (rough estimate)
  ws["!cols"] = columns.map((col) => {
    if (col.key === "nameEn" || col.key === "nameAr") return { wch: 30 };
    return { wch: 15 };
  });

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees Report");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `Employees_Report_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

export function exportEmployeesCSV(
  data: EmployeeExportRow[],
  columns: { header: string; key: string }[]
) {
  const rows = buildSheetData(data, columns);
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  saveAs(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
    `Employees_Report_${new Date().toISOString().split("T")[0]}.csv`
  );
}

export const EMPLOYEE_COLUMNS = [
  { id: 1, label: "Employee Code", value: "employeeCode" },
  { id: 2, label: "Name (En)", value: "nameEn" },
  { id: 3, label: "Name (Ar)", value: "nameAr" },
  { id: 4, label: "Birth Date", value: "dob" },
  { id: 5, label: "Mobile No.", value: "phone" },
  { id: 6, label: "Gender", value: "gender" },
  { id: 7, label: "Country", value: "countryName" },
  { id: 8, label: "City", value: "cityName" },
  { id: 9, label: "Status", value: "statusName" },
  { id: 10, label: "Branch", value: "branchName" },
  { id: 11, label: "Sub Branch", value: "subBranchName" },
  { id: 12, label: "Designation", value: "designationName" },
  { id: 13, label: "Payroll Section", value: "sectionName" },
  { id: 14, label: "Is Fixed?", value: "isFixed" },
  { id: 15, label: "Is Deductable?", value: "isDeductable" },
  { id: 16, label: "Working Days", value: "workingDays" },
  { id: 17, label: "Salary", value: "salary" },
  { id: 18, label: "Hourly Rate", value: "hourlyRate" },
  { id: 19, label: "Breakfast All.", value: "breakfastAllowance" },
  { id: 20, label: "Food Allowance", value: "foodAllowance" },
  { id: 21, label: "Mobile Allowance", value: "mobileAllowance" },
  { id: 22, label: "Other Allowance", value: "otherAllowance" },
  { id: 23, label: "Contract Start", value: "contractStartDate" },
  { id: 24, label: "Contract End", value: "contractEndDate" },
  { id: 25, label: "Contract Rem. Days", value: "contractRemainingDays" },
  { id: 26, label: "Joining Date", value: "joiningDate" },
  { id: 27, label: "End Reason", value: "contractEndReason" },
  { id: 28, label: "Contract Doc", value: "contractDocument" },
  { id: 29, label: "ID Card No.", value: "idCardNo" },
  { id: 30, label: "ID Card Expiry", value: "idCardExpiryDate" },
  { id: 31, label: "Profession", value: "profession" },
  { id: 32, label: "ID Card Doc", value: "idCardDocument" },
  { id: 33, label: "Nationality", value: "nationalityName" },
  { id: 34, label: "Passport No.", value: "passportNo" },
  { id: 35, label: "Passport Expiry", value: "passportExpiryDate" },
  { id: 36, label: "Passport Doc", value: "passportDocument" },
  { id: 37, label: "Bank Name", value: "bankName" },
  { id: 38, label: "Bank Code", value: "bankCode" },
  { id: 39, label: "GOSI Salary", value: "gosiSalary" },
  { id: 40, label: "GOSI City", value: "gosiCityName" },
  { id: 41, label: "IBAN", value: "iban" },
  { id: 42, label: "Card Delivered?", value: "isCardDelivered" },
  { id: 43, label: "Card Doc", value: "cardDocument" },
  { id: 44, label: "Last Exit Date", value: "lastExitDate" },
  { id: 45, label: "Last Entry Date", value: "lastEntryDate" },
  { id: 46, label: "Profile Picture", value: "profilePicture" },
];

export const EMPLOYEE_COLUMNS_FOR_REPORT = EMPLOYEE_COLUMNS.filter((col) => {
  return ![1, 2, 3, 44, 45, 46].includes(col.id);
});
