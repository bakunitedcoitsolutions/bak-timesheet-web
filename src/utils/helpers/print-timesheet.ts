import { EmployeeMonthlyReport } from "@/lib/db/services/timesheet/timesheet.dto";

/**
 * Prints the Monthly Timesheet Report for the given employees.
 * Generates a full-page print view with custom headers, daily rows, and footer totals.
 */
export const printTimesheetReport = (
  reportsToPrint: EmployeeMonthlyReport[],
  monthName: string,
  year: number
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Monthly Timesheet Report - ${monthName} ${year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .print-header { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 18px; margin-bottom: 5px; text-align: center; }
          .print-header p { font-size: 14px; text-align: center; color: #555; }
          
          .employee-section { margin-bottom: 30px; page-break-after: auto; }
          .employee-header {
            background-color: #f3f4f6; padding: 10px; border: 1px solid #ddd;
            border-bottom: none; display: flex; justify-content: space-between; align-items: center;
          }
          .employee-info { font-weight: bold; font-size: 13px; text-transform: uppercase; color: var(--primary-color); }
          .employee-meta { font-size: 11px; color: #555; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: center; }
          th { background-color: #f3f4f6; font-weight: bold; }
          td { word-wrap: break-word; }
          
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-blue { color: #2563eb; } /* blue-600 */
          .text-red { color: #ef4444; } /* red-500 for potential use */
          .font-bold { font-weight: bold; }
          .bg-footer { background-color: #f3f4f6; font-weight: bold; }

          @media print {
            @page { size: A4; margin: 1cm; }
            body { padding: 0; }
            .employee-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>MONTHLY TIMESHEET REPORT</h1>
          <p>${monthName.toUpperCase()} ${year}</p>
        </div>
        
        ${reportsToPrint
          .map((report) => {
            // Calculate totals
            const p1Hrs = report.dailyRecords.reduce(
              (s: number, r: any) => s + (r.project1Hours || 0),
              0
            );
            const p1OT = report.dailyRecords.reduce(
              (s: number, r: any) => s + (r.project1Overtime || 0),
              0
            );
            const p2Hrs = report.dailyRecords.reduce(
              (s: number, r: any) => s + (r.project2Hours || 0),
              0
            );
            const p2OT = report.dailyRecords.reduce(
              (s: number, r: any) => s + (r.project2Overtime || 0),
              0
            );
            const grandTotal = p1Hrs + p1OT + p2Hrs + p2OT;

            return `
            <div class="employee-section">
              <div class="employee-header">
                <div class="employee-info">
                  ${report.employeeCode} - ${report.nameEn} 
                  <span style="font-weight: normal; color: #000;">(${report.designationName || "-"})</span>
                </div>
                <div class="employee-meta">
                  ID# ${report.idCardNo || "N/A"}
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th style="width: 90px;">Date</th>
                    <th>Project 1</th>
                    <th style="width: 50px;">Hrs</th>
                    <th style="width: 50px;">OT</th>
                    <th>Project 2</th>
                    <th style="width: 50px;">Hrs</th>
                    <th style="width: 50px;">OT</th>
                    <th style="width: 60px;">Total</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${report.dailyRecords
                    .map(
                      (record) => `
                    <tr>
                      <td>${record.day}</td>
                      <td>${record.date}</td>
                      <td class="text-left">${record.project1Name || "-"}</td>
                      <td>${record.project1Hours || 0}</td>
                      <td class="text-blue">${record.project1Overtime || 0}</td>
                      <td class="text-left">${record.project2Name || "-"}</td>
                      <td>${record.project2Hours || 0}</td>
                      <td class="text-blue">${record.project2Overtime || 0}</td>
                      <td class="font-bold">${record.project1Hours + record.project1Overtime + record.project2Hours + record.project2Overtime}</td>
                      <td class="text-left">${record.remarks || ""}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="bg-footer text-center">Total</td>
                    <td class="bg-footer">${p1Hrs}</td>
                    <td class="bg-footer text-blue">${p1OT}</td>
                    <td class="bg-footer text-center">-</td>
                    <td class="bg-footer">${p2Hrs}</td>
                    <td class="bg-footer text-blue">${p2OT}</td>
                    <td class="bg-footer">${grandTotal}</td>
                    <td class="bg-footer"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            `;
          })
          .join("")}

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
