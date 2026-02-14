import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";
import dayjs from "dayjs";

/**
 * Prints the Daily Timesheet Report.
 * Groups data by Payroll Section and generates a printable HTML view.
 */
import { GlobalDataGeneral } from "@/context/GlobalDataContext";

/**
 * Prints the Daily Timesheet Report.
 * Groups data by Payroll Section and generates a printable HTML view.
 */
export const printDailyTimesheetReport = (
  data: TimesheetPageRow[],
  date: Date,
  selectedProjectName?: string | null,
  payrollSections: GlobalDataGeneral[] = []
) => {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const formattedDate = dayjs(date).format("DD MMM YYYY");

  // Group data by section
  const sections: { [key: string]: TimesheetPageRow[] } = {};
  data.forEach((row) => {
    const section = (row as any).sectionName || "Unassigned";
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push(row);
  });

  const sortedSectionNames = Object.keys(sections).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;

    const sectionA = payrollSections.find((s) => s.nameEn === a);
    const sectionB = payrollSections.find((s) => s.nameEn === b);

    const orderA = sectionA?.displayOrderKey ?? Number.MAX_SAFE_INTEGER;
    const orderB = sectionB?.displayOrderKey ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;

    return a.localeCompare(b);
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Timesheet Report - ${formattedDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          .print-header { width: 100%; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-header h1 { font-size: 18px; margin-bottom: 5px; text-align: center; }
          .print-header p { font-size: 14px; text-align: center; color: #555; }
          
          .section-container { margin-bottom: 30px; page-break-after: auto; }
          .section-header {
            background-color: #f3f4f6; padding: 10px; border: 1px solid #ddd;
            border-bottom: none; display: flex; justify-content: space-between; align-items: center;
          }
          .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: var(--primary-color); }
          .section-meta { font-size: 11px; font-weight: bold; color: black; }
          .project-name { font-size: 14px; font-weight: bold; color: black; }
          .project-badge { font-size: 11px; font-weight: bold; background-color: #64748b; color: white; padding: 2px 8px; border-radius: 4px; margin-right: 5px; }
          
          table { width: 100%; border-collapse: collapse; border: 1px solid #ddd; font-size: 10px; }
          th, td { border: 1px solid #ddd; padding: 5px; text-align: center; }
          th { background-color: #f3f4f6; font-weight: bold; }
          td { word-wrap: break-word; }
          
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .text-blue { color: #2563eb; } /* blue-600 */
          .font-bold { font-weight: bold; }
          .bg-footer { background-color: #f3f4f6; font-weight: bold; }

          @media print {
            @page { size: A4; margin: 1cm; }
            html, body {
              background-color: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body { padding: 0; }
            .section-container { page-break-inside: auto; border-bottom: 2px solid #f3f4f6; margin-bottom: 15px; padding-bottom: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>DAILY TIMESHEET REPORT</h1>
          <p>${formattedDate.toUpperCase()}</p>
        </div>
        
        ${sortedSectionNames
          .map((sectionName, index) => {
            const rows = sections[sectionName];
            // Check if this is the last section
            const isLast = index === sortedSectionNames.length - 1;

            // Calculate Section Totals
            const p1Hrs = rows.reduce(
              (sum, r) => sum + (r.project1Hours || 0),
              0
            );
            const p1OT = rows.reduce(
              (sum, r) => sum + (r.project1Overtime || 0),
              0
            );
            const p2Hrs = rows.reduce(
              (sum, r) => sum + (r.project2Hours || 0),
              0
            );
            const p2OT = rows.reduce(
              (sum, r) => sum + (r.project2Overtime || 0),
              0
            );
            const total = rows.reduce((sum, r) => sum + (r.totalHours || 0), 0);

            return `
            <div class="section-container" style="${isLast ? "border-bottom: none;" : ""}">
              <div class="section-header">
                <div class="section-title">
                  ${sectionName}
                  ${
                    selectedProjectName
                      ? `<span class="section-meta" style="margin-left: 10px;">${formattedDate}</span>`
                      : ""
                  }
                </div>
                <div>
                   ${
                     selectedProjectName
                       ? `<span class="project-name">${selectedProjectName}</span>`
                       : `<span class="section-meta">${formattedDate}</span>`
                   }
                  
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th style="width: 60px;">Code</th>
                    <th style="min-width: 150px;">Employee Name</th>
                    <th style="min-width: 100px;">Project 1</th>
                    <th style="width: 40px;">Hrs</th>
                    <th style="width: 40px;">OT</th>
                    <th style="min-width: 100px;">Project 2</th>
                    <th style="width: 40px;">Hrs</th>
                    <th style="width: 40px;">OT</th>
                    <th style="width: 50px;">Total</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows
                    .map(
                      (row, index) => `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${row.employeeCode}</td>
                      <td class="text-left">
                        <div>${row.nameEn}</div>
                        <div style="font-size: 9px; color: #666;">${row.designationNameEn || ""}</div>
                      </td>
                      <td class="text-left">${(row as any).project1Name || "-"}</td>
                      <td>${row.project1Hours || 0}</td>
                      <td class="text-blue">${row.project1Overtime || 0}</td>
                      <td class="text-left">${(row as any).project2Name || "-"}</td>
                      <td>${row.project2Hours || 0}</td>
                      <td class="text-blue">${row.project2Overtime || 0}</td>
                      <td class="font-bold">${row.totalHours || 0}</td>
                      <td class="text-left">${row.description || ""}</td>
                    </tr>
                  `
                    )
                    .join("")}
                    <tr>
                      <td colspan="4" class="bg-footer text-center">Section Total</td>
                      <td class="bg-footer">${p1Hrs}</td>
                      <td class="bg-footer text-blue">${p1OT}</td>
                      <td class="bg-footer text-center">-</td>
                      <td class="bg-footer">${p2Hrs}</td>
                      <td class="bg-footer text-blue">${p2OT}</td>
                      <td class="bg-footer">${total}</td>
                      <td class="bg-footer"></td>
                    </tr>
                </tbody>
              </table>
            </div>
            `;
          })
          .join("")}

          <div class="section-container" style="border: none; margin-top: 10px;">
            <table>
              <tbody>
                <tr>
                   <td class="bg-footer text-center" style="font-size: 14px;">${data.length}</td>
                   <td colspan="3" class="bg-footer text-center" style="font-size: 14px;">GRAND TOTAL</td>
                   <td class="bg-footer" colspan="2" style="font-size: 14px; width: 50px;">
                     ${data.reduce((sum, r) => sum + (r.project1Hours || 0), 0)}
                   </td>
                   <td class="bg-footer text-blue" colspan="2" style="font-size: 14px; width: 50px;">
                     ${data.reduce((sum, r) => sum + (r.project1Overtime || 0), 0)}
                   </td>
                   <td class="bg-footer text-center" style="font-size: 14px; min-width: 20px;">-</td>
                   <td class="bg-footer" colspan="2" style="font-size: 14px; width: 50px;">
                     ${data.reduce((sum, r) => sum + (r.project2Hours || 0), 0)}
                   </td>
                   <td class="bg-footer text-blue" colspan="2" style="font-size: 14px; width: 50px;">
                     ${data.reduce((sum, r) => sum + (r.project2Overtime || 0), 0)}
                   </td>
                   <td class="bg-footer" colspan="2" style="font-size: 14px; width: 60px;">
                     ${data.reduce((sum, r) => sum + (r.totalHours || 0), 0)}
                   </td>
                </tr>
              </tbody>
            </table>
          </div>

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
