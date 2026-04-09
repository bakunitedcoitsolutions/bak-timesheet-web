"use client";

import { memo, useState } from "react";
import { classNames } from "primereact/utils";
import {
  Button,
  GroupDropdown,
  AutoScrollChips,
  useAccess,
} from "@/components";

interface FilterSectionProps {
  onSearch: (
    employeeCodes: string[] | null,
    filter: string | number | null
  ) => void;
}

export const FilterSection = memo(({ onSearch }: FilterSectionProps) => {
  const { canAccessFilter, isLoading: isLoadingAccess } = useAccess();
  const isAllowedAllFilters = canAccessFilter("employee-cards");

  const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );

  const handleSearch = () => {
    onSearch(employeeCodes.length > 0 ? employeeCodes : null, selectedFilter);
  };

  return (
    <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
      <div
        className={classNames("grid flex-1 grid-cols-1 gap-3 items-center", {
          "md:grid-cols-3 lg:grid-cols-4": isAllowedAllFilters,
          "lg:grid-cols-3": !isAllowedAllFilters,
        })}
      >
        {!isLoadingAccess && (
          <>
            <div className="w-full">
              <AutoScrollChips
                value={employeeCodes}
                onChange={(e) => setEmployeeCodes(e.value ?? [])}
                allowDuplicate={false}
                placeholder="Employee Codes"
                className="w-full h-10!"
              />
            </div>
            {isAllowedAllFilters && (
              <div className="w-full">
                <GroupDropdown
                  value={selectedFilter}
                  className="w-full h-10.5!"
                  onChange={setSelectedFilter}
                  placeholder="Select Section / Designation"
                />
              </div>
            )}
            <div className="w-full col-span-1 lg:col-span-2 md:flex md:justify-end">
              <Button
                size="small"
                label="Search"
                onClick={handleSearch}
                className="w-full md:w-32 h-10!"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
});
