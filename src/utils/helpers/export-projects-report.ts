import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ListedProject } from "@/lib/db/services/project/project.dto";

export interface ProjectExportRow {
  groupSerial: number;
  nameEn: string;
  nameAr: string;
  branchName: string;
  status: string;
}

function mapToExportRow(p: ListedProject, index: number): ProjectExportRow {
  return {
    groupSerial: index + 1,
    nameEn: p.nameEn,
    nameAr: p.nameAr || "",
    branchName: p.branch?.nameEn || "Global",
    status: p.isActive ? "Active" : "Inactive",
  };
}

const HEADERS = [
  "#",
  "Project Name (EN)",
  "Project Name (AR)",
  "Branch",
  "Status",
];

function buildRow(r: ProjectExportRow): (string | number)[] {
  return [r.groupSerial, r.nameEn, r.nameAr, r.branchName, r.status];
}

function buildSheetData(data: ProjectExportRow[]): (string | number)[][] {
  const rows: (string | number)[][] = [["PROJECTS REPORT"], [], HEADERS];

  data.forEach((r) => {
    rows.push(buildRow(r));
  });

  return rows;
}

export function exportProjectsExcel(projects: ListedProject[]) {
  const exportData = projects.map((p, i) => mapToExportRow(p, i));
  const rows = buildSheetData(exportData);
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 },  // #
    { wch: 35 }, // Name EN
    { wch: 35 }, // Name AR
    { wch: 20 }, // Branch
    { wch: 15 }, // Status
  ];

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: HEADERS.length - 1 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Projects Report");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(
    new Blob([buf], { type: "application/octet-stream" }),
    `Projects_Report_${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

export function exportProjectsCSV(projects: ListedProject[]) {
  const exportData = projects.map((p, i) => mapToExportRow(p, i));
  const rows = buildSheetData(exportData);
  
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
    `Projects_Report_${new Date().toISOString().split("T")[0]}.csv`
  );
}
