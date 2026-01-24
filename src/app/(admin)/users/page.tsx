"use client";
import { useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import {
  Input,
  Table,
  Button,
  TableRef,
  TypeBadge,
  TableColumn,
  TableActions,
  ExportOptions,
} from "@/components";
import {
  getErrorMessage,
  createSortHandler,
  toPrimeReactSortOrder,
} from "@/utils/helpers";
import { ListedUser } from "@/lib";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeleteUser, useGetUsers } from "@/lib/db/services/user/requests";

// Constants
const SORTABLE_FIELDS = {
  nameEn: "nameEn",
  nameAr: "nameAr",
  isActive: "isActive",
  email: "email",
  userRoleId: "userRoleId",
  branchId: "branchId",
} as const;

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

type SortableField = keyof typeof SORTABLE_FIELDS;

const columns = (
  handleEdit: (user: ListedUser) => void,
  handleDelete: (user: ListedUser) => void,
  currentPage: number = 1,
  rowsPerPage: number = 10
): TableColumn<ListedUser>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedUser, options?: { rowIndex?: number }) => {
      const rowIndex = options?.rowIndex ?? 0;
      const index = (currentPage - 1) * rowsPerPage + rowIndex + 1;
      return (
        <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
          <span className="text-sm font-medium">{index}</span>
        </div>
      );
    },
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => (
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
    style: { minWidth: 250 },
    body: (rowData: ListedUser) => (
      <span className="text-sm">{rowData.email}</span>
    ),
  },
  {
    field: "userRoleId",
    header: "Role",
    sortable: true,
    filterable: false,
    style: { minWidth: 200 },
    body: (rowData: ListedUser) => {
      return <span className="text-sm">{rowData?.userRole?.nameEn || ""}</span>;
    },
  },
  {
    field: "branchId",
    header: "Branch",
    sortable: false,
    filterable: false,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => {
      const branch = rowData?.branch?.nameEn || "-";

      return (
        <div className="flex flex-col">
          <span className="text-sm font-bold">{branch}</span>
        </div>
      );
    },
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 130 },
    align: "center",
    body: (rowData: ListedUser) => (
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
    body: (rowData: ListedUser) => (
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
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<SortableField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteUser } = useDeleteUser();

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  const { data: usersResponse, isLoading } = useGetUsers({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch || undefined,
  });

  const users = usersResponse?.users ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = usersResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (user: ListedUser) => {
      router.push(`/users/${user.id}`);
    },
    [router]
  );

  const handleDelete = useCallback((user: ListedUser) => {
    showConfirmDialog({
      icon: "pi pi-trash",
      title: "Delete User",
      message: `Are you sure you want to delete "${user.nameEn}"?`,
      onAccept: async () => {
        await deleteUser(
          { id: user.id },
          {
            onSuccess: () => {
              toastService.showInfo("Done", "User deleted successfully");
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(
                error,
                "Failed to delete user"
              );
              toastService.showError("Error", errorMessage);
            },
          }
        );
      },
    });
  }, []);

  const exportCSV = useCallback(() => {
    tableRef.current?.exportCSV();
  }, []);

  const exportExcel = useCallback(() => {
    tableRef.current?.exportExcel();
  }, []);

  const handlePageChange = useCallback(
    (e: { page?: number; rows?: number }) => {
      // PrimeReact uses 0-based page index, our API uses 1-based
      setPage((e.page ?? 0) + 1);
      setLimit(e.rows ?? currentLimit);
    },
    [currentLimit]
  );

  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  // Memoized sort handler
  const sortHandler = useMemo(
    () =>
      createSortHandler({
        fieldMap: SORTABLE_FIELDS,
        currentPage: page,
        onSortByChange: setSortBy,
        onSortOrderChange: setSortOrder,
        onPageReset: handlePageReset,
      }),
    [page, handlePageReset]
  );

  // Memoized columns
  const tableColumns = useMemo(
    () => columns(handleEdit, handleDelete, currentPage, currentLimit),
    [handleEdit, handleDelete, currentPage, currentLimit]
  );

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
          dataKey="id"
          removableSort
          data={users}
          ref={tableRef}
          loading={isLoading}
          loadingIcon={
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          }
          customHeader={renderHeader}
          columns={tableColumns}
          sortMode="single"
          onPage={handlePageChange}
          onSort={sortHandler}
          sortField={sortBy}
          sortOrder={toPrimeReactSortOrder(sortOrder) as any}
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={currentLimit}
          first={(currentPage - 1) * currentLimit}
          totalRecords={total}
          globalSearch={true}
          scrollable
          scrollHeight="65vh"
        />
      </div>
    </div>
  );
};

export default UsersPage;
