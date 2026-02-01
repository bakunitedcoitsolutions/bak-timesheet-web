"use client";
import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
import { ProgressSpinner } from "primereact/progressspinner";
import { Menu } from "primereact/menu";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";

import {
  Input,
  Table,
  Button,
  TableRef,
  TableColumn,
  ExportOptions,
  CustomHeaderProps,
  Dropdown,
  TypeBadge,
} from "@/components";
import { PayrollEntry } from "@/utils/dummy";
import {
  useGetPayrollSummaries,
  PayrollSummaryWithRelations,
  useUpdateMonthlyPayrollValues,
  useRunPayroll,
  useRepostPayroll,
} from "@/lib/db/services/payroll-summary";
import { toastService } from "@/lib/toast";
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
  onRecalculate,
  onPost,
  onRepost,
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
                  "w-full flex h-12 p-2 pl-4 cursor-pointer border-b border-gray-200"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-theme-green!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
          {
            label: "Repost",
            icon: "pi pi-replay",
            command: () => onRepost(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-2xl"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#FFA617]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
        ]
      : [];

  return (
    <div className="flex relative items-center justify-center gap-2">
      <Button
        label="View"
        size="small"
        onClick={() => onView(payroll)}
        className="w-14 border-none! shadow-none! h-8 justify-center items-center bg-primary-light! text-primary!"
      />
      {payroll.status === "Pending" && (
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
      )}
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
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm font-semibold">{rowData.period}</span>
    ),
  },
  {
    field: "salary",
    header: "Salary",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.salary.toLocaleString()}</span>
    ),
  },
  {
    field: "previousAdvance",
    header: "Prev. Advance",
    ...commonColumnProps,
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
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.currentAdvance.toLocaleString()}</span>
    ),
  },
  {
    field: "deduction",
    header: "Deduction",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.deduction.toLocaleString()}</span>
    ),
  },
  {
    field: "netLoan",
    header: "Net Loan",
    ...commonColumnProps,
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
    field: "netSalaryPayable",
    header: "Net Salary",
    ...commonColumnProps,
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
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cardSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "cashSalary",
    header: "Cash Sal.",
    ...commonColumnProps,
    style: { minWidth: "170px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.cashSalary.toLocaleString()}</span>
    ),
  },
  {
    field: "status",
    header: "Status",
    sortable: true,
    filterable: false,
    align: "center",
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
        gosiSalary: 0, // Not available in summary yet
        salary: summary.totalSalary,
        previousAdvance: summary.totalPreviousAdvance,
        currentAdvance: summary.totalCurrentAdvance,
        deduction: summary.totalDeduction,
        netLoan: summary.totalNetLoan,
        netSalaryPayable: summary.totalNetSalaryPayable,
        cardSalary: summary.totalCardSalary,
        cashSalary: summary.totalCashSalary,
        status: (summary.payrollStatus?.nameEn || "Pending") as any, // Cast to match likely enum or string
      };
    });
  }, [payrollSummaries]);

  const handleView = (payroll: PayrollEntry) => {
    console.log("View payroll:", payroll);
    // TODO: Navigate to view page or open view modal
  };

  /* New Hook */
  const { mutateAsync: updatePayrollValues } = useUpdateMonthlyPayrollValues();
  const { mutateAsync: runPayroll } = useRunPayroll();
  const { mutateAsync: repostPayroll } = useRepostPayroll();

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
      const { payrollMonth, payrollYear } = parsePeriod(payroll.period);
      await updatePayrollValues({
        payrollMonth,
        payrollYear,
        isPosted: false,
      });
      toastService.showSuccess("Success", "Payroll recalculated successfully");
    } catch (error) {
      console.error(error);
      toastService.showError("Error", "Failed to recalculate payroll");
    }
  };

  const handlePost = async (payroll: PayrollEntry) => {
    showConfirmDialog({
      icon: "pi pi-check-circle text-theme-green",
      title: "Post Payroll",
      message: `Are you sure you want to post ${payroll.period}?`,
      onAccept: async () => {
        try {
          const { payrollMonth, payrollYear } = parsePeriod(payroll.period);
          await updatePayrollValues({
            payrollMonth,
            payrollYear,
            isPosted: true,
          });
          toastService.showSuccess("Success", "Payroll posted successfully");
        } catch (error) {
          console.error(error);
          toastService.showError("Error", "Failed to post payroll");
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
          console.error(error);
          toastService.showError("Error", "Failed to repost payroll");
        }
      },
    });
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
            onClick={() => {
              // Temporary: Use prompt or simple selection.
              // Since I need to select Month/Year, simplest is a prompt for now or reusing selectedYear
              // and asking for month.
              const currentYear = new Date().getFullYear();
              const input = prompt(
                "Enter Month (1-12) to run for " + currentYear,
                (new Date().getMonth() + 1).toString()
              );
              if (input) {
                const month = parseInt(input);
                if (month >= 1 && month <= 12) {
                  runPayroll({ payrollYear: currentYear, payrollMonth: month })
                    .then(() =>
                      toastService.showSuccess(
                        "Success",
                        "Payroll run successfully"
                      )
                    )
                    .catch((e) => toastService.showError("Error", e.message));
                }
              }
            }}
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
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={10}
          scrollable
          scrollHeight="65vh"
          loading={isLoading}
          loadingIcon={
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          }
        />
      </div>
    </div>
  );
};

export default PayrollPage;
