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
} from "@/components";
import { Designation, designationsData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (designation: Designation) => void,
  handleDelete: (designation: Designation) => void
): TableColumn<Designation>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: Designation) => (
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
    body: (rowData: Designation) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-sm text-right">{rowData.nameAr || ""}</span>
      </div>
    ),
  },
  {
    field: "hoursPerDay",
    header: "Hours/Day",
    ...commonColumnProps,
    style: { minWidth: "120px" },
    align: "center",
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm">{rowData.hoursPerDay}</span>
      </div>
    ),
  },
  {
    field: "displayOrder",
    header: "Display Order",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    align: "center",
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm">{rowData.displayOrder}</span>
      </div>
    ),
  },
  {
    field: "color",
    header: "Color",
    sortable: false,
    filterable: false,
    style: { minWidth: "100px" },
    align: "center",
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-center">
        <div
          className="w-8 h-8 rounded-md border border-gray-300"
          style={{ backgroundColor: rowData.color }}
          title={rowData.color}
        />
      </div>
    ),
  },
  {
    field: "breakfastAllowance",
    header: "Breakfast Allowance",
    sortable: true,
    filterable: false,
    style: { minWidth: "150px" },
    align: "center",
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.breakfastAllowance ? "Yes" : "No"}
        </span>
      </div>
    ),
  },
  {
    field: "isActive",
    header: "Is Active",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: Designation) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.isActive ? "Active" : "Inactive"}
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
    body: (rowData: Designation) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const DesignationPage = () => {
  const router = useRouter();

  const handleEdit = (designation: Designation) => {
    console.log("Edit designation:", designation);
    // TODO: Navigate to edit page or open edit modal
    router.push(`/setup/designation/${designation.id}`);
  };

  const handleDelete = (designation: Designation) => {
    console.log("Delete designation:", designation);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${designation.nameEn}?`)) {
      // Delete logic here
      // Example: deleteDesignation(designation.id);
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
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Designation Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage designation records, and designation details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Designation"
            onClick={() => router.push("/setup/designation/new")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <Table
          dataKey="id"
          data={designationsData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
        />
      </div>
    </div>
  );
};

export default DesignationPage;
