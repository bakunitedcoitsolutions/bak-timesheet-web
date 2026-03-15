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

const HEADERS = [
  "#",
  "Employee Code",
  "Name (EN)",
  "Name (AR)",
  "Birth Date",
  "Mobile No.",
  "Gender",
  "Country",
  "City",
  "Status",
  "Branch",
  "Designation",
  "Payroll Section",
  "Is Fixed?",
  "Is Deductable?",
  "Working Days",
  "Salary",
  "Hourly Rate",
  "Breakfast All.",
  "Food Allowance",
  "Mobile Allowance",
  "Other Allowance",
  "Contract Start",
  "Contract End",
  "Contract Rem. Days",
  "Joining Date",
  "End Reason",
  "Contract Doc",
  "ID Card No.",
  "ID Card Expiry",
  "Profession",
  "ID Card Doc",
  "Nationality",
  "Passport No.",
  "Passport Expiry",
  "Passport Doc",
  "Bank Name",
  "Bank Code",
  "IBAN",
  "GOSI Salary",
  "GOSI City",
  "Card Delivered?",
  "Card Doc",
];

function buildRow(r: EmployeeExportRow): (string | number)[] {
  return [
    r.groupSerial,
    r.employeeCode,
    r.nameEn,
    r.nameAr || "",
    r.dob || "",
    r.phone || "",
    r.gender || "",
    r.countryName || "",
    r.cityName || "",
    r.statusName || "",
    r.branchName || "",
    r.designationName || "",
    r.sectionName || "",
    r.isFixed || "",
    r.isDeductable || "",
    r.workingDays || 0,
    r.salary || 0,
    r.hourlyRate || 0,
    r.breakfastAllowance || "",
    r.foodAllowance || 0,
    r.mobileAllowance || 0,
    r.otherAllowance || 0,
    r.contractStartDate || "",
    r.contractEndDate || "",
    r.contractRemainingDays || "",
    r.joiningDate || "",
    r.contractEndReason || "",
    r.contractDocument || "",
    r.idCardNo || "",
    r.idCardExpiryDate || "",
    r.profession || "",
    r.idCardDocument || "",
    r.nationalityName || "",
    r.passportNo || "",
    r.passportExpiryDate || "",
    r.passportDocument || "",
    r.bankName || "",
    r.bankCode || "",
    r.iban || "",
    r.gosiSalary || 0,
    r.gosiCityName || "",
    r.isCardDelivered || "",
    r.cardDocument || "",
  ];
}

function buildSheetData(data: EmployeeExportRow[]): (string | number)[][] {
  const rows: (string | number)[][] = [
    ["EMPLOYEES REPORT"],
    [],
    HEADERS,
  ];

  data.forEach((r) => {
    rows.push(buildRow(r));
  });

  return rows;
}

export function exportEmployeesExcel(data: EmployeeExportRow[]) {
  const rows = buildSheetData(data);
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths (rough estimate)
  ws["!cols"] = HEADERS.map(() => ({ wch: 15 }));
  ws["!cols"][2] = { wch: 30 }; // Name EN
  ws["!cols"][3] = { wch: 30 }; // Name AR

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees Report");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `Employees_Report_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

export function exportEmployeesCSV(data: EmployeeExportRow[]) {
  const rows = buildSheetData(data);
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
