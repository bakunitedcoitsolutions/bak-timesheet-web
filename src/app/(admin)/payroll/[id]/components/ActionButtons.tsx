"use client";

import { useState } from "react";

import { Button } from "@/components";
import { toastService } from "@/lib/toast";
import { useSavePayrollRow } from "@/hooks";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { useRefreshPayrollDetailRow } from "@/lib/db/services/payroll-summary";

interface ActionButtonsProps {
  rowData: PayrollDetailEntry;
  onRefreshComplete: (updated: PayrollDetailEntry) => void;
  isSavingAll: boolean;
}

export const ActionButtons = ({
  rowData,
  onRefreshComplete,
  isSavingAll,
}: ActionButtonsProps) => {
  const { saveRow, isSaving } = useSavePayrollRow();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { mutateAsync: refreshDetailRow } = useRefreshPayrollDetailRow();

  const isLocked = rowData.isLocked || rowData.payrollSummaryStatusId === 3;

  if (isLocked) return null;

  const handleRefreshRow = async () => {
    try {
      setIsRefreshing(true);
      const result = await refreshDetailRow({ payrollDetailId: rowData.id });
      if (result?.updatedEntry) {
        onRefreshComplete(result.updatedEntry);
      }
      toastService.showSuccess(
        "Refreshed",
        `Row refreshed successfully for ${rowData.empCode} - ${rowData.name}`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to refresh payroll details"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <Button
        rounded
        size="small"
        variant="text"
        {...(isSaving ? { loading: true } : { icon: "pi pi-save text-lg!" })}
        tooltipOptions={{ position: "top" }}
        onClick={() => saveRow(rowData)}
        disabled={isSaving || isRefreshing || isSavingAll}
        className="w-8 h-8!"
        tooltip="Save Row"
      />
      <Button
        rounded
        size="small"
        variant="text"
        tooltipOptions={{ position: "top" }}
        {...(isRefreshing
          ? { loading: true }
          : { icon: "pi pi-refresh text-lg!" })}
        onClick={handleRefreshRow}
        disabled={isSaving || isRefreshing || isSavingAll}
        className="w-8 h-8!"
        tooltip="Refresh"
      />
    </div>
  );
};
