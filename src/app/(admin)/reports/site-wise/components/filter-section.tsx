"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Checkbox,
  MultiSelect,
  AutoScrollChips,
} from "@/components";

interface FilterSectionProps {
  onRefresh: (filters: {
    month: number;
    year: number;
    employeeCodes: number[] | null;
    projectIds: number[] | null;
    summarize: boolean;
  }) => void;
  isLoading: boolean;
  projectOptions: { label: string; value: number }[];
  initialMonthYear: { month: number; year: number };
  initialEmployeeCodes: string[];
  initialSelectedProjects: number[];
  initialSummarize: boolean;
}

export const FilterSection = ({
  onRefresh,
  isLoading,
  projectOptions,
  initialMonthYear,
  initialEmployeeCodes,
  initialSelectedProjects,
  initialSummarize,
}: FilterSectionProps) => {
  const [monthYear, setMonthYear] = useState(initialMonthYear);
  const [employeeCodeChips, setEmployeeCodeChips] =
    useState<string[]>(initialEmployeeCodes);
  const [selectedProjects, setSelectedProjects] = useState<number[]>(
    initialSelectedProjects
  );
  const [summarize, setSummarize] = useState(initialSummarize);

  const handleRefresh = () => {
    onRefresh({
      month: monthYear.month,
      year: monthYear.year,
      employeeCodes:
        employeeCodeChips.length > 0
          ? employeeCodeChips.map(Number).filter(Boolean)
          : null,
      projectIds: selectedProjects.length > 0 ? selectedProjects : null,
      summarize: summarize,
    });
  };

  return (
    <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        <div className="w-full">
          <Input
            type="month"
            className="w-full h-10!"
            value={`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}`}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split("-").map(Number);
              setMonthYear({ month: m, year: y });
            }}
            onKeyDown={(e) => e?.key === "Enter" && handleRefresh()}
          />
        </div>
        <div className="w-full">
          <AutoScrollChips
            value={employeeCodeChips}
            onChange={(e) => setEmployeeCodeChips(e.value || [])}
            placeholder="Emp. Code"
            className="w-full h-10!"
            keyfilter="int"
          />
        </div>
        <div className="w-full">
          <MultiSelect
            small
            filter
            options={projectOptions}
            className="w-full h-10!"
            placeholder="All Projects"
            selectedItem={selectedProjects}
            setSelectedItem={setSelectedProjects}
          />
        </div>
        <div className="flex items-center gap-5 justify-between xl:justify-end">
          <div className="w-fit whitespace-nowrap">
            <div className="flex items-center gap-2">
              <Checkbox
                name="summarize"
                checked={summarize}
                onChange={(checked: boolean) => setSummarize(!!checked)}
              />
              <label htmlFor="summarize" className="text-sm cursor-pointer">
                Summarize
              </label>
            </div>
          </div>
          <Button
            size="small"
            className="w-32 h-10!"
            label="Search"
            onClick={handleRefresh}
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
