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
  BulkUploadOptions,
} from "@/components";
import { initialChallansData, ChallanEntry } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
};

const columns = (
  handleEdit: (challan: ChallanEntry) => void,
  handleDelete: (challan: ChallanEntry) => void
): TableColumn<ChallanEntry>[] => [
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { width: "100px" },
    body: (rowData: ChallanEntry) => (
      <div className="w-[100px]">
        <span className="text-sm">{rowData.date}</span>
      </div>
    ),
  },
  {
    field: "code",
    header: "Emp. Code",
    ...commonColumnProps,
    style: { width: "120px" },
    body: (rowData: ChallanEntry) => (
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
    body: (rowData: ChallanEntry) => (
      <span className="text-sm uppercase">{rowData.employeeName}</span>
    ),
  },
  {
    field: "designation",
    header: "Designation",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ChallanEntry) => (
      <span className="text-sm">{rowData.designation}</span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    filterable: false,
    style: { minWidth: "150px" },
    body: (rowData: ChallanEntry) => (
      <span className="text-sm capitalize">{rowData.type}</span>
    ),
  },
  {
    field: "amount",
    header: "Amount",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    body: (rowData: ChallanEntry) => (
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
    body: (rowData: ChallanEntry) => (
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
    body: (rowData: ChallanEntry) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const ChallansPage = () => {
  const router = useRouter();
  const [challansData] = useState<ChallanEntry[]>(initialChallansData);
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const tableRef = useRef<TableRef>(null);

  const handleEdit = (challan: ChallanEntry) => {
    console.log("Edit challan:", challan);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/challans/${challan.id}/edit`);
  };

  const handleDelete = (challan: ChallanEntry) => {
    console.log("Delete challan:", challan);
    // TODO: Implement delete functionality with confirmation
    if (
      confirm(
        `Are you sure you want to delete challan ${challan.code} for ${challan.employeeName}?`
      )
    ) {
      // Delete logic here
      // Example: deleteChallan(challan.id);
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
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <Input
              small
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-44"
              placeholder="Select Date"
            />
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
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <ExportOptions
              exportCSV={exportCSV}
              exportExcel={exportExcel}
              buttonClassName="w-full md:w-auto h-9!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={() => {}}
              uploadExcel={() => {}}
              buttonClassName="w-full md:w-auto h-9!"
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
            Challan Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage challan records, and challan details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Challan"
            onClick={() => router.push("/challans/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          ref={tableRef}
          dataKey="id"
          data={challansData}
          columns={columns(handleEdit, handleDelete)}
          customHeader={renderHeader}
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

export default ChallansPage;
