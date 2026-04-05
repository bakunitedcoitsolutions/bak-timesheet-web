"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "primereact/checkbox";
import { InputNumberChangeEvent } from "primereact/inputnumber";
import {
  Button,
  Dropdown,
  MultiSelect,
  NumberInput,
  GroupDropdown,
} from "@/components";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { useGetEmployeeStatuses } from "@/lib/db/services/employee-status/requests";
import { ListedEmployeeStatus } from "@/lib/db/services/employee-status";

interface FilterSectionProps {
  onSearch: (
    search: string,
    filter: string | number | null,
    statusId: number
  ) => void;
  selectedColumns: string[];
  columnOptions: { label: string; value: string }[];
  onColumnChange: (value: string[]) => void;
  zeroRate: boolean;
  onZeroRateChange: (value: boolean) => void;
}

export const FilterSection = ({
  onSearch,
  selectedColumns,
  columnOptions,
  onColumnChange,
  zeroRate,
  onZeroRateChange,
}: FilterSectionProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [statusId, setStatusId] = useState<number>(1); // Default to Active (1)

  const { data: statusesResponse } = useGetEmployeeStatuses({
    ...COMMON_QUERY_INPUT,
    sortBy: "nameEn",
  });
  const statuses: ListedEmployeeStatus[] =
    statusesResponse?.employeeStatuses ?? [];

  const statusOptions = useMemo(() => {
    return [
      { label: "All Statuses", value: 0 },
      ...statuses.map((s) => ({ label: s.nameEn, value: s.id })),
    ];
  }, [statuses]);

  const handleSearch = () => {
    onSearch(searchValue, selectedFilter, statusId);
  };

  return (
    <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
        <div className="w-full">
          <NumberInput
            small
            useGrouping={false}
            placeholder="Employee Codes"
            value={!!searchValue ? parseInt(searchValue) : undefined}
            onChange={(e: InputNumberChangeEvent) =>
              setSearchValue(e.value?.toString() || "")
            }
            className="w-full h-10!"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="w-full lg:col-span-2">
          <GroupDropdown
            placeholder="Select Section / Designation"
            className="w-full h-10.5!"
            value={selectedFilter}
            onChange={setSelectedFilter}
          />
        </div>
        <div className="w-full lg:col-span-1">
          <Dropdown
            small
            filter
            value={statusId}
            options={statusOptions}
            className="w-full h-10!"
            placeholder="Select Status"
            onChange={(e) => setStatusId(e.value)}
          />
        </div>
        <div className="w-full lg:col-span-2">
          <MultiSelect
            small
            filter
            options={columnOptions}
            className="w-full h-10!"
            placeholder="Select Columns"
            selectedItem={selectedColumns}
            setSelectedItem={onColumnChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-5 justify-between xl:justify-end">
        <div className="w-fit whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="zeroRate"
              checked={zeroRate}
              onChange={(e) => onZeroRateChange(e.checked ?? false)}
            />
            <label htmlFor="zeroRate" className="text-sm cursor-pointer">
              Zero Rate
            </label>
          </div>
        </div>
        <Button
          size="small"
          className="w-32 h-10!"
          label="Search"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
};
