"use client";

import { memo, useState } from "react";
import { classNames } from "primereact/utils";
import dayjs from "@/lib/dayjs";
import {
  Input,
  Button,
  Dropdown,
  GroupDropdown,
  AutoScrollChips,
  useAccess,
} from "@/components";
import { useGlobalData } from "@/context/GlobalDataContext";

interface FilterSectionProps {
  onSearch: (
    employeeCodes: number[] | null,
    filter: string | number | null,
    paymentMethodId: number | null
  ) => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  isLoading: boolean;
}

export const FilterSection = memo(
  ({ onSearch, selectedDate, onDateChange, isLoading }: FilterSectionProps) => {
    const { canAccessFilter, isLoading: isLoadingAccess } = useAccess();
    const isAllowedAllFilters = canAccessFilter("salary-slips");

    const [employeeCodes, setEmployeeCodes] = useState<string[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<
      string | number | null
    >("all");
    const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);

    const { data: globalData } = useGlobalData();
    const paymentMethodOptions = (globalData?.paymentMethods || []).map((p) => ({
      label: p.nameEn,
      value: p.id,
    }));

    const handleSearch = () => {
      const codes =
        employeeCodes.length > 0
          ? employeeCodes.map((c) => parseInt(c, 10)).filter((n) => !isNaN(n))
          : null;
      onSearch(codes, selectedFilter, paymentMethodId);
    };

    const monthValue = selectedDate ? dayjs(selectedDate).format("YYYY-MM") : "";

    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
        <div
          className={classNames("grid flex-1 grid-cols-1 gap-3 items-center", {
            "md:grid-cols-2 lg:grid-cols-5": isAllowedAllFilters,
            "lg:grid-cols-3": !isAllowedAllFilters,
          })}
        >
          {!isLoadingAccess && (
            <>
              {/* Month — required */}
              <div className="w-full">
                <Input
                  type="month"
                  value={monthValue}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(dayjs(e.target.value).toDate());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || !selectedDate || isLoading) {
                      return;
                    }
                    handleSearch();
                  }}
                  className="w-full h-10!"
                  placeholder="Select Month *"
                />
              </div>

              {/* Designation / Section */}
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

              {/* Employee codes */}
              <div className="w-full">
                <AutoScrollChips
                  value={employeeCodes}
                  onChange={(e) => setEmployeeCodes(e.value ?? [])}
                  keyfilter="int"
                  allowDuplicate={false}
                  placeholder="Employee Codes"
                  className="w-full h-10!"
                />
              </div>

              {/* Payment Method */}
              {isAllowedAllFilters && (
                <div className="w-full">
                  <Dropdown
                    filter
                    options={paymentMethodOptions}
                    value={paymentMethodId}
                    onChange={(e: any) => setPaymentMethodId(e.value ?? null)}
                    className="w-full h-10.5!"
                    placeholder="Payment Method"
                  />
                </div>
              )}

              {/* Search button — disabled until month is selected */}
              <div className="w-full lg:flex lg:justify-end">
                <Button
                  size="small"
                  label="Search"
                  onClick={handleSearch}
                  className="w-full lg:w-32 h-10!"
                  disabled={!selectedDate || isLoading}
                  loading={isLoading}
                  tooltip={
                    !selectedDate ? "Please select a month first" : undefined
                  }
                  tooltipOptions={{ position: "top" }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

FilterSection.displayName = "FilterSection";
