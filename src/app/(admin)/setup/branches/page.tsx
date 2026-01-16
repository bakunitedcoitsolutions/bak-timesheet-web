"use client";
import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

import {
  Input,
  Table,
  Button,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { Branch, branchesData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (branch: Branch) => void,
  handleDelete: (branch: Branch) => void
): TableColumn<Branch>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: Branch) => (
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
    body: (rowData: Branch) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: Branch) => (
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
    body: (rowData: Branch) => (
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
    body: (rowData: Branch) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const BranchesPage = () => {
  const router = useRouter();

  const handleEdit = (branch: Branch) => {
    console.log("Edit branch:", branch);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/setup/branches/${branch.id}/edit`);
  };

  const handleDelete = (branch: Branch) => {
    console.log("Delete branch:", branch);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${branch.nameEn}?`)) {
      // Delete logic here
      // Example: deleteBranch(branch.id);
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
            Branch Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage branch records, and branch details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Branch"
            onClick={() => router.push("/setup/branches/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          data={branchesData}
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

export default BranchesPage;
