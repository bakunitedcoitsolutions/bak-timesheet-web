"use client";

import dayjs from "@/lib/dayjs";
import { memo, useState, useMemo } from "react";
import { classNames } from "primereact/utils";
import { Checkbox } from "primereact/checkbox";
import {
  Input,
  Button,
  Dropdown,
  useAccess,
  GroupDropdown,
  AutoScrollChips,
} from "@/components";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";

interface FilterSectionProps {
  onSearch: (params: any) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isLoading: boolean;
}

export const FilterSection = memo(
  ({ onSearch, selectedDate, onDateChange, isLoading }: FilterSectionProps) => {
    const { canAccessFilter, isLoading: isLoadingAccess } = useAccess();
    const isAllowedAllFilters = canAccessFilter("daily-timesheet");

    const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");
    const [projectId, setProjectId] = useState<number | null>(null);
    const [showAbsents, setShowAbsents] = useState<boolean>(false);
    const [showFixedSalary, setShowFixedSalary] = useState<boolean>(false);

    // Fetch global data
    const { data: globalData } = useGlobalData();
    const projects = globalData.projects || [];

    const projectOptions = useMemo(() => {
      const options = projects.map((p: GlobalDataGeneral) => ({
        label: p.nameEn,
        value: p.id,
      }));
      return [{ label: "All Projects", value: 0 }, ...options];
    }, [projects]);

    const handleRefresh = () => {
      onSearch({
        employeeCodes: employeeCodes.length > 0 ? employeeCodes : null,
        selectedFilter,
        projectId: projectId === 0 ? null : projectId,
        showAbsents,
        showFixedSalary,
      });
    };

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div
          className={classNames("grid flex-1 grid-cols-1 gap-3 items-center", {
            "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6": isAllowedAllFilters,
            "md:grid-cols-3": !isAllowedAllFilters,
          })}
        >
          {!isLoadingAccess && (
            <>
              <div className="w-full">
                <Input
                  type="date"
                  value={dayjs(selectedDate).format("YYYY-MM-DD")}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(new Date(e.target.value));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || isLoading) {
                      return;
                    }
                    handleRefresh();
                  }}
                  className="w-full h-10!"
                  placeholder="Select Date"
                />
              </div>
              {isAllowedAllFilters && (
                <>
                  <div className="w-full">
                    <AutoScrollChips
                      keyfilter="int"
                      value={employeeCodes}
                      allowDuplicate={false}
                      placeholder="Employee Codes"
                      className="w-full h-10!"
                      onChange={(e) => {
                        const codes = e.value ?? [];
                        setEmployeeCodes(codes);
                        // If employee code is present, clear other filters
                        if (codes.length > 0) {
                          setSelectedFilter("all");
                          setProjectId(null);
                          setShowAbsents(false);
                          setShowFixedSalary(false);
                        }
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <GroupDropdown
                      value={selectedFilter}
                      className="w-full h-10.5!"
                      onChange={setSelectedFilter}
                      placeholder="Select Section / Designation"
                      disabled={employeeCodes.length > 0}
                    />
                  </div>
                </>
              )}
              <div className="w-full">
                <Dropdown
                  filter
                  options={projectOptions}
                  value={projectId}
                  onChange={(e) => setProjectId(e.value)}
                  className="w-full h-10!"
                  placeholder="Select Project"
                  disabled={employeeCodes.length > 0}
                />
              </div>
              {isAllowedAllFilters && (
                <div className="w-full">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2 ${employeeCodes.length > 0 ? "opacity-50" : ""}`}
                    >
                      <Checkbox
                        inputId="absents"
                        checked={showAbsents}
                        disabled={employeeCodes.length > 0}
                        onChange={(e) => {
                          const checked = e.checked ?? false;
                          setShowAbsents(checked);
                          if (checked) setShowFixedSalary(false);
                        }}
                      />
                      <label
                        htmlFor="absents"
                        className="text-sm cursor-pointer select-none whitespace-nowrap"
                      >
                        Absents
                      </label>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${employeeCodes.length > 0 ? "opacity-50" : ""}`}
                    >
                      <Checkbox
                        inputId="fixedSalary"
                        checked={showFixedSalary}
                        disabled={employeeCodes.length > 0}
                        onChange={(e) => {
                          const checked = e.checked ?? false;
                          setShowFixedSalary(checked);
                          if (checked) setShowAbsents(false);
                        }}
                      />
                      <label
                        htmlFor="fixedSalary"
                        className="text-sm cursor-pointer select-none whitespace-nowrap"
                      >
                        Fixed Salary
                      </label>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-full flex justify-end">
                <Button
                  size="small"
                  label="Refresh"
                  onClick={handleRefresh}
                  loading={isLoading}
                  disabled={isLoading}
                  className="w-full md:w-32 h-10!"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
