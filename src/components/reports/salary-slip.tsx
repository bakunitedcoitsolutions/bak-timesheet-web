"use client";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

interface SalarySlipProps {
  employee: ListedEmployee;
  designationName?: string;
  monthYear?: string;
}

export const SalarySlip = ({
  employee,
  designationName,
  monthYear = "December 2025",
}: SalarySlipProps) => {
  return (
    <div
      className="w-full bg-white border border-gray-300 p-3 mb-0 text-[10px] relative mx-auto"
      style={{ maxWidth: "784px" }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-full">
          <h1 className="text-xl font-bold text-primary mb-2">Salary Slip</h1>

          {/* Employee Info Grid */}
          <div className="grid grid-cols-[auto_1fr_auto_100px] gap-x-2 gap-y-1 items-center w-full max-w-[78%]">
            {/* Row 1 */}
            <span className="font-bold text-gray-800">Employee:</span>
            <div className="bg-primary-light/50 border border-gray-200 px-2 py-0.5 uppercase whitespace-nowrap overflow-hidden text-ellipsis text-black font-semibold">
              {employee.nameEn || "N/A"}
            </div>
            <span className="font-bold text-gray-800 text-right">Code:</span>
            <div className="bg-primary-light/50 border border-gray-200 px-2 py-0.5 text-center text-black font-semibold">
              {employee.employeeCode}
            </div>

            {/* Row 2 */}
            <span className="font-bold text-gray-800">Designation:</span>
            <div className="bg-primary-light/50 border border-gray-200 px-2 py-0.5  col-span-3 text-black font-semibold">
              {designationName || "N/A"}
            </div>

            {/* Row 3 */}
            <span className="font-bold text-gray-800">Month:</span>
            <div className="bg-primary-light/50 border border-gray-200 px-2 py-0.5 text-black font-semibold">
              {monthYear}
            </div>
            <span className="font-bold text-gray-800 text-right">ID No:</span>
            <div className="bg-primary-light/50 border text-black font-semibold border-gray-200 px-2 py-0.5  text-center">
              {employee.idCardNo || "N/A"}
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="absolute right-9 top-5 flex flex-col items-center justify-start w-[120px]">
          <div className="w-16 h-16 mb-1">
            <img
              alt="BAK Logo"
              className="w-full h-full object-contain"
              src="/assets/images/bak_transparent_logo.png"
            />
          </div>
          <h2 className="font-bold text-black text-[10px] text-center leading-tight">
            BAK United
            <br />
            Contracting Co.
          </h2>
        </div>
      </div>

      {/* Red Divider Line */}
      <div className="w-full h-0.5 bg-primary mt-0.5 mb-2.5"></div>

      <div className="w-full flex gap-2.5">
        <div className="w-[78%]">
          <div className="w-full">
            {/* Earnings Table */}
            <table className="text-center border-collapse border border-gray-300 table-fixed w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Work Days
                  </th>
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Over Time
                  </th>
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Total Hrs
                  </th>
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Rate/Hr
                  </th>
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Allowance
                  </th>
                  <th className="border border-gray-300 py-0.5 px-1 font-bold text-gray-700 w-[13%]">
                    Salary
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 py-0.5 px-1 h-6">0</td>
                  <td className="border border-gray-300 py-0.5 px-1">0</td>
                  <td className="border border-gray-300 py-0.5 px-1">0</td>
                  <td className="border border-gray-300 py-0.5 px-1">0</td>
                  <td className="border border-gray-300 py-0.5 px-1">0</td>
                  <td className="border border-gray-300 py-0.5 px-1 font-bold">
                    0
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Deductions: Loans & Traffic */}
            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              {/* Loans */}
              <div className="border border-gray-300 flex flex-col h-full">
                <div className="bg-primary-light/50 border-b border-gray-300 py-0.5 px-1 font-bold text-center text-primary text-[9px]">
                  Advances / Loans
                </div>
                <div className="grid grid-cols-3 text-center border-b border-gray-300 bg-gray-50 text-[9px]">
                  <div className="border-r border-gray-300 py-0.5 font-semibold text-gray-600">
                    Previous
                  </div>
                  <div className="border-r border-gray-300 py-0.5 font-semibold text-gray-600">
                    Current
                  </div>
                  <div className="py-0.5 font-semibold text-gray-600">
                    Deduction
                  </div>
                </div>
                <div className="grid grid-cols-3 text-center border-b border-gray-300 flex-1 items-center">
                  <div className="border-r border-gray-300 py-0.5">0</div>
                  <div className="border-r border-gray-300 py-0.5">0</div>
                  <div className="py-0.5 text-red-600">0</div>
                </div>
                <div className="grid grid-cols-3 text-center items-center py-0.5 bg-gray-50">
                  <div className="col-span-2 border-r border-gray-300 py-0.5 font-bold text-gray-700 text-right text-[9px] pr-2">
                    Net Advance / Loan Balance:
                  </div>
                  <div className="py-0.5 font-bold">0</div>
                </div>
              </div>

              {/* Traffic Challan */}
              <div className="border border-gray-300 flex flex-col h-full">
                <div className="bg-primary-light/50 border-b border-gray-300 py-0.5 px-1 font-bold text-center text-primary text-[9px]">
                  Traffic Challan
                </div>
                <div className="grid grid-cols-3 text-center border-b border-gray-300 bg-gray-50 text-[9px]">
                  <div className="border-r border-gray-300 py-0.5 font-semibold text-gray-600">
                    Previous
                  </div>
                  <div className="border-r border-gray-300 py-0.5 font-semibold text-gray-600">
                    Current
                  </div>
                  <div className="py-0.5 font-semibold text-gray-600">
                    Deduction
                  </div>
                </div>
                <div className="grid grid-cols-3 text-center border-b border-gray-300 flex-1 items-center">
                  <div className="border-r border-gray-300 py-0.5">0</div>
                  <div className="border-r border-gray-300 py-0.5">0</div>
                  <div className="py-0.5 text-red-600">0</div>
                </div>
                <div className="grid grid-cols-3 text-center items-center py-0.5 bg-gray-50">
                  <div className="col-span-2 border-r border-gray-300 py-0.5 font-bold text-gray-700 text-right text-[9px] pr-2">
                    Net Traffic Challan Balance:
                  </div>
                  <div className="py-0.5 font-bold text-xs">0</div>
                </div>
              </div>
            </div>

            {/* Footer: Net Salary */}
            <div className="border border-gray-300 mt-2.5">
              <div className="flex bg-gray-100">
                <div className="py-1 px-4 flex-1 flex items-center justify-start">
                  <span className="font-bold text-xs mr-2">
                    Cash: 0 | Card: 0
                  </span>
                </div>
                <div className="py-1 px-4 flex-1 flex items-center justify-end">
                  <span className="font-bold text-gray-800 mr-2 text-xs">
                    Net Salary:
                  </span>
                  <span className="font-bold text-sm text-black">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 border border-gray-300 h-auto relative flex items-center justify-center">
          <span className="text-gray-300 text-[9px]">Thumb Impression</span>
        </div>
      </div>
    </div>
  );
};
