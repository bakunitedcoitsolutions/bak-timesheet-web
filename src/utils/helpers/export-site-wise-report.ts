import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise";

const HEADERS_DETAILED = [
  "#",
  "Month",
  "Project Name",
  "Project Hours",
  "Project OT",
  "Emp. Code",
  "Employee Name",
  "Hourly Rate",
  "Total Salary",
];

const HEADERS_SUMMARIZED = [
  "#",
  "Month",
  "Project Name",
  "Project Hours",
  "Project OT",
  "Total Hours",
  "Total Salary",
];

export function exportSiteWiseExcel(
  data: SiteWiseReportRow[],
  month: number,
  year: number,
  summarized: boolean
) {
  const headers = summarized ? HEADERS_SUMMARIZED : HEADERS_DETAILED;
  
  const rows = data.map((r, i) => {
    if (summarized) {
      return [
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        (r.projectHours || 0) + (r.projectOT || 0),
        r.totalSalary,
      ];
    } else {
      return [
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        r.empCode ?? "",
        r.employeeName ?? "",
        r.hourlyRate ?? 0,
        r.totalSalary,
      ];
    }
  });

  // Totals row
  const totalRow = summarized ? [
    "", "", "GRAND TOTAL", 
    data.reduce((s, r) => s + (r.projectHours || 0), 0),
    data.reduce((s, r) => s + (r.projectOT || 0), 0),
    data.reduce((s, r) => s + (r.projectHours || 0) + (r.projectOT || 0), 0),
    data.reduce((s, r) => s + (r.totalSalary || 0), 0),
  ] : [
    "", "", "", 
    data.reduce((s, r) => s + r.projectHours, 0),
    data.reduce((s, r) => s + r.projectOT, 0),
    "", "", "",
    data.reduce((s, r) => s + r.totalSalary, 0),
  ];

  const sheetData = [
    [`SITE WISE REPORT — ${month}/${year}`.toUpperCase()],
    [],
    headers,
    ...rows,
    [],
    totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws["!cols"] = summarized 
    ? [{ wch: 5 }, { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
    : [{ wch: 5 }, { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 15 }];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Site Wise Report");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `Site_Wise_Report_${month}_${year}${summarized ? "_Summary" : ""}.xlsx`
  );
}

export function exportSiteWiseCSV(
  data: SiteWiseReportRow[],
  month: number,
  year: number,
  summarized: boolean
) {
  const headers = summarized ? HEADERS_SUMMARIZED : HEADERS_DETAILED;
  
  const rows = data.map((r, i) => {
    if (summarized) {
      return [
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        (r.projectHours || 0) + (r.projectOT || 0),
        r.totalSalary,
      ];
    } else {
      return [
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        r.empCode ?? "",
        r.employeeName ?? "",
        r.hourlyRate ?? 0,
        r.totalSalary,
      ];
    }
  });

  // Totals row
  const totalRow = summarized ? [
    "", "", "GRAND TOTAL", 
    data.reduce((s, r) => s + (r.projectHours || 0), 0),
    data.reduce((s, r) => s + (r.projectOT || 0), 0),
    data.reduce((s, r) => s + (r.projectHours || 0) + (r.projectOT || 0), 0),
    data.reduce((s, r) => s + (r.totalSalary || 0), 0),
  ] : [
    "", "", "", 
    data.reduce((s, r) => s + (r.projectHours || 0), 0),
    data.reduce((s, r) => s + (r.projectOT || 0), 0),
    "", "", "",
    data.reduce((s, r) => s + (r.totalSalary || 0), 0),
  ];

  const sheetData = [
    [`SITE WISE REPORT — ${month}/${year}`.toUpperCase()],
    [],
    headers,
    ...rows,
    [],
    totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `Site_Wise_Report_${month}_${year}${summarized ? "_Summary" : ""}.csv`);
}
