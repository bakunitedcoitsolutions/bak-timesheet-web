"use client";

import { memo, useState, useMemo } from "react";
import { classNames } from "primereact/utils";
import dayjs from "@/lib/dayjs";
import {
  Input,
  Button,
  Dropdown,
  useAccess,
  MultiEmpInput,
} from "@/components";
import { useGlobalData } from "@/context/GlobalDataContext";
import ModifiedMultiSelect from "@/components/forms/multi-select";

interface FilterSectionProps {
  onSearch: (params: any) => void;
  isLoading: boolean;
}

export const FilterSection = memo(
  ({ onSearch, isLoading }: FilterSectionProps) => {
    const { canAccessFilter, isLoading: isLoadingAccess } = useAccess();
    const isAllowedAllFilters = canAccessFilter("payroll");

    const { data: globalData } = useGlobalData();

    // local filter controls
    const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate());
    const [selectedSections, setSelectedSections] = useState<number[]>([]);
    const [employeeCodeChips, setEmployeeCodeChips] = useState<string[]>([]);
    const [paymentMethodId, setPaymentMethodId] = useState<number | null>(0);

    // options
    const paymentMethodOptions = useMemo(
      () => [
        { label: "All Methods", value: 0 },
        ...(globalData?.paymentMethods || []).map((p) => ({
          label: p.nameEn,
          value: p.id,
        })),
      ],
      [globalData?.paymentMethods]
    );

    const sectionOptions = useMemo(
      () =>
        (globalData?.payrollSections || []).map((s) => ({
          label: s.nameEn,
          value: s.id,
        })),
      [globalData?.payrollSections]
    );

    const handleRefresh = (paramDate?: Date) => {
      const dateToUse = paramDate ?? selectedDate;
      onSearch({
        month: dayjs(dateToUse).month() + 1,
        year: dayjs(dateToUse).year(),
        payrollSectionIds:
          selectedSections.length > 0 ? selectedSections : null,
        employeeCodes:
          employeeCodeChips.length > 0
            ? employeeCodeChips.map(Number).filter(Boolean)
            : null,
        paymentMethodId:
          paymentMethodId === 0 ? null : (paymentMethodId ?? null),
      });
    };

    return (
      <div
        className={classNames(
          "bg-[#F5E6E8] px-6 py-5 grid grid-cols-1 gap-3 items-center print:hidden",
          {
            "md:grid-cols-3": !isAllowedAllFilters,
            "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5": isAllowedAllFilters,
          }
        )}
      >
        {!isLoadingAccess && (
          <>
            <Input
              type="month"
              className="w-full h-10!"
              placeholder="Select Month"
              disabled={isLoading}
              value={dayjs(selectedDate).format("YYYY-MM")}
              onChange={(e) => {
                if (!e.target.value) return;
                const date = dayjs(e.target.value).toDate();
                setSelectedDate(date);
              }}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  if (!e?.target?.value) return;
                  const date = dayjs(e.target.value).toDate();
                  handleRefresh(date);
                }
              }}
            />
            <MultiEmpInput
              value={employeeCodeChips}
              className="w-full h-10!"
              placeholder="Employee Codes"
              onChange={(codes) => setEmployeeCodeChips(codes)}
            />
            {isAllowedAllFilters && (
              <>
                <ModifiedMultiSelect
                  options={sectionOptions}
                  selectedItem={selectedSections}
                  setSelectedItem={setSelectedSections}
                  placeholder="Select Payroll Sections"
                  className="w-full h-10.5!"
                  filter
                  small
                  showClear
                />
                <Dropdown
                  filter
                  options={paymentMethodOptions}
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.value ?? null)}
                  className="w-full h-10!"
                  placeholder="Payment Method"
                />
              </>
            )}

            <div className="w-full flex justify-end">
              <Button
                size="small"
                label="Refresh"
                loading={isLoading}
                className="w-full xl:w-36 h-10!"
                onClick={() => handleRefresh()}
                icon={isLoading ? undefined : "pi pi-refresh"}
              />
            </div>
          </>
        )}
      </div>
    );
  }
);

FilterSection.displayName = "FilterSection";
