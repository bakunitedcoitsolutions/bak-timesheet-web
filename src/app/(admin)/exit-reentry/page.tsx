"use client";
import { useRouter } from "next/navigation";

import {
  Input,
  Table,
  Button,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
  TypeBadge,
} from "@/components";
import { ExitReentryEntry, initialExitReentryData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (entry: ExitReentryEntry) => void,
  handleDelete: (entry: ExitReentryEntry) => void
): TableColumn<ExitReentryEntry>[] => [
  {
    field: "code",
    header: "Code",
    ...commonColumnProps,
    style: { minWidth: 120 },
    body: (rowData: ExitReentryEntry) => (
      <span className="text-sm">{rowData.code}</span>
    ),
  },
  {
    field: "employeeName",
    header: "Employee",
    ...commonColumnProps,
    style: { minWidth: 250 },
    body: (rowData: ExitReentryEntry) => (
      <span className="text-sm">{rowData.employeeName}</span>
    ),
  },
  {
    field: "designation",
    header: "Designation",
    ...commonColumnProps,
    style: { minWidth: 200 },
    body: (rowData: ExitReentryEntry) => (
      <span className="text-sm">{rowData.designation}</span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ExitReentryEntry) => (
      <TypeBadge
        text={rowData.type}
        variant={rowData.type === "Exit" ? "danger" : "success"}
      />
    ),
  },
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { minWidth: 150 },
    body: (rowData: ExitReentryEntry) => (
      <span className="text-sm">{rowData.date}</span>
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    style: { minWidth: 200 },
    body: (rowData: ExitReentryEntry) => (
      <span className="text-sm">{rowData.remarks}</span>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: ExitReentryEntry) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const ExitReentryPage = () => {
  const router = useRouter();

  const handleEdit = (entry: ExitReentryEntry) => {
    console.log("Edit entry:", entry);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/exit-reentry/${entry.id}/edit`);
  };

  const handleDelete = (entry: ExitReentryEntry) => {
    console.log("Delete entry:", entry);
    // TODO: Implement delete functionality with confirmation
    if (
      confirm(
        `Are you sure you want to delete exit/re-entry record for ${entry.employeeName}?`
      )
    ) {
      // Delete logic here
    }
  };

  const renderHeader = ({
    value,
    onChange,
    exportCSV,
    exportExcel,
  }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="w-full md:w-auto">
          <Input
            small
            className="w-full"
            value={value}
            icon="pi pi-search"
            iconPosition="left"
            onChange={onChange}
            placeholder="Search"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div>
            <ExportOptions
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
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
            Exit Re-Entry Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, manage exit and re-entry records, and details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Exit Re-Entry"
            onClick={() => router.push("/exit-reentry/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          data={initialExitReentryData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
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

export default ExitReentryPage;
