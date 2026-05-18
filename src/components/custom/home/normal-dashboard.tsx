"use client";

import StatsGrid from "./stats-grid";
import ChartSection from "./chart-section";
import ExpensesTable from "./expenses-table";

const NormalDashboard = () => {
  return (
    <div className="flex flex-col gap-6 px-6 py-6 overflow-hidden!">
      {/* Stats Grid */}
      <StatsGrid />

      {/* Chart Section */}
      <ChartSection />

      {/* Expenses by Project Table */}
      <ExpensesTable />
    </div>
  );
};

export default NormalDashboard;
