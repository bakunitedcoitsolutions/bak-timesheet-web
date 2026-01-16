"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

import {
  Input,
  Table,
  Button,
  TableRef,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { PayrollSection, payrollSectionsData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (payrollSection: PayrollSection) => void,
  handleDelete: (payrollSection: PayrollSection) => void
): TableColumn<PayrollSection>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: PayrollSection) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: PayrollSection) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: PayrollSection) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "displayOrder",
    header: "Display Order",
    sortable: true,
    filterable: false,
    style: { minWidth: "80px" },
    align: "center",
    body: (rowData: PayrollSection) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm font-medium">{rowData.displayOrder}</span>
      </div>
    ),
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: PayrollSection) => (
      <div className="w-full flex flex-1 justify-center">
        <span
          className={classNames("text-sm text-center", {
            "text-theme-green bg-theme-light-green": rowData.isActive,
            "text-theme-red bg-theme-light-red": !rowData.isActive,
          })}
        >
          {rowData.isActive ? "Active" : "In-Active"}
        </span>
      </div>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: PayrollSection) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const PayrollSectionsPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const tableRef = useRef<TableRef>(null);

  const handleEdit = (payrollSection: PayrollSection) => {
    console.log("Edit payroll section:", payrollSection);
    router.push(`/setup/payroll-sections/${payrollSection.id}`);
  };

  const handleDelete = (payrollSection: PayrollSection) => {
    console.log("Delete payroll section:", payrollSection);
    if (confirm(`Are you sure you want to delete ${payrollSection.nameEn}?`)) {
      // Delete logic here
      // Example: deletePayrollSection(payrollSection.id);
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
            className="w-full"
            value={searchValue}
            icon="pi pi-search"
            iconPosition="left"
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange?.(e);
            }}
            placeholder="Search"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div>
            <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
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
            Payroll Section Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage payroll section records, and payroll section details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Payroll Section"
            onClick={() => router.push("/setup/payroll-sections/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          ref={tableRef}
          dataKey="id"
          data={payrollSectionsData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
          globalSearch={true}
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={10}
          scrollable
          scrollHeight="65vh"
        />
      </div>
    </div>
  );
};

export default PayrollSectionsPage;
