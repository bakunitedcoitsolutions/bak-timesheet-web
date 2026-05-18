"use client";

import { useState } from "react";
import { BarChart, Dropdown } from "@/components";
import { projects } from "@/utils/dummy";

const FinancialOverview = () => {
  const [selectedProject, setSelectedProject] = useState<string>("0");

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
        <Dropdown
          small
          filter
          options={projects}
          value={selectedProject}
          placeholder="Select Project"
          onChange={(e) => setSelectedProject(e.value)}
        />
      </div>
      <div className="h-[500px] w-full min-w-0 mt-6 relative">
        <BarChart />
      </div>
      <div className="flex items-center gap-2 justify-center">
        <div
          className={`w-12 h-12 rounded-xl bg-[#F6F7F9] flex items-center justify-center`}
        >
          <i className="fa-light fa-wave-pulse text-xl text-primary"></i>
        </div>
        <div>
          <p className="text-gray-500 text-sm font-normal">Total Expenses</p>
          <p className="text-base font-semibold">SAR 96,640</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
