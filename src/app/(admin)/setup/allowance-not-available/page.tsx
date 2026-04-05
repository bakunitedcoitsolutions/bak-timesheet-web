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
} from "@/components";
import {
  getErrorMessage,
  createSortHandler,
  toPrimeReactSortOrder,
} from "@/utils/helpers";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import {
  useListAllowanceNotAvailable,
  useDeleteAllowanceNotAvailable,
} from "@/lib/db/services/allowance-not-available/requests";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { ListedAllowanceNotAvailable } from "@/lib/db/services/allowance-not-available/allowance-not-available.dto";

// Constants
const SORTABLE_FIELDS = {
  nameEn: "nameEn",
  nameAr: "nameAr",
  startDate: "startDate",
  endDate: "endDate",
  type: "type",
  isActive: "isActive",
} as const;

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 150 },
};

type SortableField = keyof typeof SORTABLE_FIELDS;

const columns = (
  handleEdit: (item: ListedAllowanceNotAvailable) => void,
  handleDelete: (item: ListedAllowanceNotAvailable) => void
): TableColumn<ListedAllowanceNotAvailable>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "50px" },
    headerStyle: { minWidth: "50px" },
    body: (_: ListedAllowanceNotAvailable, options: any) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">
          {Number(options?.rowIndex) + 1}
        </span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedAllowanceNotAvailable) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedAllowanceNotAvailable) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || "-"}
        </span>
      </div>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    body: (rowData: ListedAllowanceNotAvailable) => (
      <TypeBadge text={rowData.type} variant="primary" />
    ),
  },
  {
    field: "startDate",
    header: "Start Date",
    ...commonColumnProps,
    body: (rowData: ListedAllowanceNotAvailable) => (
      <span className="text-sm">
        {new Date(rowData.startDate).toLocaleDateString("en-GB")}
      </span>
    ),
  },
  {
    field: "endDate",
    header: "End Date",
    ...commonColumnProps,
    body: (rowData: ListedAllowanceNotAvailable) => (
      <span className="text-sm">
        {new Date(rowData.endDate).toLocaleDateString("en-GB")}
      </span>
    ),
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ListedAllowanceNotAvailable) => (
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
    style: { minWidth: 100 },
    body: (rowData: ListedAllowanceNotAvailable) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const AllowanceNotAvailablePage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<SortableField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteFn } = useDeleteAllowanceNotAvailable();

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  const { data: response, isLoading } = useListAllowanceNotAvailable({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch || undefined,
  });

  const items = response?.allowanceNotAvailables ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = response?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (item: ListedAllowanceNotAvailable) => {
      router.push(`/setup/allowance-not-available/${item.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (item: ListedAllowanceNotAvailable) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Record",
        message: `Are you sure you want to delete "${item.nameEn}"?`,
        onAccept: async () => {
          await deleteFn(
            { id: item.id },
            {
              onSuccess: () => {
                toastService.showInfo("Done", "Record deleted successfully");
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete record"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteFn]
  );

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
    () => columns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
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
      </div>
    );
  }, [searchValue]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Allowance Not Allowed Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage allowance exclusion periods.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add New"
            onClick={() => router.push("/setup/allowance-not-available/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          removableSort
          data={items}
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
          lazy={true}
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

export default AllowanceNotAvailablePage;
