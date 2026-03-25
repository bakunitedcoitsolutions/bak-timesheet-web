import { formatNum } from "@/utils/helpers";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise";

export const printSiteWiseReport = (
  data: SiteWiseReportRow[],
  month: number,
  year: number,
  summarized: boolean,
  filters: {
    employeeCodes?: string[] | null;
    projectNames?: string | null;
  } = {}
) => {
  if (summarized) {
    printSummarizedSiteWiseReport(data, month, year, filters);
  } else {
    printDetailedSiteWiseReport(data, month, year, filters);
  }
};

export const printSummarizedSiteWiseReport = (
  data: SiteWiseReportRow[],
  month: number,
  year: number,
  filters: {
    projectNames?: string | null;
  } = {}
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const fmt = (v?: number | null) => formatNum(v || 0);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedMonthHead = `${monthNames[month - 1]} ${year}`;

  const headerFilters = [formattedMonthHead.toUpperCase()]
    .filter(Boolean)
    .join(" | ");

  const totalHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const totalOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const totalBaseSalary = data.reduce((s, r) => s + (r.baseSalary || 0), 0);
  const totalBreakfast = data.reduce(
    (s, r) => s + (r.breakfastAllowance || 0),
    0
  );
  const totalOther = data.reduce((s, r) => s + (r.otherAllowance || 0), 0);
  const totalAllowance = data.reduce((s, r) => s + (r.totalAllowance || 0), 0);
  const totalSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  const contentHtml = `
    <table>
      <thead>
        <tr>
          <th style="width: 30px;">#</th>
          <th class="text-left">Project Name</th>
          <th style="width: 60px;">Hours</th>
          <th style="width: 60px;">OT</th>
          <th style="width: 60px;">Total</th>
          <th style="width: 80px;">Salary</th>
          <th style="width: 70px;">Brf. Alw.</th>
          <th style="width: 75px;">Other Alw.</th>
          <th style="width: 75px;">Total Alw.</th>
          <th style="width: 90px;">Total Salary</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            (r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td class="text-left font-bold">${r.projectName}</td>
            <td>${fmt(r.projectHours)}</td>
            <td>${fmt(r.projectOT)}</td>
            <td>${fmt((r.projectHours || 0) + (r.projectOT || 0))}</td>
            <td>${fmt(r.baseSalary)}</td>
            <td>${fmt(r.breakfastAllowance)}</td>
            <td>${fmt(r.otherAllowance)}</td>
            <td>${fmt(r.totalAllowance)}</td>
            <td class="text-primary font-bold">${fmt(r.totalSalary)}</td>
          </tr>
        `
          )
          .join("")}
        <tr class="bg-footer">
          <td colspan="2" class="text-right px-4 text-primary">GRAND TOTAL:</td>
          <td class="text-primary">${fmt(totalHours)}</td>
          <td class="text-primary">${fmt(totalOT)}</td>
          <td class="text-primary">${fmt(totalHours + totalOT)}</td>
          <td class="text-primary">${fmt(totalBaseSalary)}</td>
          <td class="text-primary">${fmt(totalBreakfast)}</td>
          <td class="text-primary">${fmt(totalOther)}</td>
          <td class="text-primary">${fmt(totalAllowance)}</td>
          <td class="text-primary">${fmt(totalSalary)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const printContent = generatePrintHtml(
    "SITE WISE SUMMARY REPORT",
    headerFilters,
    contentHtml,
    formattedMonthHead,
    "landscape"
  );
  printWindow.document.write(printContent);
  printWindow.document.close();
};

export const printDetailedSiteWiseReport = (
  data: SiteWiseReportRow[],
  month: number,
  year: number,
  filters: {
    employeeCodes?: string[] | null;
    projectNames?: string | null;
  } = {}
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const fmt = (v?: number | null) => formatNum(v || 0);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedMonthHead = `${monthNames[month - 1]} ${year}`;

  const headerFilters = [
    formattedMonthHead.toUpperCase(),
    filters.employeeCodes?.length
      ? `EMP CODES: ${filters.employeeCodes.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");

  // Group and Aggregate by Project & Employee
  const projectGroups: Record<string, SiteWiseReportRow[]> = {};
  data.forEach((r) => {
    const pn = r.projectName || "Unassigned Project";
    if (!projectGroups[pn]) projectGroups[pn] = [];
    projectGroups[pn].push(r);
  });

  const sortedProjectNames = Object.keys(projectGroups).sort();

  let contentHtml = sortedProjectNames
    .map((pn) => {
      const rawRows = projectGroups[pn];

      // Aggregate by employee within each project
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
          existing.breakfastAllowance =
            (existing.breakfastAllowance || 0) + (r.breakfastAllowance || 0);
          existing.otherAllowance =
            (existing.otherAllowance || 0) + (r.otherAllowance || 0);
          existing.totalAllowance =
            (existing.totalAllowance || 0) + (r.totalAllowance || 0);
          existing.baseSalary =
            (existing.baseSalary || 0) + (r.baseSalary || 0);
          existing.totalSalary =
            (existing.totalSalary || 0) + (r.totalSalary || 0);
        }
      });

      const aggregatedRows = Array.from(empMap.values());
      const sHours = aggregatedRows.reduce(
        (s, r) => s + (r.projectHours || 0),
        0
      );
      const sOT = aggregatedRows.reduce((s, r) => s + (r.projectOT || 0), 0);
      const sBaseSalary = aggregatedRows.reduce(
        (s, r) => s + (r.baseSalary || 0),
        0
      );
      const sBreakfast = aggregatedRows.reduce(
        (s, r) => s + (r.breakfastAllowance || 0),
        0
      );
      const sOther = aggregatedRows.reduce(
        (s, r) => s + (r.otherAllowance || 0),
        0
      );
      const sTotalAllowance = aggregatedRows.reduce(
        (s, r) => s + (r.totalAllowance || 0),
        0
      );
      const sSalary = aggregatedRows.reduce(
        (s, r) => s + (r.totalSalary || 0),
        0
      );

      return `
      <div class="section-container">
        <div class="section-header">
          <div class="section-title">${pn}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 25px;">#</th>
              <th style="width: 60px;">Emp. Code</th>
              <th class="text-left">Employee Name</th>
              <th style="width: 55px;">Project Hrs</th>
              <th style="width: 55px;">Project OT</th>
              <th style="width: 50px;">Rate</th>
              <th style="width: 70px;">Salary</th>
              <th style="width: 55px;">Brf. Alw.</th>
              <th style="width: 65px;">Other Alw.</th>
              <th style="width: 65px;">Total Alw.</th>
              <th style="width: 80px;">Total Salary</th>
            </tr>
          </thead>
          <tbody>
            ${aggregatedRows
              .map(
                (r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.empCode || "-"}</td>
                <td class="text-left">${r.employeeName || "-"}</td>
                <td>${fmt(r.projectHours)}</td>
                <td>${fmt(r.projectOT)}</td>
                <td>${r.hourlyRate?.toFixed(2) || "0.00"}</td>
                <td>${fmt(r.baseSalary)}</td>
                <td>${fmt(r.breakfastAllowance)}</td>
                <td>${fmt(r.otherAllowance)}</td>
                <td>${fmt(r.totalAllowance)}</td>
                <td class="text-primary font-bold">${fmt(r.totalSalary)}</td>
              </tr>
            `
              )
              .join("")}
            <tr class="bg-footer">
              <td colspan="3" class="text-right px-4 text-primary">${pn} - TOTAL :</td>
              <td class="text-primary font-bold">${fmt(sHours)}</td>
              <td class="text-primary font-bold">${fmt(sOT)}</td>
              <td></td>
              <td class="text-primary font-bold">${fmt(sBaseSalary)}</td>
              <td class="text-primary font-bold">${fmt(sBreakfast)}</td>
              <td class="text-primary font-bold">${fmt(sOther)}</td>
              <td class="text-primary font-bold">${fmt(sTotalAllowance)}</td>
              <td class="text-primary font-bold">${fmt(sSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    })
    .join("");

  // Grand Totals
  const gHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const gOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const gBaseSalary = data.reduce((s, r) => s + (r.baseSalary || 0), 0);
  const gBreakfast = data.reduce((s, r) => s + (r.breakfastAllowance || 0), 0);
  const gOther = data.reduce((s, r) => s + (r.otherAllowance || 0), 0);
  const gTotalAllowance = data.reduce((s, r) => s + (r.totalAllowance || 0), 0);
  const gSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  contentHtml += `
    <div class="section-container" style="border: none; margin-top: 20px;">
      <table>
        <tbody>
          <tr class="bg-footer">
            <td colspan="3" class="text-right px-4 text-primary" style="font-size: 11px;">GRAND TOTAL :</td>
            <td style="width: 55px;" class="text-primary font-bold">${fmt(gHours)}</td>
            <td style="width: 55px;" class="text-primary font-bold">${fmt(gOT)}</td>
            <td style="width: 50px;"></td>
            <td style="width: 70px;" class="text-primary font-bold">${fmt(gBaseSalary)}</td>
            <td style="width: 55px;" class="text-primary font-bold">${fmt(gBreakfast)}</td>
            <td style="width: 65px;" class="text-primary font-bold">${fmt(gOther)}</td>
            <td style="width: 65px;" class="text-primary font-bold">${fmt(gTotalAllowance)}</td>
            <td style="width: 80px;" class="text-primary font-bold">${fmt(gSalary)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const printContent = generatePrintHtml(
    "SITE WISE DETAILED REPORT",
    headerFilters,
    contentHtml,
    formattedMonthHead,
    "landscape"
  );
  printWindow.document.write(printContent);
  printWindow.document.close();
};

const generatePrintHtml = (
  title: string,
  filters: string,
  content: string,
  monthHead: string,
  orientation: "portrait" | "landscape"
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${monthHead}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 8px; }
          .print-header { width: 100%; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 14px; margin-bottom: 5px; text-align: center; }
          .print-header p { font-size: 10px; text-align: center; color: #555; }
          
          .section-container { margin-bottom: 15px; page-break-after: auto; }
          .section-header {
            background-color: #f3f4f6; padding: 4px 10px; border: 1px solid #ddd;
            border-bottom: none; display: flex; justify-content: space-between; align-items: center;
          }
          .section-title { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #b91c1c; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 7.5px; table-layout: fixed; }
          th, td { border: 1px solid #ddd; padding: 3px 1px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          th { background-color: #f3f4f6; font-weight: bold; }
          
          .text-left { text-align: left; padding-left: 4px; }
          .text-right { text-align: right; }
          .text-primary { color: #b91c1c; }
          .font-bold { font-weight: bold; }
          .bg-footer { background-color: #f3f4f6; font-weight: bold; }
          .px-4 { padding-left: 10px; padding-right: 10px; }

          @media print {
            @page { 
              size: A4 ${orientation}; 
              margin: 0.5cm 0.5cm 1.5cm 0.5cm; 
            }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .section-container { page-break-inside: auto; border-bottom: 1px solid #f3f4f6; margin-bottom: 10px; padding-bottom: 10px; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>${title}</h1>
          <p>${filters.toUpperCase()}</p>
        </div>
        ${content}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;
};
