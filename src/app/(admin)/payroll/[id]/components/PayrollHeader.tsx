"use client";

import { Button } from "@/components";
import GroupDropdown from "@/components/common/group-dropdown";

interface PayrollHeaderProps {
  selectedFilter: string | number | null;
  setSelectedFilter: (value: string | number | null) => void;
  isRefreshingAll: boolean;
  isLoading: boolean;
  isSavingAll: boolean;
  handleRefreshAll: () => void;
  handleSave: () => void;
}

export const PayrollHeader = ({
  selectedFilter,
  setSelectedFilter,
  isRefreshingAll,
  isLoading,
  isSavingAll,
  handleRefreshAll,
  handleSave,
}: PayrollHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
      <div className="flex flex-1 items-center gap-3 w-full">
        <div className="w-full lg:w-auto">
          <GroupDropdown
            hideAllOption
            value={selectedFilter}
            onChange={setSelectedFilter}
            className="w-full lg:w-64 h-10.5!"
          />
        </div>
        <div className="w-full lg:w-auto hidden lg:block">
          <Button
            size="small"
            className="w-full xl:w-32 2xl:w-36 h-10!"
            label="Refresh"
            {...(isRefreshingAll
              ? { loading: true }
              : { icon: "pi pi-refresh" })}
            disabled={isLoading || isSavingAll || isRefreshingAll}
            onClick={handleRefreshAll}
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="block lg:hidden w-full lg:w-auto">
          <Button
            size="small"
            className="w-full lg:w-auto h-10!"
            label="Refresh"
            {...(isRefreshingAll
              ? { loading: true }
              : { icon: "pi pi-refresh" })}
            disabled={isLoading || isSavingAll || isRefreshingAll}
            onClick={handleRefreshAll}
          />
        </div>
        <div className="w-full lg:w-auto">
          <Button
            size="small"
            label="Save"
            onClick={handleSave}
            loading={isSavingAll}
            disabled={isLoading || isSavingAll || isRefreshingAll}
            className="w-full bg-primary-light! text-primary! border-primary-light! lg:w-28 h-10!"
          />
        </div>
      </div>
    </div>
  );
};
