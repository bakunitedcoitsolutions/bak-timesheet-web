"use client";
import { useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import { TableRef, CustomHeaderProps } from "@/components";
import { PayrollEntry } from "@/utils/types";
import {
  useRunPayroll,
  usePostPayroll,
  useRepostPayroll,
  useGetPayrollSummaries,
  useRecalculatePayrollSummary,
} from "@/lib/db/services/payroll-summary";
import { toastService } from "@/lib/toast";
import { getErrorMessage } from "@/utils/helpers";
import { RunPayrollDialog } from "./RunPayrollDialog";
import { showConfirmDialog } from "@/components/common/confirm-dialog";

// Components
import { PayrollTable } from "./components/PayrollTable";
import { PayrollHeader } from "./components/PayrollHeader";
import { PayrollFilters } from "./components/PayrollFilters";

// Helpers
import {
  getYearOptions,
  transformPayrollSummaries,
  getPayrollTableColumns,
} from "./helpers";

const PayrollPage = () => {
  const router = useRouter();
  const yearOptions = useMemo(() => getYearOptions(), []);
  const [selectedYear, setSelectedYear] = useState<string>(
    yearOptions[0].value
  );
  const [isRunPayrollDialogOpen, setIsRunPayrollDialogOpen] = useState(false);
  const tableRef = useRef<TableRef>(null);

  const { data: payrollSummaries, isLoading } = useGetPayrollSummaries({
    year: parseInt(selectedYear),
  });

  const payrollData = useMemo(() => {
    return transformPayrollSummaries(payrollSummaries || []);
  }, [payrollSummaries]);

  const handleView = useCallback(
    (payroll: PayrollEntry) => {
      router.push(`/payroll/${payroll.id}`);
    },
    [router]
  );

  const { mutateAsync: runPayroll } = useRunPayroll();
  const { mutateAsync: repostPayroll } = useRepostPayroll();
  const { mutateAsync: postPayroll } = usePostPayroll();
  const { mutateAsync: recalculatePayrollSummary } =
    useRecalculatePayrollSummary();

  const handleRecalculate = useCallback(
    async (payroll: PayrollEntry) => {
      try {
        await recalculatePayrollSummary({ id: payroll.id });
        toastService.showSuccess(
          "Success",
          "Payroll recalculated successfully"
        );
      } catch (error) {
        toastService.showError(
          "Error",
          getErrorMessage(error, "Failed to recalculate payroll")
        );
      }
    },
    [recalculatePayrollSummary]
  );

  const handlePost = useCallback(
    async (payroll: PayrollEntry) => {
      showConfirmDialog({
        icon: "pi pi-check-circle text-theme-green",
        title: "Post Payroll",
        message: `Are you sure you want to post ${payroll.period}?`,
        onAccept: async () => {
          try {
            await postPayroll({ id: payroll.id });
            toastService.showSuccess("Success", "Payroll posted successfully");
          } catch (error) {
            toastService.showError(
              "Error",
              getErrorMessage(error, "Failed to post payroll")
            );
          }
        },
      });
    },
    [postPayroll]
  );

  const handleRepost = useCallback(
    (payroll: PayrollEntry, isRefresh: boolean) => {
      showConfirmDialog({
        icon: "pi pi-replay text-[#FFA617]",
        title: isRefresh ? "Refresh Payroll" : "Repost Payroll",
        message: `Are you sure you want to ${isRefresh ? "refresh" : "repost"} ${payroll.period}?`,
        onAccept: async () => {
          try {
            await repostPayroll({ id: Number(payroll.id) });
            toastService.showSuccess(
              "Success",
              `Payroll ${isRefresh ? "refreshed" : "reposted"} successfully`
            );
          } catch (error) {
            toastService.showError(
              "Error",
              getErrorMessage(
                error,
                `Failed to ${isRefresh ? "refresh" : "repost"} payroll`
              )
            );
          }
        },
      });
    },
    [repostPayroll]
  );

  const handleRunPayroll = async (
    year: number,
    month: number,
    allowanceId?: number
  ) => {
    try {
      await runPayroll({
        payrollYear: year,
        payrollMonth: month,
        allowanceNotAvailableId: allowanceId,
      });
      toastService.showSuccess("Success", "Payroll ran successfully");
      setIsRunPayrollDialogOpen(false);
    } catch (error: any) {
      toastService.showError(
        "Error",
        getErrorMessage(error, "Failed to run payroll")
      );
    }
  };

  const tableColumns = useMemo(
    () =>
      getPayrollTableColumns(
        handleView,
        handleRecalculate,
        handlePost,
        handleRepost
      ),
    [handleView, handleRecalculate, handlePost, handleRepost]
  );

  const renderFiltersWithProps = useCallback(
    ({ value, onChange }: CustomHeaderProps) => (
      <PayrollFilters
        yearOptions={yearOptions}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        searchValue={value}
        onSearchChange={onChange}
      />
    ),
    [yearOptions, selectedYear]
  );

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <PayrollHeader onRunPayroll={() => setIsRunPayrollDialogOpen(true)} />

      <PayrollTable
        tableRef={tableRef}
        payrollData={payrollData}
        columns={tableColumns}
        renderHeader={renderFiltersWithProps}
        isLoading={isLoading}
      />

      <RunPayrollDialog
        visible={isRunPayrollDialogOpen}
        onHide={() => setIsRunPayrollDialogOpen(false)}
        onRun={handleRunPayroll}
      />
    </div>
  );
};

export default PayrollPage;
