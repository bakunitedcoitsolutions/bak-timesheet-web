import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise";

const HEADERS_DETAILED = [
  "#",
  "Month",
  "Project Name",
  "Emp. Code",
  "Employee Name",
  "Project Hours",
  "Project OT",
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
  let sheetData: any[] = [
    [`SITE WISE REPORT — ${month}/${year}`.toUpperCase()],
    [],
    headers,
  ];

  if (summarized) {
    data.forEach((r, i) => {
      sheetData.push([
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        (r.projectHours || 0) + (r.projectOT || 0),
        r.totalSalary,
      ]);
    });
  } else {
    // Detailed View: Group by Project
    const projectGroups: Record<string, SiteWiseReportRow[]> = {};
    data.forEach((r) => {
      const pn = r.projectName || "Unassigned Project";
      if (!projectGroups[pn]) projectGroups[pn] = [];
      projectGroups[pn].push(r);
    });

    const sortedProjects = Object.keys(projectGroups).sort();
    sortedProjects.forEach((pn) => {
      const rawRows = projectGroups[pn];

      // Aggregate by employee
      const empMap = new Map<number | string, SiteWiseReportRow>();
      rawRows.forEach((r) => {
        const key = r.empCode || "NoCode";
        if (!empMap.has(key)) {
          empMap.set(key, { ...r });
        } else {
          const existing = empMap.get(key)!;
          existing.projectHours =
            (existing.projectHours || 0) + (r.projectHours || 0);
          existing.projectOT = (existing.projectOT || 0) + (r.projectOT || 0);
          existing.totalSalary =
            (existing.totalSalary || 0) + (r.totalSalary || 0);
        }
      });

      const aggregatedRows = Array.from(empMap.values());
      const sHours = aggregatedRows.reduce((s, r) => s + (r.projectHours || 0), 0);
      const sOT = aggregatedRows.reduce((s, r) => s + (r.projectOT || 0), 0);
      const sSalary = aggregatedRows.reduce((s, r) => s + (r.totalSalary || 0), 0);

      // Project Header Row
      sheetData.push(["", "", pn.toUpperCase()]);

      // Employee Rows
      aggregatedRows.forEach((r, i) => {
        sheetData.push([
          i + 1,
          r.month || "",
          r.projectName || "",
          r.empCode || "",
          r.employeeName || "",
          r.projectHours,
          r.projectOT,
          r.hourlyRate || 0,
          r.totalSalary,
        ]);
      });

      // Project Total Row
      sheetData.push([
        "",
        "",
        "",
        "",
        `${pn} - TOTAL :`,
        sHours,
        sOT,
        "",
        sSalary,
      ]);
      sheetData.push([]); // Spacer
    });
  }

  // Grand Totals Row
  const totalHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const totalOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const totalSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  if (summarized) {
    sheetData.push([]);
    sheetData.push([
      "",
      "",
      "GRAND TOTAL :",
      totalHours,
      totalOT,
      totalHours + totalOT,
      totalSalary,
    ]);
  } else {
    sheetData.push([
      "",
      "",
      "",
      "",
      "GRAND TOTAL :",
      totalHours,
      totalOT,
      "",
      totalSalary,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws["!cols"] = summarized
    ? [
        { wch: 5 },
        { wch: 12 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ]
    : [
        { wch: 5 },
        { wch: 12 },
        { wch: 30 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
      ];

  // Merge title row
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
  let sheetData: any[] = [
    [`SITE WISE REPORT — ${month}/${year}`.toUpperCase()],
    [],
    headers,
  ];

  if (summarized) {
    data.forEach((r, i) => {
      sheetData.push([
        i + 1,
        r.month,
        r.projectName,
        r.projectHours,
        r.projectOT,
        (r.projectHours || 0) + (r.projectOT || 0),
        r.totalSalary,
      ]);
    });
  } else {
    // Detailed View: Group by Project
    const projectGroups: Record<string, SiteWiseReportRow[]> = {};
    data.forEach((r) => {
      const pn = r.projectName || "Unassigned Project";
      if (!projectGroups[pn]) projectGroups[pn] = [];
      projectGroups[pn].push(r);
    });

    const sortedProjects = Object.keys(projectGroups).sort();
    sortedProjects.forEach((pn) => {
      const rawRows = projectGroups[pn];

      // Aggregate by employee
      const empMap = new Map<number | string, SiteWiseReportRow>();
      rawRows.forEach((r) => {
        const key = r.empCode || "NoCode";
        if (!empMap.has(key)) {
          empMap.set(key, { ...r });
        } else {
          const existing = empMap.get(key)!;
          existing.projectHours =
            (existing.projectHours || 0) + (r.projectHours || 0);
          existing.projectOT = (existing.projectOT || 0) + (r.projectOT || 0);
          existing.totalSalary =
            (existing.totalSalary || 0) + (r.totalSalary || 0);
        }
      });

      const aggregatedRows = Array.from(empMap.values());
      const sHours = aggregatedRows.reduce((s, r) => s + (r.projectHours || 0), 0);
      const sOT = aggregatedRows.reduce((s, r) => s + (r.projectOT || 0), 0);
      const sSalary = aggregatedRows.reduce((s, r) => s + (r.totalSalary || 0), 0);

      // Project Header Row
      sheetData.push(["", "", pn.toUpperCase()]);

      // Employee Rows
      aggregatedRows.forEach((r, i) => {
        sheetData.push([
          i + 1,
          r.month || "",
          r.projectName || "",
          r.empCode || "",
          r.employeeName || "",
          r.projectHours,
          r.projectOT,
          r.hourlyRate || 0,
          r.totalSalary,
        ]);
      });

      // Project Total Row
      sheetData.push([
        "",
        "",
        "",
        "",
        `${pn} - TOTAL :`,
        sHours,
        sOT,
        "",
        sSalary,
      ]);
      sheetData.push([]); // Spacer
    });
  }

  // Grand Totals Row
  const totalHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const totalOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const totalSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  if (summarized) {
    sheetData.push([]);
    sheetData.push([
      "",
      "",
      "GRAND TOTAL :",
      totalHours,
      totalOT,
      totalHours + totalOT,
      totalSalary,
    ]);
  } else {
    sheetData.push([
      "",
      "",
      "",
      "",
      "GRAND TOTAL :",
      totalHours,
      totalOT,
      "",
      totalSalary,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(
    blob,
    `Site_Wise_Report_${month}_${year}${summarized ? "_Summary" : ""}.csv`
  );
}
