"use client";

import { useState } from "react";
import numeral from "numeral";
import { Skeleton } from "primereact/skeleton";

import { BarChart, Dropdown } from "@/components";
import { useGetFinancialOverview } from "@/lib/db/services/dashboard";

const FinancialOverview = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearOptions = Array.from({ length: currentYear - 2023 + 1 }, (_, i) => {
    const year = currentYear - i;
    return { label: year.toString(), value: year };
  });

  const { data: overview, isLoading } = useGetFinancialOverview({
    year: selectedYear,
  });

  return (
    <div className="bg-white rounded-xl w-full p-6 col-span-1 xl:col-span-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Financial Overview
          </h3>
          <p className="text-gray-500 text-sm font-normal">
            Track your income and expenses over time
          </p>
        </div>
        <div className="w-36">
          <Dropdown
            small
            filter
            options={yearOptions}
            value={selectedYear}
            placeholder="Select Year"
            className="w-full"
            onChange={(e) => setSelectedYear(e.value)}
          />
        </div>
      </div>
      <div className="h-[500px] w-full min-w-0 mt-6 relative">
        {isLoading ? (
          <Skeleton width="100%" height="95%" />
        ) : (
          <BarChart monthlyExpenses={overview?.monthlyExpenses} />
        )}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <div
          className={`w-12 h-12 rounded-xl bg-[#F6F7F9] flex items-center justify-center`}
        >
          <i className="fa-light fa-wave-pulse text-xl text-primary"></i>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-normal">Total Expenses</p>
          {isLoading ? (
            <Skeleton width="6rem" height="1.5rem" className="mt-1" />
          ) : (
            <p className="text-base font-semibold uppercase">
              SAR {numeral(overview?.totalExpenses ?? 0).format("0,0")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
