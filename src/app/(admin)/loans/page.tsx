"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  Input,
  Table,
  Button,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
  TableRef,
} from "@/components";
import { initialLoansData, LoanEntry } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
};

const columns = (
  handleEdit: (loan: LoanEntry) => void,
  handleDelete: (loan: LoanEntry) => void
): TableColumn<LoanEntry>[] => [
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { width: "100px" },
    body: (rowData: LoanEntry) => (
      <div className="w-[100px] ">
        <span className="text-sm">{rowData.date}</span>
      </div>
    ),
  },
  {
    field: "code",
    header: "Emp. Code",
    ...commonColumnProps,
    style: { width: "120px" },
    body: (rowData: LoanEntry) => (
      <div className="w-[120px] ">
        <span className="text-sm">{rowData.code}</span>
      </div>
    ),
  },
  {
    field: "employeeName",
    header: "Employee",
    ...commonColumnProps,
    style: { minWidth: "300px" },
    body: (rowData: LoanEntry) => (
      <span className="text-sm uppercase">{rowData.employeeName}</span>
    ),
  },
  {
    field: "designation",
    header: "Designation",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: LoanEntry) => (
      <span className="text-sm">{rowData.designation}</span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    filterable: false,
    style: { minWidth: "150px" },
    body: (rowData: LoanEntry) => (
      <span className="text-sm capitalize">{rowData.type}</span>
    ),
  },
  {
    field: "amount",
    header: "Amount",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    body: (rowData: LoanEntry) => (
      <span className="text-sm font-semibold">
        {rowData.amount.toLocaleString()}
      </span>
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: LoanEntry) => (
      <span className="text-sm">{rowData.remarks}</span>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "150px" },
    body: (rowData: LoanEntry) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const LoansPage = () => {
  const router = useRouter();
  const [selectedDesignation, setSelectedDesignation] = useState<any>("0");
  const [loansData] = useState<LoanEntry[]>(initialLoansData);
  const tableRef = useRef<TableRef>(null);

  const handleEdit = (loan: LoanEntry) => {
    console.log("Edit loan:", loan);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/loans/${loan.id}/edit`);
  };

  const handleDelete = (loan: LoanEntry) => {
    console.log("Delete loan:", loan);
    // TODO: Implement delete functionality with confirmation
    if (
      confirm(
        `Are you sure you want to delete loan ${loan.code} for ${loan.employeeName}?`
      )
    ) {
      // Delete logic here
      // Example: deleteLoan(loan.id);
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
            type="date"
            value={value}
            onChange={onChange}
            className="w-full md:w-44"
            placeholder="Select Date"
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
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Loan Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage loan records, and loan details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Loan"
            onClick={() => router.push("/loans/new")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <Table
          ref={tableRef}
          dataKey="id"
          data={loansData}
          columns={columns(handleEdit, handleDelete)}
          customHeader={renderHeader}
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={10}
        />
      </div>
    </div>
  );
};

export default LoansPage;
