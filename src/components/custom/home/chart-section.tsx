"use client";

import FinancialOverview from "./financial-overview";
import EmployeesBreakdown from "./employees-breakdown";

const ChartSection = () => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <FinancialOverview />
      <EmployeesBreakdown />
    </div>
  );
};

export default ChartSection;
