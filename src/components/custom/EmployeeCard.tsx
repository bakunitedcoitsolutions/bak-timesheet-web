import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";

// Card Component for individual employee
export const EmployeeCard = ({
  employee,
  designationName,
}: {
  employee: ListedEmployee;
  designationName?: string;
}) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col items-center  w-[2.4in] h-[3.1in] relative border border-gray-100">
      {/* Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center flex-1">
        {/* Logo Box */}
        <div className="w-full flex flex-col items-center py-2 px-2 bg-gray-100">
          <div className="relative w-12 h-12">
            <img
              alt="BAK Logo"
              className="w-full h-full object-contain"
              src="/assets/images/bak_transparent_logo.png"
            />
          </div>
          {/* Company Name */}
          <h3 className="text-primary font-bold text-xs mt-1 text-center whitespace-nowrap">
            BAK United Contracting Co.
          </h3>
        </div>

        {/* Employee Code Pill */}
        <div className="bg-gray-100 rounded-full px-3 py-0.5 mt-2.5 mb-1.5">
          <span className="text-gray-600 font-semibold text-[10px]">Emp# </span>
          <span className="text-primary font-bold text-xs">
            {employee.employeeCode}
          </span>
        </div>

        {/* Names */}
        <div className="flex flex-col items-center gap-1 mt-1 text-center">
          <h2 className="text-[#1E2939] font-bold text-sm uppercase leading-tight px-2 line-clamp-2">
            {employee.nameEn}
          </h2>
          {employee.nameAr && (
            <h2 className="text-[#1E2939] font-arabic font-medium! -mt-1 text-xl! leading-tight px-1 line-clamp-1">
              {employee.nameAr}
            </h2>
          )}
        </div>

        {/* Divider with Red Dot */}
        <div className="flex items-center w-full max-w-[150px] gap-2 mt-2 mb-2">
          <div className="h-px bg-gray-200 flex-1"></div>
          <div className="w-1 h-1 rounded-full bg-[#C0202E]"></div>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Designation Button */}
        <div className="flex flex-col items-center gap-1 text-center mt-1 mb-1">
          <h2 className="text-[#1E2939] font-bold text-xs uppercase leading-tight px-2 line-clamp-2">
            {designationName || "EMPLOYEE"}
          </h2>
        </div>

        {/* ID Card Box */}
        <div className="bg-gray-100 border border-[#E5E7EB] rounded-lg w-[90%] my-2 py-1 px-4 flex flex-col items-center mt-auto mb-2">
          <span className="text-gray-500 font-bold text-[8px] tracking-widest uppercase">
            ID CARD NUMBER
          </span>
          <span className="text-[#1a2b3c] font-bold text-sm tracking-wider">
            {employee.idCardNo || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
