import { EmployeeMonthlyReport } from "@/lib/db/services/timesheet/timesheet.dto";

export const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export interface FlattenedTimesheetRow {
  _rowKey: string;
  employeeKey: string;
  employeeId: number;
  employeeCode: number;
  nameEn: string;
  nameAr: string | null;
  designationName: string | null;
  idCardNo: string | null;
  sectionName: string | null;
  isFixed: boolean;
  totalHours: number;
  totalOT: number;
  grandTotal: number;
  day: number;
  date: string;
  project1Name: string | null;
  project1Hours: number;
  project1Overtime: number;
  project2Name: string | null;
  project2Hours: number;
  project2Overtime: number;
  isFriday: boolean;
  remarks: string | null;
  dayTotal: number;
}

export const flattenMonthlyReportData = (
  reports: EmployeeMonthlyReport[]
): FlattenedTimesheetRow[] => {
  return reports.flatMap((report) =>
    report.dailyRecords.map((record) => ({
      _rowKey: `${report.employeeId}-${record.day}`,
      employeeKey: `${report.employeeCode}-${report.employeeId}`,
      employeeId: report.employeeId,
      employeeCode: report.employeeCode,
      nameEn: report.nameEn,
      nameAr: report.nameAr,
      designationName: report.designationName,
      idCardNo: report.idCardNo,
      sectionName: report.sectionName,
      isFixed: report.isFixed,
      totalHours: report.totalHours,
      totalOT: report.totalOT,
      grandTotal: report.grandTotal,
      day: record.day,
      date: record.date,
      project1Name: record.project1Name,
      project1Hours: record.project1Hours,
      project1Overtime: record.project1Overtime,
      project2Name: record.project2Name,
      project2Hours: record.project2Hours,
      project2Overtime: record.project2Overtime,
      isFriday: record.isFriday,
      remarks: record.description ?? record.remarks,
      dayTotal:
        record.project1Hours +
        record.project1Overtime +
        record.project2Hours +
        record.project2Overtime,
    }))
  );
};

export const calculateEmployeeTotals = (empRows: FlattenedTimesheetRow[]) => {
  const p1Hrs = empRows.reduce((s, r) => s + r.project1Hours, 0);
  const p1OT = empRows.reduce((s, r) => s + r.project1Overtime, 0);
  const p2Hrs = empRows.reduce((s, r) => s + r.project2Hours, 0);
  const p2OT = empRows.reduce((s, r) => s + r.project2Overtime, 0);
  const total = p1Hrs + p1OT + p2Hrs + p2OT;
  return { p1Hrs, p1OT, p2Hrs, p2OT, total };
};
