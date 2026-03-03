import { formatNum, formatPayrollPeriod } from "@/utils/helpers";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

export type PayrollReportRow = PayrollDetailEntry & {
  sectionName: string;
  sectionOrder: number;
  displayIndex: number;
  paymentMethodName?: string;
};

/**
 * Prints the Payroll Report in Landscape format.
 * Groups data by Payroll Section.
 */
export const printPayrollReport = (
  data: PayrollReportRow[],
  month: number,
  year: number,
  filters: {
    paymentMethodName?: string | null;
    sectionOrDesignationName?: string | null;
    employeeCodes?: string[] | null;
  } = {}
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formattedPeriod = formatPayrollPeriod(month, year);

  // Group data by section
  const sections: {
    [key: string]: { rows: PayrollReportRow[]; order: number };
  } = {};
  data.forEach((row) => {
    const section = row.sectionName || "Unassigned";
    const order = row.sectionOrder || 9999;
    if (!sections[section]) {
      sections[section] = { rows: [], order };
    }
    sections[section].rows.push(row);
  });

  const sortedSections = Object.entries(sections)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([name, { rows }]) => ({ name, rows }));

  const fmt = (v?: number | null) => formatNum(v || 0);
  const fmtHR = (v?: number | null) => Number(v || 0).toFixed(2);

  const colGroupHtml = `
    <colgroup>
      <col style="width: 15px;" />
      <col style="width: 40px;" />
      <col style="width: 130px;" />
      <col style="width: 60px;" />
      <col style="width: 60px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 45px;" />
      <col style="width: 40px;" />
      <col style="width: 40px;" />
      <col style="width: 60px;" />
    </colgroup>
  `;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payroll Report - ${formattedPeriod}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 9px; }
          .print-header { width: 100%; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 16px; margin-bottom: 5px; text-align: center; }
          .print-header p { font-size: 12px; text-align: center; color: #555; }
          
          .section-container { margin-bottom: 25px; page-break-after: auto; }
          .section-header {
            background-color: #f3f4f6; padding: 6px 10px; border: 1px solid #ddd;
            border-bottom: none; display: flex; justify-content: space-between; align-items: center;
          }
          .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #b91c1c; }
          .section-meta { font-size: 9px; font-weight: bold; color: black; background: #b91c1c; color: white; padding: 2px 6px; border-radius: 3px; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 8px; table-layout: fixed; }
          th, td { border: 1px solid #ddd; padding: 3px 2px; text-align: center; word-wrap: break-word; }
          th { background-color: #f3f4f6; font-weight: bold; }
          
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-primary { color: #b91c1c; } /* Using primary color */
          .font-bold { font-weight: bold; }
          .bg-footer { background-color: #f3f4f6; font-weight: bold; }

          @media print {
            @page { size: A4 landscape; margin: 0.8cm; }
            html, body {
              background-color: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { padding: 0; }
            .section-container { page-break-inside: auto; border-bottom: 2px solid #f3f4f6; margin-bottom: 10px; padding-bottom: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>PAYROLL REPORT</h1>
          <p>
            ${formattedPeriod.toUpperCase()}
            ${filters.sectionOrDesignationName ? ` | ${filters.sectionOrDesignationName}` : ""}
            ${filters.employeeCodes?.length ? ` | ${filters.employeeCodes.join(", ")}` : ""}
            ${filters.paymentMethodName ? ` | ${filters.paymentMethodName}` : ""}
          </p>
        </div>
        
        ${sortedSections
          .map(({ name, rows }, index) => {
            const isLast = index === sortedSections.length - 1;

            const s = (k: keyof PayrollDetailEntry) =>
              fmt(rows.reduce((sum, r) => sum + ((r as any)[k] || 0), 0));

            return `
          <div class="section-container" style="${isLast ? "border-bottom: none;" : ""}">
            <div class="section-header">
              <div class="section-title">${name}</div>
            </div>
            <table>
              ${colGroupHtml}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Code</th>
                  <th>Full Name</th>
                  <th>ID No</th>
                  <th>Designation</th>
                  <th>W.D</th>
                  <th>O.T</th>
                  <th>T.Hrs</th>
                  <th>H.R</th>
                  <th>B.Alw</th>
                  <th>O.Alw</th>
                  <th>T.Alw</th>
                  <th>T.Sal</th>
                  <th>P.Adv</th>
                  <th>C.Adv</th>
                  <th>L.Ded</th>
                  <th class="text-primary">N.Loan</th>
                  <th>P.Trf</th>
                  <th>C.Trf</th>
                  <th>T.Ded</th>
                  <th class="text-primary">N.Trf</th>
                  <th class="text-primary font-bold" style="font-size: 9px;">N.Sal</th>
                  <th>Card</th>
                  <th>Cash</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${row.empCode}</td>
                    <td class="text-left" style="font-size: 8.5px; display: flex; justify-content: space-between; align-items: center;">${row.name} ${row.isFixed ? '<span style="background: #e5e7eb; padding: 1px 3px; border-radius: 2px; font-size: 7px; margin-left: 10px;">F</span>' : ""}</td>
                    <td>${row.idNumber || "-"}</td>
                    <td>${row.designation || "-"}</td>
                    <td>${fmt(row.workDays)}</td>
                    <td>${fmt(row.overTime)}</td>
                    <td>${fmt(row.totalHours)}</td>
                    <td>${fmtHR(row.hourlyRate)}</td>
                    <td>${fmt(row.breakfastAllowance)}</td>
                    <td>${fmt(row.otherAllowances)}</td>
                    <td>${fmt(row.totalAllowances)}</td>
                    <td>${fmt(row.totalSalary)}</td>
                    <td>${fmt(row.previousAdvance)}</td>
                    <td>${fmt(row.currentAdvance)}</td>
                    <td>${fmt(row.loanDeduction)}</td>
                    <td class="text-primary font-bold">${fmt(row.netLoan)}</td>
                    <td>${fmt(row.previousChallan)}</td>
                    <td>${fmt(row.currentChallan)}</td>
                    <td>${fmt(row.challanDeduction)}</td>
                    <td class="text-primary font-bold">${fmt(row.netChallan)}</td>
                    <td class="text-primary font-bold" style="font-size: 9px;">${fmt(row.netSalaryPayable)}</td>
                    <td>${fmt(row.cardSalary)}</td>
                    <td>${fmt(row.cashSalary)}</td>
                    <td class="text-center" style="color: #666; font-size: 7px;">${
                      !!row.remarks
                        ? `${row.remarks}<br/>(${row.paymentMethodName || ""})`
                        : row.paymentMethodName || ""
                    }</td>
                  </tr>
                `
                  )
                  .join("")}
                ${
                  rows.length > 1
                    ? `
                  <tr>
                    <td colspan="5" class="bg-footer text-right text-primary" style="padding-right: 10px;">${name} - TOTAL:</td>
                    <td class="bg-footer text-primary text-center">${s("workDays")}</td>
                    <td class="bg-footer text-primary text-center">${s("overTime")}</td>
                    <td class="bg-footer text-primary text-center">${s("totalHours")}</td>
                    <td class="bg-footer text-primary text-center">-</td>
                    <td class="bg-footer text-primary text-center">${s("breakfastAllowance")}</td>
                    <td class="bg-footer text-primary text-center">${s("otherAllowances")}</td>
                    <td class="bg-footer text-primary text-center">${s("totalAllowances")}</td>
                    <td class="bg-footer text-primary text-center">${s("totalSalary")}</td>
                    <td class="bg-footer text-primary text-center">${s("previousAdvance")}</td>
                    <td class="bg-footer text-primary text-center">${s("currentAdvance")}</td>
                    <td class="bg-footer text-primary text-center">${s("loanDeduction")}</td>
                    <td class="bg-footer text-primary text-center">${s("netLoan")}</td>
                    <td class="bg-footer text-primary text-center">${s("previousChallan")}</td>
                    <td class="bg-footer text-primary text-center">${s("currentChallan")}</td>
                    <td class="bg-footer text-primary text-center">${s("challanDeduction")}</td>
                    <td class="bg-footer text-primary text-center">${s("netChallan")}</td>
                    <td class="bg-footer text-primary text-center font-bold" style="font-size: 9px;">${s("netSalaryPayable")}</td>
                    <td class="bg-footer text-primary text-center">${s("cardSalary")}</td>
                    <td class="bg-footer text-primary text-center">${s("cashSalary")}</td>
                    <td class="bg-footer"></td>
                  </tr>
                `
                    : ""
                }
              </tbody>
            </table>
          </div>
          `;
          })
          .join("")}

        ${
          sortedSections.length > 0
            ? `
        <div class="section-container" style="border: none; margin-top: 10px;">
          <table>
            ${colGroupHtml}
            <tbody>
              <tr>
                 <td class="bg-footer text-right text-primary" colspan="5" style="font-size: 11px; padding: 6px 10px;">GRAND TOTAL:</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.workDays || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.overTime || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.totalHours || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">-</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.breakfastAllowance || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.otherAllowances || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.totalAllowances || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.totalSalary || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.previousAdvance || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.currentAdvance || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.loanDeduction || 0), 0))}</td>
                 <td class="bg-footer text-center text-primary" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.netLoan || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.previousChallan || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.currentChallan || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.challanDeduction || 0), 0))}</td>
                 <td class="bg-footer text-center text-primary" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.netChallan || 0), 0))}</td>
                 <td class="bg-footer text-center text-primary font-bold" style="font-size: 9px;">${fmt(data.reduce((sum, r) => sum + (r.netSalaryPayable || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.cardSalary || 0), 0))}</td>
                 <td class="bg-footer text-center" style="font-size: 8.5px;">${fmt(data.reduce((sum, r) => sum + (r.cashSalary || 0), 0))}</td>
                 <td class="bg-footer"></td>
              </tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
};
