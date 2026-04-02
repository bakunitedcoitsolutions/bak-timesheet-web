import { formatNum } from "@/utils/helpers";
import { EmployeeInfo } from "@/lib/db/services/ledger/ledger.dto";

export interface PrintLedgerEntry {
  id: number;
  date: string;
  description: string;
  salary: number | null;
  netSalary: number | null;
  loan: number | null;
  challan: number | null;
  deduction: number | null;
  balance: number;
}

export const printLedgerReport = (
  data: PrintLedgerEntry[],
  employee: EmployeeInfo,
  totals: {
    salary: number;
    netSalary: number;
    loan: number;
    challan: number;
    deduction: number;
  },
  designationName?: string
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const fmt = (v?: number | null) =>
    v !== null && v !== undefined && v !== 0 ? formatNum(v) : "-";
  // For zeros in the footer or specific columns, we might just want "0" or empty.
  // The UI showed empty for missing, and formatNum handles grouping.

  const colGroupHtml = `
    <colgroup>
      <col style="width: 4%;" />
      <col style="width: 14%;" />
      <col style="width: 26%;" />
      <col style="width: 10%;" />
      <col style="width: 10%;" />
      <col style="width: 10%;" />
      <col style="width: 10%;" />
      <col style="width: 10%;" />
      <col style="width: 12%;" />
    </colgroup>
  `;

  const closingBalance = data.length > 0 ? data[data.length - 1].balance : 0;

  const employeeName = employee.nameEn || "";
  const idCardNumber = employee.idCardNo || "";

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ledger Report - ${employee.employeeCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
          .print-header { width: 100%; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header-left { display: flex; flex-direction: column; gap: 4px; }
          .employee-code-name { font-size: 16px; font-weight: bold; }
          .employee-id { font-size: 12px; color: #555; }
          .header-right { font-size: 14px; font-weight: bold; text-align: right; color: #b91c1c; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px; table-layout: fixed; }
          th, td { border: 1px solid #ddd; padding: 6px 4px; text-align: center; word-wrap: break-word; }
          th { background-color: #f3f4f6; font-weight: bold; padding: 8px 4px; }
          
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-primary { color: #b91c1c; } /* Using primary color */
          .font-bold { font-weight: bold; }
          .text-red { color: #dc2626; }
          .bg-footer { background-color: #f3f4f6; font-weight: bold; }

          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body {
              width: 210mm;
              background-color: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { padding: 0; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="header-left">
            <div class="employee-code-name">
              ${employee.employeeCode} - ${employeeName}
            </div>
            ${idCardNumber ? `<div class="employee-id">ID Card: <strong>${idCardNumber}</strong></div>` : ""}
          </div>
          ${designationName ? `<div class="header-right">${designationName}</div>` : ""}
        </div>
        
        <table>
          ${colGroupHtml}
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th class="text-left">Description</th>
              <th>Salary</th>
              <th>Paid Salary</th>
              <th>Loan</th>
              <th>Traffic</th>
              <th>Deduction</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                <td style="color: #6b7280;">${row.id}</td>
                <td class="text-left">${row.date}</td>
                <td class="text-left">${row.description}</td>
                <td>${fmt(row.salary)}</td>
                <td>${fmt(row.netSalary)}</td>
                <td>${fmt(row.loan)}</td>
                <td>${fmt(row.challan)}</td>
                <td class="text-red">${fmt(row.deduction)}</td>
                <td class="font-bold">${formatNum(row.balance)}</td>
              </tr>
            `
              )
              .join("")}
            
            ${
              data.length > 0
                ? `
              <tr>
                <td colspan="3" class="bg-footer text-right font-bold" style="padding-right: 15px;">Total:</td>
                <td class="bg-footer font-bold">${totals.salary > 0 ? formatNum(totals.salary) : "-"}</td>
                <td class="bg-footer font-bold">${totals.netSalary > 0 ? formatNum(totals.netSalary) : "-"}</td>
                <td class="bg-footer font-bold">${totals.loan > 0 ? formatNum(totals.loan) : "-"}</td>
                <td class="bg-footer font-bold">${totals.challan > 0 ? formatNum(totals.challan) : "-"}</td>
                <td class="bg-footer font-bold text-red">${totals.deduction > 0 ? formatNum(totals.deduction) : "-"}</td>
                <td class="bg-footer font-bold text-primary">${formatNum(closingBalance)}</td>
              </tr>
            `
                : `
              <tr>
                <td colspan="9" style="padding: 20px 0;">No ledger data found for this employee.</td>
              </tr>
            `
            }
          </tbody>
        </table>

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
