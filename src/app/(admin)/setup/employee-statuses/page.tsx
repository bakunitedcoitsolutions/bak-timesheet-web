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
import { EmployeeStatus, employeeStatusesData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (status: EmployeeStatus) => void,
  handleDelete: (status: EmployeeStatus) => void
): TableColumn<EmployeeStatus>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: EmployeeStatus) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: EmployeeStatus) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: EmployeeStatus) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
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
    body: (rowData: EmployeeStatus) => (
      <TypeBadge
        text={rowData.isActive ? "Active" : "In-Active"}
        variant={rowData.isActive ? "success" : "danger"}
      />
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: EmployeeStatus) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const EmployeeStatusesPage = () => {
  const router = useRouter();

  const handleEdit = (status: EmployeeStatus) => {
    router.push(`/setup/employee-statuses/${status.id}`);
  };

  const handleDelete = (status: EmployeeStatus) => {
    if (confirm(`Are you sure you want to delete ${status.nameEn}?`)) {
      // Delete logic here
      console.log("Delete status:", status);
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
            Employee Status Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, manage employee status records, and status details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Employee Status"
            onClick={() => router.push("/setup/employee-statuses/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          data={employeeStatusesData}
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

export default EmployeeStatusesPage;
