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
import {
  User,
  usersData,
  branchesData,
  projectsData,
  userRolesData,
} from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (user: User) => void,
  handleDelete: (user: User) => void
): TableColumn<User>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: User) => (
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
    body: (rowData: User) => <span className="text-sm">{rowData.nameEn}</span>,
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: User) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "email",
    header: "Email",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: User) => <span className="text-sm">{rowData.email}</span>,
  },
  {
    field: "userRoleId",
    header: "Role",
    sortable: true,
    filterable: false,
    style: { minWidth: "150px" },
    body: (rowData: User) => {
      const role = userRolesData.find((r) => r.id === rowData.userRoleId);
      return <span className="text-sm">{role?.nameEn || ""}</span>;
    },
  },
  {
    field: "branchId",
    header: "Branch",
    sortable: false,
    filterable: false,
    style: { minWidth: "200px" },
    body: (rowData: User) => {
      if (!rowData.branchAccess || !rowData.branchId) return "-";
      const branch = branchesData.find((b) => b.id === rowData.branchId);
      const projectNames =
        rowData.projectIds
          ?.map((id) => {
            const project = projectsData.find((p) => p.id === id);
            return project?.nameEn;
          })
          .filter(Boolean)
          .join(", ") || "";

      return (
        <div className="flex flex-col">
          <span className="text-sm font-bold">{branch?.nameEn || "-"}</span>
          {projectNames && (
            <span className="text-xs text-gray-400 mt-0.5">{projectNames}</span>
          )}
        </div>
      );
    },
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: User) => (
      <div className="w-full flex flex-1 justify-center">
        <span
          className={classNames("text-sm text-center px-2 py-1 rounded", {
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
    body: (rowData: User) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const UsersPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const tableRef = useRef<TableRef>(null);

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.nameEn}?`)) {
      // Delete logic here
      console.log("Delete user:", user);
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
            User Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, manage user records, and user details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add User"
            onClick={() => router.push("/users/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          ref={tableRef}
          dataKey="id"
          data={usersData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={10}
          globalSearch={true}
          scrollable
          scrollHeight="65vh"
        />
      </div>
    </div>
  );
};

export default UsersPage;
