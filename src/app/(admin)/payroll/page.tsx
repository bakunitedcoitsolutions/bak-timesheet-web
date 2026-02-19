"use client";
import { useState, useRef, useMemo } from "react";
import { Menu } from "primereact/menu";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";

import {
  Input,
  Table,
  Button,
  TableRef,
  Dropdown,
  TypeBadge,
  TableColumn,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { PayrollEntry } from "@/utils/types";
import {
  useRunPayroll,
  usePostPayroll,
  useRepostPayroll,
  useGetPayrollSummaries,
  PayrollSummaryWithRelations,
  useRecalculatePayrollSummary,
  useUpdateMonthlyPayrollValues,
} from "@/lib/db/services/payroll-summary";
import { toastService } from "@/lib/toast";
import { getErrorMessage } from "@/utils/helpers";
import { RunPayrollDialog } from "./RunPayrollDialog";
import { showConfirmDialog } from "@/components/common/confirm-dialog";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
};

interface PayrollActionsProps {
  payroll: PayrollEntry;
  onView: (payroll: PayrollEntry) => void;
  onRecalculate: (payroll: PayrollEntry) => void;
  onPost: (payroll: PayrollEntry) => void;
  onRepost: (payroll: PayrollEntry) => void;
}

const PayrollActions = ({
  payroll,
  onView,
  onPost,
  onRepost,
  onRecalculate,
}: PayrollActionsProps) => {
  const menuRef = useRef<Menu | null>(null);

  const menuItems: MenuItem[] =
    payroll.status === "Pending"
      ? [
          {
            label: "Recalculate",
            icon: "pi pi-calculator text-xl!",
            command: () => onRecalculate(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-2xl border-b border-gray-200"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#1A8CDE]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
          {
            label: "Post",
            icon: "pi pi-check-circle",
            command: () => onPost(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-2xl"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-theme-green!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
        ]
      : [
          {
            label: "Repost",
            icon: "pi pi-replay",
            command: () => onRepost(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-2xl rounded-b-2xl"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#FFA617]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
        ];

  return (
    <div className="flex relative items-center justify-center gap-2">
      <Button
        label="View"
        size="small"
        onClick={() => onView(payroll)}
        className="w-14 border-none! shadow-none! h-8 justify-center items-center bg-primary-light! text-primary!"
      />
      <>
        <div
          className="absolute w-7 h-7 cursor-pointer -right-[5px] top-[60%] -translate-y-[50%] z-1 justify-center items-center"
          onClick={(e) => menuRef.current?.toggle(e)}
        >
          <i className="pi pi-ellipsis-v text-primary"></i>
        </div>
        <Menu
          popup
          ref={menuRef}
          model={menuItems}
          popupAlignment="right"
          className="mt-2 shadow-lg rounded-lg p-1 min-w-[150px]"
        />
      </>
    </div>
  );
};

const columns = (
  handleView: (payroll: PayrollEntry) => void,
  handleRecalculate: (payroll: PayrollEntry) => void,
  handlePost: (payroll: PayrollEntry) => void,
  handleRepost: (payroll: PayrollEntry) => void
): TableColumn<PayrollEntry>[] => [
  {
    field: "period",
    header: "Period",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm font-semibold">{rowData.period}</span>
    ),
  },
  {
    field: "salary",
    header: "Salary",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.salary.toLocaleString()}</span>
    ),
  },
  {
    field: "breakfastAllowance",
    header: "Brkfst. Allow.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.breakfastAllowance.toLocaleString()}
      </span>
    ),
  },
  {
    field: "otherAllowances",
    header: "Other Allow.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.otherAllowances.toLocaleString()}
      </span>
    ),
  },
  {
    field: "previousAdvance",
    header: "Prev. Advance",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.previousAdvance.toLocaleString()}
      </span>
    ),
  },
  {
    field: "currentAdvance",
    header: "Curr. Advance",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.currentAdvance.toLocaleString()}</span>
    ),
  },
  {
    field: "deduction",
    header: "Loan Deduction",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.deduction.toLocaleString()}</span>
    ),
  },
  {
    field: "netLoan",
    header: "Net Loan",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span
        className={classNames("text-sm", {
          "text-red-600": rowData.netLoan < 0,
        })}
      >
        {rowData.netLoan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "previousChallan",
    header: "Prev. Challan",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.previousChallan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "currentChallan",
    header: "Curr. Challan",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "160px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.currentChallan.toLocaleString()}</span>
    ),
  },
  {
    field: "challanDeduction",
    header: "Challan Ded.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "155px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">
        {rowData.challanDeduction.toLocaleString()}
      </span>
    ),
  },
  {
    field: "netChallan",
    header: "Net Challan",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span
        className={classNames("text-sm", {
          "text-red-600": rowData.netChallan < 0,
        })}
      >
        {rowData.netChallan.toLocaleString()}
      </span>
    ),
  },
  {
    field: "netSalaryPayable",
    header: "Net Salary",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm font-semibold">
        {rowData.netSalaryPayable.toLocaleString()}
      </span>
    ),
  },
  {
    field: "cardSalary",
    header: "Card Sal.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cardSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "cashSalary",
    header: "Cash Sal.",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cashSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "180px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm text-gray-500">{rowData.remarks || "-"}</span>
    ),
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    filterable: false,
    align: "center",
    alignHeader: "center",
    style: { minWidth: "120px" },
    body: (rowData: PayrollEntry) => (
      <TypeBadge
        text={rowData.status}
        variant={rowData.status === "Pending" ? "warning" : "success"}
      />
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <PayrollActions
        payroll={rowData}
        onView={handleView}
        onRecalculate={handleRecalculate}
        onPost={handlePost}
        onRepost={handleRepost}
      />
    ),
  },
];

const PayrollPage = () => {
  const router = useRouter();
  const yearOptions = Array.from({ length: 20 }, (_, index) => ({
    label: `${new Date().getFullYear() - index}`,
    value: `${new Date().getFullYear() - index}`,
  }));
  const [selectedYear, setSelectedYear] = useState<string>(
    yearOptions[0].value
  );

  const [isRunPayrollDialogOpen, setIsRunPayrollDialogOpen] = useState(false);
  const tableRef = useRef<TableRef>(null);

  const { data: payrollSummaries, isLoading } = useGetPayrollSummaries({
    year: parseInt(selectedYear),
  });

  const payrollData: PayrollEntry[] = useMemo(() => {
    if (!payrollSummaries) return [];
    return payrollSummaries.map((summary: PayrollSummaryWithRelations) => {
      const monthNames = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const period = `${monthNames[summary.payrollMonth - 1]} ${summary.payrollYear}`;

      return {
        id: summary.id,
        period,
        salary: summary.totalSalary,
        breakfastAllowance: summary.totalBreakfastAllowance,
        otherAllowances: summary.totalOtherAllowances,
        previousAdvance: summary.totalPreviousAdvance,
        currentAdvance: summary.totalCurrentAdvance,
        deduction: summary.totalDeduction,
        netLoan: summary.totalNetLoan,
        previousChallan: summary.totalPreviousChallan,
        currentChallan: summary.totalCurrentChallan,
        challanDeduction: summary.totalChallanDeduction,
        netChallan: summary.totalNetChallan,
        netSalaryPayable: summary.totalNetSalaryPayable,
        cardSalary: summary.totalCardSalary,
        cashSalary: summary.totalCashSalary,
        remarks: null,
        status: (summary.payrollStatus?.nameEn || "Pending") as
          | "Posted"
          | "Pending",
      };
    });
  }, [payrollSummaries]);

  const handleView = (payroll: PayrollEntry) => {
    router.push(`/payroll/${payroll.id}`);
  };

  /* New Hook */
  const { mutateAsync: updatePayrollValues } = useUpdateMonthlyPayrollValues();
  const { mutateAsync: runPayroll } = useRunPayroll();
  const { mutateAsync: repostPayroll } = useRepostPayroll();
  const { mutateAsync: postPayroll } = usePostPayroll();
  const { mutateAsync: recalculatePayrollSummary } =
    useRecalculatePayrollSummary();

  const parsePeriod = (period: string) => {
    const [monthStr, yearStr] = period.split(" ");
    const monthIndex = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ].indexOf(monthStr.toUpperCase());
    return {
      payrollMonth: monthIndex + 1,
      payrollYear: parseInt(yearStr),
    };
  };

  const handleRecalculate = async (payroll: PayrollEntry) => {
    try {
      await recalculatePayrollSummary({ id: payroll.id });
      toastService.showSuccess("Success", "Payroll recalculated successfully");
    } catch (error) {
      toastService.showError(
        "Error",
        getErrorMessage(error, "Failed to recalculate payroll")
      );
    }
  };

  const handlePost = async (payroll: PayrollEntry) => {
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
  };

  /* Removed Repost Logic for now as it wasn't requested in C# or explicit plan, but kept function shell if needed? 
     The prompt asked to "Recalculate" and "Post".
     "Repost" logic was just in the dummy UI. I'll leave it as TODO or empty. */
  const handleRepost = (payroll: PayrollEntry) => {
    showConfirmDialog({
      icon: "pi pi-replay text-[#FFA617]",
      title: "Repost Payroll",
      message: `Are you sure you want to repost ${payroll.period}?`,
      onAccept: async () => {
        try {
          await repostPayroll({ id: Number(payroll.id) });
          toastService.showSuccess("Success", "Payroll reposted successfully");
        } catch (error) {
          toastService.showError(
            "Error",
            getErrorMessage(error, "Failed to repost payroll")
          );
        }
      },
    });
  };

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
      toastService.showSuccess("Success", "Payroll run successfully");
      setIsRunPayrollDialogOpen(false);
    } catch (error: any) {
      toastService.showError(
        "Error",
        getErrorMessage(error, "Failed to run payroll")
      );
    }
  };

  const exportCSV = () => {
    tableRef.current?.exportCSV();
  };

  const exportExcel = () => {
    tableRef.current?.exportExcel();
  };

  const renderHeader = ({ value, onChange }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="w-full md:w-auto">
          <Dropdown
            small
            filter
            options={yearOptions}
            placeholder="Select Year"
            className="w-full md:w-44"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
          </div>
          <div className="w-full md:w-auto">
            <Input
              small
              value={value}
              className="w-full"
              icon="pi pi-search"
              iconPosition="left"
              onChange={onChange}
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Payroll Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, manage payroll records, and payroll details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            label="Run Payroll"
            onClick={() => setIsRunPayrollDialogOpen(true)}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          ref={tableRef}
          dataKey="id"
          data={payrollData}
          columns={columns(
            handleView,
            handleRecalculate,
            handlePost,
            handleRepost
          )}
          customHeader={renderHeader}
          pagination={false}
          rows={10}
          scrollable
          scrollHeight="72vh"
          loading={isLoading}
          loadingIcon={
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          }
        />
      </div>
      <RunPayrollDialog
        visible={isRunPayrollDialogOpen}
        onHide={() => setIsRunPayrollDialogOpen(false)}
        onRun={handleRunPayroll}
      />
    </div>
  );
};

export default PayrollPage;
