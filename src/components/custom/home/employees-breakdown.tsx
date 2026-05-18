"use client";

import { Skeleton } from "primereact/skeleton";

import { PieChart } from "@/components";
import { useGetEmployeeBreakdown } from "@/lib/db/services/dashboard";

const EmployeesBreakdown = () => {
  const { data: employeeBreakdown, isLoading } = useGetEmployeeBreakdown();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl w-full p-6 col-span-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Employees Breakdown
            </h3>
            <Skeleton width="5rem" height="1rem" className="mt-1" />
          </div>
        </div>
        <div className="h-[400px] w-full min-w-0 mt-6 relative flex items-center justify-center">
          <Skeleton shape="circle" size="18rem" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl w-full p-6 col-span-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Employees Breakdown
          </h3>
          <p className="text-gray-500 text-sm font-normal">
            Total {employeeBreakdown?.total ?? 0}
          </p>
        </div>
      </div>
      <div className="h-[500px] w-full min-w-0 mt-6 relative flex items-center justify-center">
        <PieChart employeeBreakdown={employeeBreakdown} />
      </div>
    </div>
  );
};

export default EmployeesBreakdown;
