"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";
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
} from "@/components";
import { initialPayrollData, PayrollEntry } from "@/utils/dummy";

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
            className="absolute w-7 h-7 cursor-pointer -right-[5px] top-[60%] -translate-y-[50%] z-10 justify-center items-center"
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
    field: "gosiSalary",
    header: "Gosi Salary",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    body: (rowData: PayrollEntry) => (
      <span className="text-sm">{rowData.gosiSalary.toLocaleString()}</span>
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
      <span
        className={classNames(
          "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold",
          {
            "bg-yellow-100 text-yellow-700": rowData.status === "Pending",
            "bg-green-100 text-green-700": rowData.status === "Posted",
          }
        )}
      >
        {rowData.status}
      </span>
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
  const [searchValue, setSearchValue] = useState<string>("");
  const [payrollData] = useState<PayrollEntry[]>(initialPayrollData);
  const tableRef = useRef<TableRef>(null);

  const handleView = (payroll: PayrollEntry) => {
    console.log("View payroll:", payroll);
    // TODO: Navigate to view page or open view modal
  };

  const handleRecalculate = (payroll: PayrollEntry) => {
    console.log("Recalculate payroll:", payroll);
    // TODO: Implement recalculate functionality
  };

  const handlePost = (payroll: PayrollEntry) => {
    console.log("Post payroll:", payroll);
    // TODO: Implement post functionality
    if (confirm(`Are you sure you want to post ${payroll.period}?`)) {
      // Post logic here
    }
  };

  const handleRepost = (payroll: PayrollEntry) => {
    console.log("Repost payroll:", payroll);
    // TODO: Implement repost functionality
    if (confirm(`Are you sure you want to repost ${payroll.period}?`)) {
      // Repost logic here
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
          <Input
            small
            type="month"
            value={value}
            onChange={onChange}
            className="w-full md:w-44"
            placeholder="Select Month & Year"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
          </div>
          <div className="w-full md:w-auto">
            <Input
              small
              value={searchValue}
              className="w-full"
              icon="pi pi-search"
              iconPosition="left"
              onChange={(e) => {
                setSearchValue(e.target.value);
                onChange?.(e);
              }}
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
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
            onClick={() => router.push("/payroll/12-2025")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
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
          showGridlines
        />
      </div>
    </div>
  );
};

export default PayrollPage;
