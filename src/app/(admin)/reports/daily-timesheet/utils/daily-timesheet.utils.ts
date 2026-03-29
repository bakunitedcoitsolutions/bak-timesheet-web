import { GlobalDataGeneral } from "@/context/GlobalDataContext";
import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";

export const groupDataBySection = (
  reportData: TimesheetPageRow[],
  payrollSections: GlobalDataGeneral[]
) => {
  const groups: { [key: string]: TimesheetPageRow[] } = {};

  reportData.forEach((row) => {
    const section = (row as any).sectionName || "Unassigned";
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(row);
  });

  return Object.keys(groups)
    .sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;

      const sectionA = payrollSections.find((s) => s.nameEn === a);
      const sectionB = payrollSections.find((s) => s.nameEn === b);

      const orderA = sectionA?.displayOrderKey ?? Number.MAX_SAFE_INTEGER;
      const orderB = sectionB?.displayOrderKey ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;

      return a.localeCompare(b);
    })
    .map((name) => ({
      name,
      rows: groups[name].map((row, index) => ({
        ...row,
        displayIndex: index + 1,
      })),
    }));
};

export const calculateSectionTotals = (sectionRows: TimesheetPageRow[]) => {
  return {
    p1Hrs: sectionRows.reduce((sum, r) => sum + (r.project1Hours || 0), 0),
    p1OT: sectionRows.reduce((sum, r) => sum + (r.project1Overtime || 0), 0),
    p2Hrs: sectionRows.reduce((sum, r) => sum + (r.project2Hours || 0), 0),
    p2OT: sectionRows.reduce((sum, r) => sum + (r.project2Overtime || 0), 0),
    total: sectionRows.reduce((sum, r) => sum + (r.totalHours || 0), 0),
  };
};
