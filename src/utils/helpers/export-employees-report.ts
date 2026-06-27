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

type EmployeeColumns = {
  id: number;
  type: string;
  label: string;
  value: string;
  example?: string;
};

export const EMPLOYEE_COLUMNS: EmployeeColumns[] = [
  {
    id: 1,
    type: "text",
    label: "Employee Code",
    value: "employeeCode",
    example: "10001",
  },
  {
    id: 2,
    type: "text",
    label: "Name (En)",
    value: "nameEn",
    example: "John Doe",
  },
  {
    id: 3,
    type: "text",
    label: "Name (Ar)",
    value: "nameAr",
    example: "جون دو",
  },
  {
    id: 4,
    type: "date",
    label: "Birth Date",
    value: "dob",
    example: "1990-01-01",
  },
  {
    id: 5,
    type: "text",
    label: "Mobile No.",
    value: "phone",
    example: "0500000000",
  },
  { id: 6, type: "text", label: "Gender", value: "gender", example: "male" },
  {
    id: 7,
    type: "linked",
    label: "Country",
    value: "countryName",
    example: "Saudi Arabia",
  },
  {
    id: 8,
    type: "linked",
    label: "City",
    value: "cityName",
    example: "Riyadh",
  },
  {
    id: 9,
    type: "linked",
    label: "Status",
    value: "statusName",
    example: "Active",
  },
  {
    id: 10,
    type: "linked",
    label: "Branch",
    value: "branchName",
    example: "Main Branch",
  },
  {
    id: 11,
    type: "linked",
    label: "Sub Branch",
    value: "subBranchName",
    example: "HQ",
  },
  {
    id: 12,
    type: "linked",
    label: "Designation",
    value: "designationName",
    example: "Software Engineer",
  },
  {
    id: 13,
    type: "linked",
    label: "Payroll Section",
    value: "sectionName",
    example: "IT Department",
  },
  {
    id: 14,
    type: "boolean",
    label: "Is Fixed?",
    value: "isFixed",
    example: "YES",
  },
  {
    id: 15,
    type: "boolean",
    label: "Is Deductable?",
    value: "isDeductable",
    example: "YES",
  },
  {
    id: 16,
    type: "number",
    label: "Working Days",
    value: "workingDays",
    example: "30",
  },
  { id: 17, type: "number", label: "Salary", value: "salary", example: "5000" },
  {
    id: 18,
    type: "number",
    label: "Hourly Rate",
    value: "hourlyRate",
    example: "20.83",
  },
  {
    id: 19,
    type: "boolean",
    label: "Breakfast All.",
    value: "breakfastAllowance",
    example: "NO",
  },
  {
    id: 20,
    type: "number",
    label: "Food Allowance",
    value: "foodAllowance",
    example: "500",
  },
  {
    id: 21,
    type: "number",
    label: "Mobile Allowance",
    value: "mobileAllowance",
    example: "200",
  },
  {
    id: 22,
    type: "number",
    label: "Other Allowance",
    value: "otherAllowance",
    example: "0",
  },
  {
    id: 23,
    type: "date",
    label: "Contract Start",
    value: "contractStartDate",
    example: "2023-01-01",
  },
  {
    id: 24,
    type: "date",
    label: "Contract End",
    value: "contractEndDate",
    example: "2025-01-01",
  },
  {
    id: 25,
    type: "number",
    label: "Contract Rem. Days",
    value: "contractRemainingDays",
    example: "150",
  },
  {
    id: 26,
    type: "date",
    label: "Joining Date",
    value: "joiningDate",
    example: "2023-01-01",
  },
  {
    id: 27,
    type: "text",
    label: "End Reason",
    value: "contractEndReason",
    example: "N/A",
  },
  {
    id: 28,
    type: "text",
    label: "Contract Doc",
    value: "contractDocument",
    example: "https://example.com/contract.pdf",
  },
  {
    id: 29,
    type: "text",
    label: "ID Card No.",
    value: "idCardNo",
    example: "1000000000",
  },
  {
    id: 30,
    type: "date",
    label: "ID Card Expiry",
    value: "idCardExpiryDate",
    example: "2028-01-01",
  },
  {
    id: 31,
    type: "text",
    label: "Profession",
    value: "profession",
    example: "مهندس برمجيات",
  },
  {
    id: 32,
    type: "text",
    label: "ID Card Doc",
    value: "idCardDocument",
    example:
      "https://example.com/id_card.jpg",
  },
  {
    id: 33,
    type: "linked",
    label: "Nationality",
    value: "nationalityName",
    example: "United States",
  },
  {
    id: 34,
    type: "text",
    label: "Passport No.",
    value: "passportNo",
    example: "A1234567",
  },
  {
    id: 35,
    type: "date",
    label: "Passport Expiry",
    value: "passportExpiryDate",
    example: "2030-01-01",
  },
  {
    id: 36,
    type: "text",
    label: "Passport Doc",
    value: "passportDocument",
    example: "https://example.com/passport.pdf",
  },
  {
    id: 37,
    type: "text",
    label: "Bank Name",
    value: "bankName",
    example: "Example Bank",
  },
  {
    id: 38,
    type: "text",
    label: "Bank Code",
    value: "bankCode",
    example: "EXBK",
  },
  {
    id: 39,
    type: "number",
    label: "GOSI Salary",
    value: "gosiSalary",
    example: "5000",
  },
  {
    id: 40,
    type: "linked",
    label: "GOSI City",
    value: "gosiCityName",
    example: "Riyadh",
  },
  {
    id: 41,
    type: "text",
    label: "IBAN",
    value: "iban",
    example: "SA0000000000000000000000",
  },
  {
    id: 42,
    type: "boolean",
    label: "Card Delivered?",
    value: "isCardDelivered",
    example: "YES",
  },
  {
    id: 43,
    type: "text",
    label: "Card Doc",
    value: "cardDocument",
    example: "https://example.com/card_doc.jpg",
  },
  {
    id: 44,
    type: "text",
    label: "Profile Picture",
    value: "profilePicture",
    example: "https://example.com/profile.jpg",
  },
];

export const EMPLOYEE_COLUMNS_FOR_BULK_UPDATE = EMPLOYEE_COLUMNS.filter(
  (col) => {
    return ![25].includes(col.id);
  }
);

export const EMPLOYEE_COLUMNS_FOR_REPORT = EMPLOYEE_COLUMNS.filter((col) => {
  return ![1, 2, 3, 44].includes(col.id);
});
