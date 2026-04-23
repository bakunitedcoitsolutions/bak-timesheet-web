"use client";
import { InputNumberChangeEvent } from "primereact/inputnumber";

import { Button, NumberInput } from "@/components";

interface LedgerSearchProps {
  employeeCode: string;
  setEmployeeCode: (code: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const LedgerSearch = ({
  employeeCode,
  setEmployeeCode,
  onSearch,
  isLoading,
}: LedgerSearchProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between bg-[#F5E6E8] items-center gap-3 flex-1 w-full">
      <div className="flex flex-1 flex-col lg:flex-row items-center gap-3 w-full">
        <div className="w-full lg:w-auto">
          <NumberInput
            useGrouping={false}
            disabled={isLoading}
            placeholder="Employee Code"
            className="w-full lg:w-60 h-10.5!"
            onChange={(e: InputNumberChangeEvent) =>
              setEmployeeCode(e.value?.toString() || "")
            }
            value={employeeCode ? parseInt(employeeCode) : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) {
                e?.preventDefault?.();
                onSearch();
              }
            }}
          />
        </div>
        <div className="w-full lg:w-28">
          <Button
            size="small"
            className="w-full xl:w-28 2xl:w-32 h-10!"
            label="Search"
            onClick={onSearch}
            loading={isLoading}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
