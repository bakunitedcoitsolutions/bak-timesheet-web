"use client";

import { useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button, Dropdown } from "@/components";
import { ListedAllowanceNotAvailable } from "@/lib/db/services/allowance-not-available/allowance-not-available.dto";
import { useListAllowanceNotAvailable } from "@/lib/db/services/allowance-not-available/requests";

interface RunPayrollDialogProps {
  visible: boolean;
  onHide: () => void;
  onRun: (
    year: number,
    month: number,
    allowanceId?: number
  ) => Promise<void> | void;
}

export const RunPayrollDialog = ({
  visible,
  onHide,
  onRun,
}: RunPayrollDialogProps) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [allowanceId, setAllowanceId] = useState<number | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);

  const { data: allowanceData, isLoading } = useListAllowanceNotAvailable({});

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const val = currentYear - 3 + i;
    return { label: val.toString(), value: val };
  });

  const monthOptions = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  const allowanceOptions = useMemo(() => {
    if (!allowanceData?.allowanceNotAvailables) return [];
    return allowanceData.allowanceNotAvailables.map(
      (item: ListedAllowanceNotAvailable) => ({
        label: `${item.nameEn} (${item.type})`,
        value: item.id,
      })
    );
  }, [allowanceData]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      await onRun(year, month, allowanceId);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog
      header="Run Payroll"
      visible={visible}
      style={{ width: "400px" }}
      onHide={onHide}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            onClick={onHide}
            size="small"
            className="p-button-text w-48"
          />
          <Button
            label={isRunning ? "Running..." : "Run"}
            {...(!isRunning && { icon: "pi pi-check" })}
            onClick={handleRun}
            loading={isRunning}
            disabled={isRunning}
            autoFocus
            size="small"
            className="w-28!"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Year</label>
          <Dropdown
            filter
            value={year}
            className="w-full"
            options={yearOptions}
            placeholder="Select Year"
            onChange={(e) => setYear(e.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">Month</label>
          <Dropdown
            filter
            value={month}
            className="w-full"
            options={monthOptions}
            placeholder="Select Month"
            onChange={(e) => setMonth(e.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-medium text-sm">
            Allowance Not Allowed (Optional)
          </label>
          <Dropdown
            value={allowanceId}
            options={allowanceOptions}
            onChange={(e) => setAllowanceId(e.value)}
            placeholder="Select Exclusion Rule"
            showClear
            loading={isLoading}
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};
