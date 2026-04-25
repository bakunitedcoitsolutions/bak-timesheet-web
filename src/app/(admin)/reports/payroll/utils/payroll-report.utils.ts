import { formatNum } from "@/utils/helpers";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

export type PayrollReportRow = PayrollDetailEntry & {
  sectionName: string;
  sectionOrder: number;
  displayIndex: number;
};

export const fmt = (v: number) => formatNum(v || 0);
export const fmtHR = (v: number) => Number(v || 0).toFixed(2);

export const NUMERIC_KEYS: (keyof PayrollDetailEntry)[] = [
  "workDays",
  "projectHours",
  "overTime",
  "totalHours",
  "hourlyRate",
  "baseSalary",
  "breakfastAllowance",
  "otherAllowances",
  "totalAllowances",
  "totalSalary",
  "previousAdvance",
  "currentAdvance",
  "loanDeduction",
  "netLoan",
  "previousChallan",
  "currentChallan",
  "challanDeduction",
  "netChallan",
  "netSalaryPayable",
  "cardSalary",
  "cashSalary",
];

export const groupBySection = (allRows: PayrollReportRow[]) => {
  const map = new Map<string, { rows: PayrollReportRow[]; order: number }>();
  allRows.forEach((r) => {
    const sn = r.sectionName ?? "Unassigned";
    const so = r.sectionOrder ?? 9999;
    if (!map.has(sn)) map.set(sn, { rows: [], order: so });
    map.get(sn)!.rows.push(r);
  });
  return [...map.entries()]
    .sort((a, b) => a[1].order - b[1].order)
    .map(([name, { rows }]) => ({
      name,
      rows: rows.map((r, i) => ({
        ...r,
        displayIndex: i + 1,
        sectionName: name,
      })),
    }));
};

export const calculateGrandTotals = (visibleData: PayrollReportRow[]) => {
  return NUMERIC_KEYS.reduce(
    (acc, k) => ({
      ...acc,
      [k]: visibleData.reduce(
        (s, r) => s + (((r as any)[k] as number) || 0),
        0
      ),
    }),
    {} as Record<string, number>
  );
};

export const calculateSectionTotals = (
  sectionRows: PayrollReportRow[],
  sectionName: string
) => {
  return NUMERIC_KEYS.reduce(
    (acc, k) => ({
      ...acc,
      [k]: sectionRows
        .filter((r) => r.sectionName === sectionName)
        .reduce((s, r) => s + (((r as any)[k] as number) || 0), 0),
    }),
    {} as Record<string, number>
  );
};
