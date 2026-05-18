"use client";

import { useEffect, useMemo } from "react";
import { Dropdown, Input, useAccess } from "@/components";
import { useGlobalData } from "@/context/GlobalDataContext";

interface ExpensesFilterProps {
  selectedBranch: any;
  setSelectedBranch: (branch: any) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const ExpensesFilter = ({
  selectedBranch,
  setSelectedBranch,
  selectedMonth,
  setSelectedMonth,
}: ExpensesFilterProps) => {
  const { isBranchScoped, branchId: userBranchId } = useAccess();
  const { data: globalData } = useGlobalData();

  useEffect(() => {
    if (isBranchScoped && userBranchId) {
      setSelectedBranch(userBranchId);
    }
  }, [isBranchScoped, userBranchId, setSelectedBranch]);

  const branchesOptions = useMemo(() => {
    const defaultOption = { label: "All Branches", value: "all" };
    const apiBranches =
      globalData?.branches?.map((b) => ({ label: b.nameEn, value: b.id })) ||
      [];
    return [defaultOption, ...apiBranches];
  }, [globalData?.branches]);

  return (
    <div className="flex flex-1 lg:flex-none w-full lg:w-auto items-center gap-3">
      <div className="flex flex-1 lg:flex-none">
        <Dropdown
          small
          filter
          className="w-full"
          options={branchesOptions}
          placeholder="All Branches"
          value={isBranchScoped ? userBranchId : selectedBranch}
          onChange={(e) => setSelectedBranch(e.value)}
          disabled={isBranchScoped}
        />
      </div>
      <div className="flex flex-1 lg:flex-none">
        <Input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
};
