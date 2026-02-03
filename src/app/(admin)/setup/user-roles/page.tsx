"use client";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef, useState, useMemo, useCallback } from "react";

import {
  Input,
  Table,
  TableRef,
  TypeBadge,
  TableColumn,
  ExportOptions,
} from "@/components";
import { useGetUserRoles } from "@/lib/db/services/user-role/requests";
import { UserRoleInterface } from "@/lib/db/services/user-role/user-role.service";

const getAccessDefinition = (access: string): string => {
  const definitions: Record<string, string> = {
    Admin: "Can do anything of all branches (all functionalities)",
    Manager: "Can do anything of all branches except user management",
    Branch: "Can do anything within assigned branch only",
    "Access-Enabled User":
      "Customizable permissions with checkboxes for each feature",
  };
  return definitions[access] || "";
};

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (): TableColumn<UserRoleInterface>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: UserRoleInterface) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: UserRoleInterface) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: UserRoleInterface) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "description",
    header: "Description",
    sortable: false,
    filterable: false,
    style: { minWidth: "300px" },
    body: (rowData: UserRoleInterface) => (
      <span className="text-sm text-gray-600">
        {getAccessDefinition(rowData.access)}
      </span>
    ),
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 130 },
    align: "center",
    body: (rowData: UserRoleInterface) => (
      <TypeBadge
        text={rowData.isActive ? "Active" : "In-Active"}
        variant={rowData.isActive ? "success" : "danger"}
      />
    ),
  },
];

const UserRolesPage = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const tableRef = useRef<TableRef>(null);
  const { data: userRoles, isLoading } = useGetUserRoles();

  // Client-side filtering (since service doesn't support search)
  const filteredUserRoles = useMemo(() => {
    if (!userRoles || !searchValue) return userRoles || [];
    const searchLower = searchValue.toLowerCase();
    return userRoles.filter(
      (role: UserRoleInterface) =>
        role.nameEn.toLowerCase().includes(searchLower) ||
        role.nameAr?.toLowerCase().includes(searchLower) ||
        role.access.toLowerCase().includes(searchLower)
    );
  }, [userRoles, searchValue]);

  const exportCSV = useCallback(() => {
    tableRef.current?.exportCSV();
  }, []);

  const exportExcel = useCallback(() => {
    tableRef.current?.exportExcel();
  }, []);

  // Memoized columns
  const tableColumns = useMemo(() => columns(), []);

  // Memoized header renderer
  const renderHeader = useCallback(() => {
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
  }, [searchValue, exportCSV, exportExcel]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            User Role Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View user role records and role details. (View Only)
          </p>
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          data={filteredUserRoles}
          ref={tableRef}
          loading={isLoading}
          loadingIcon={
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          }
          customHeader={renderHeader}
          columns={tableColumns}
          pagination={true}
          lazy={true}
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

export default UserRolesPage;
