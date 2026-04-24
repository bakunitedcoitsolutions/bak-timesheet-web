import { LeaveEligibilityReport } from "@/lib/db/services/leave-eligibility/leave-eligibility.dto";

export const printLeaveEligibilityReport = (report: LeaveEligibilityReport) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const employee = report.employee;
  const data = report.monthlyStats.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  const remainingDays = 624 - report.totalWorkingDays;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Employee Leave Statement - ${employee.employeeCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; color: #333; }
          .print-header { width: 100%; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header-left { display: flex; flex-direction: column; gap: 4px; }
          .employee-code-name { font-size: 16px; font-weight: bold; }
          .employee-id { font-size: 12px; color: #555; }
          .header-right { font-size: 14px; font-weight: bold; text-align: right; color: #b91c1c; }
          
          .eligibility-box { 
            width: 100%; 
            margin-bottom: 15px; 
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: ${report.eligibilityStatus.isEligible ? "#059669" : "#b91c1c"};
          }

          .statement-title {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 8px;
            padding: 0 4px;
          }
          .statement-title h3 { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #b91c1c; }
          .statement-title span { font-size: 10px; color: #666; font-weight: bold; }

          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 11px; table-layout: fixed; }
          th, td { border: 1px solid #ddd; padding: 8px 6px; text-align: center; word-wrap: break-word; }
          th { background-color: #f3f4f6; font-weight: bold; text-transform: uppercase; font-size: 10px; }
          
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .text-primary { color: #b91c1c; }
          .text-red { color: #dc2626; }
          .text-green { color: #059669; }
          .bg-footer { background-color: #f9fafb; font-weight: bold; }

          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body {
              width: 100%;
              background-color: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { padding: 0 10px; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="header-left">
            <div class="employee-code-name">
              ${employee.employeeCode} - ${employee.nameEn}
            </div>
            ${employee.idCardNo ? `<div class="employee-id">ID Card: <strong>${employee.idCardNo}</strong></div>` : ""}
          </div>
          <div class="header-right">
            ${employee.nationalityCode ? `${employee.nationalityCode}, ` : ""}${employee.designation}
          </div>
        </div>

        <div class="eligibility-box">
          ${report.eligibilityStatus.message}
        </div>

        <div class="statement-title">
          <h3>Working Days Statement</h3>
          <span>Calculation Start Date: ${report.startDate}</span>
        </div>
        
        <table>
          <colgroup>
            <col style="width: 10%;" />
            <col style="width: 60%;" />
            <col style="width: 30%;" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th class="text-left">Month</th>
              <th>Work Days</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                <td style="color: #6b7280;">${row.id}</td>
                <td class="text-left font-bold" style="color: #4b5563;">${row.month}</td>
                <td class="font-bold text-primary">${row.workingDays}</td>
              </tr>
            `
              )
              .join("")}
            
            <tr class="bg-footer">
              <td colspan="2" class="text-right" style="padding-right: 20px; font-size: 12px; color: #4b5563;">Total Work Days:</td>
              <td class="text-primary" style="font-size: 13px;">${report.totalWorkingDays}</td>
            </tr>
            <tr class="bg-footer">
              <td colspan="2" class="text-right" style="padding-right: 20px; font-size: 12px; color: #4b5563;">Work Days Required for eligible to vacation:</td>
              <td class="text-primary" style="font-size: 13px;">624</td>
            </tr>
            <tr class="bg-footer">
              <td colspan="2" class="text-right" style="padding-right: 20px; font-size: 12px; color: #4b5563;">Work Days remaining for Vacation:</td>
              <td class="${remainingDays > 0 ? "text-red" : "text-green"}" style="font-size: 13px;">${remainingDays}</td>
            </tr>
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
