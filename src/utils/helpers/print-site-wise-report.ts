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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formattedMonthHead = `${monthNames[month - 1]} ${year}`;

  const headerFilters = [
    formattedMonthHead.toUpperCase(),
    (filters.projectNames && filters.projectNames !== "All") ? `PROJECT: ${filters.projectNames}` : null,
  ].filter(Boolean).join(" | ");

  const totalHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const totalOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const totalSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  const contentHtml = `
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th style="width: 100px;">Month</th>
          <th class="text-left">Project Name</th>
          <th style="width: 80px;">P. Hours</th>
          <th style="width: 80px;">P. OT</th>
          <th style="width: 90px;">T. Hours</th>
          <th style="width: 100px;">Total Salary</th>
        </tr>
      </thead>
      <tbody>
        ${data.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${r.month}</td>
            <td class="text-left font-bold">${r.projectName}</td>
            <td>${fmt(r.projectHours)}</td>
            <td>${fmt(r.projectOT)}</td>
            <td>${fmt((r.projectHours || 0) + (r.projectOT || 0))}</td>
            <td class="text-primary font-bold">${fmt(r.totalSalary)}</td>
          </tr>
        `).join("")}
        <tr class="bg-footer">
          <td colspan="3" class="text-right px-4 text-primary">GRAND TOTAL:</td>
          <td class="text-primary">${fmt(totalHours)}</td>
          <td class="text-primary">${fmt(totalOT)}</td>
          <td class="text-primary">${fmt(totalHours + totalOT)}</td>
          <td class="text-primary">${fmt(totalSalary)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const printContent = generatePrintHtml("SITE WISE SUMMARY REPORT", headerFilters, contentHtml, formattedMonthHead, "portrait");
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formattedMonthHead = `${monthNames[month - 1]} ${year}`;

  const headerFilters = [
    formattedMonthHead.toUpperCase(),
    filters.employeeCodes?.length 
      ? `EMP CODES: ${filters.employeeCodes.join(", ")}` 
      : null,
    (filters.projectNames && filters.projectNames !== "All") ? `PROJECT: ${filters.projectNames}` : null,
  ].filter(Boolean).join(" | ");

  // Group and Aggregate by Project & Employee
  const projectGroups: Record<string, SiteWiseReportRow[]> = {};
  data.forEach(r => {
    const pn = r.projectName || "Unassigned Project";
    if (!projectGroups[pn]) projectGroups[pn] = [];
    projectGroups[pn].push(r);
  });

  const sortedProjectNames = Object.keys(projectGroups).sort();

  let contentHtml = sortedProjectNames.map(pn => {
    const rawRows = projectGroups[pn];
    
    // Aggregate by employee within each project
    const empMap = new Map<number | string, SiteWiseReportRow>();
    rawRows.forEach(r => {
      const key = r.empCode || "NoCode";
      if (!empMap.has(key)) {
        empMap.set(key, { ...r });
      } else {
        const existing = empMap.get(key)!;
        existing.projectHours = (existing.projectHours || 0) + (r.projectHours || 0);
        existing.projectOT = (existing.projectOT || 0) + (r.projectOT || 0);
        existing.totalSalary = (existing.totalSalary || 0) + (r.totalSalary || 0);
      }
    });
    
    const aggregatedRows = Array.from(empMap.values());
    const sHours = aggregatedRows.reduce((s, r) => s + (r.projectHours || 0), 0);
    const sOT = aggregatedRows.reduce((s, r) => s + (r.projectOT || 0), 0);
    const sSalary = aggregatedRows.reduce((s, r) => s + (r.totalSalary || 0), 0);

    return `
      <div class="section-container">
        <div class="section-header">
          <div class="section-title">${pn}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th style="width: 80px;">Emp. Code</th>
              <th class="text-left">Employee Name</th>
              <th style="width: 85px;">Project Hours</th>
              <th style="width: 85px;">Project OT</th>
              <th style="width: 70px;">Rate</th>
              <th style="width: 90px;">Total Salary</th>
            </tr>
          </thead>
          <tbody>
            ${aggregatedRows.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.empCode || "-"}</td>
                <td class="text-left">${r.employeeName || "-"}</td>
                <td>${fmt(r.projectHours)}</td>
                <td>${fmt(r.projectOT)}</td>
                <td>${r.hourlyRate?.toFixed(2) || "0.00"}</td>
                <td class="text-primary font-bold">${fmt(r.totalSalary)}</td>
              </tr>
            `).join("")}
            <tr class="bg-footer">
              <td colspan="3" class="text-right px-4 text-primary">${pn} - TOTAL :</td>
              <td class="text-primary font-bold">${fmt(sHours)}</td>
              <td class="text-primary font-bold">${fmt(sOT)}</td>
              <td></td>
              <td class="text-primary font-bold">${fmt(sSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }).join("");

  // Grand Totals
  const gHours = data.reduce((s, r) => s + (r.projectHours || 0), 0);
  const gOT = data.reduce((s, r) => s + (r.projectOT || 0), 0);
  const gSalary = data.reduce((s, r) => s + (r.totalSalary || 0), 0);

  contentHtml += `
    <div class="section-container" style="border: none; margin-top: 20px;">
      <table>
        <tbody>
          <tr class="bg-footer">
            <td colspan="3" class="text-right px-4 text-primary" style="font-size: 11px;">GRAND TOTAL :</td>
            <td style="width: 85px;" class="text-primary font-bold">${fmt(gHours)}</td>
            <td style="width: 85px;" class="text-primary font-bold">${fmt(gOT)}</td>
            <td style="width: 70px;"></td>
            <td style="width: 90px;" class="text-primary font-bold">${fmt(gSalary)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const printContent = generatePrintHtml("SITE WISE DETAILED REPORT", headerFilters, contentHtml, formattedMonthHead, "portrait");
  printWindow.document.write(printContent);
  printWindow.document.close();
};

const generatePrintHtml = (title: string, filters: string, content: string, monthHead: string, orientation: "portrait" | "landscape" ) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${monthHead}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 9px; }
          .print-header { width: 100%; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 16px; margin-bottom: 5px; text-align: center; }
          .print-header p { font-size: 12px; text-align: center; color: #555; }
          
          .section-container { margin-bottom: 20px; page-break-after: auto; }
          .section-header {
            background-color: #f3f4f6; padding: 6px 10px; border: 1px solid #ddd;
            border-bottom: none; display: flex; justify-content: space-between; align-items: center;
          }
          .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #b91c1c; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 8.5px; table-layout: fixed; }
          th, td { border: 1px solid #ddd; padding: 4px 2px; text-align: center; white-space: nowrap; overflow: hidden; }
          th { background-color: #f3f4f6; font-weight: bold; }
          
          .text-left { text-align: left; }
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
