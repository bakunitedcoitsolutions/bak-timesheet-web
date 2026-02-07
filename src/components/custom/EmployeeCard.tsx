import Image from "next/image";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

// h-[3.3in]
// w-[2.1in]

// Card Component for individual employee
export const EmployeeCard = ({
  employee,
  designationName,
}: {
  employee: ListedEmployee;
  designationName?: string;
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col items-center w-[2.7in] h-[4in] relative print:break-inside-avoid print:shadow-none print:border print:border-gray-200">
      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Logo Box */}
        <div className="w-full flex flex-col items-center py-3 px-4 bg-gray-100">
          <div className="relative w-14 h-14">
            <Image
              fill
              alt="BAK Logo"
              className="object-contain"
              src="/assets/images/bak_transparent_logo.png"
            />
          </div>
          {/* Company Name */}
          <h3 className="text-primary font-bold text-sm mt-3 text-center whitespace-nowrap">
            BAK United Contracting Co
          </h3>
        </div>

        {/* Employee Code Pill */}
        <div className="bg-gray-100 rounded-full px-4 py-1 mt-3 mb-1">
          <span className="text-gray-600 font-semibold text-xs">Emp# </span>
          <span className="text-primary font-bold text-sm">
            {employee.employeeCode}
          </span>
        </div>

        {/* Names */}
        <div className="flex flex-col items-center gap-2 mt-2 text-center">
          <h2 className="text-[#1E2939] font-bold text-base uppercase leading-tight px-2">
            {employee.nameEn}
          </h2>
          {employee.nameAr && (
            <h2 className="text-[#1E2939] font-arabic font-medium! -mt-2 text-2xl! leading-tight px-2">
              {employee.nameAr}
            </h2>
          )}
        </div>

        {/* Divider with Red Dot */}
        <div className="flex items-center w-full max-w-[200px] gap-2 mt-4 mb-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C0202E]"></div>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Designation Button */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-[#1E2939] font-bold text-sm uppercase leading-tight px-2">
            {designationName || "EMPLOYEE"}
          </h2>
        </div>

        {/* ID Card Box */}
        <div className="bg-gray-100 border border-[#E5E7EB] rounded-lg w-[85%] my-4 py-2 px-4 flex flex-col items-center mt-auto">
          <span className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">
            ID CARD NUMBER
          </span>
          <span className="text-[#1a2b3c] font-bold text-base tracking-wider">
            {employee.idCardNo || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
