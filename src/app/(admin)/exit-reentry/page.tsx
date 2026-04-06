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
  useAccess,
  TableColumn,
  TableActions,
  ExportOptions,
} from "@/components";
import {
  getErrorMessage,
  createSortHandler,
  toPrimeReactSortOrder,
} from "@/utils/helpers";
import dayjs from "@/lib/dayjs";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import {
  ListedExitReentry,
  ListExitReentriesSortableField,
} from "@/lib/db/services/exit-reentry/exit-reentry.dto";
import {
  useGetExitReentries,
  useDeleteExitReentry,
} from "@/lib/db/services/exit-reentry/requests";
import { useGlobalData, GlobalDataEmployee } from "@/context/GlobalDataContext";
// Constants
const SORTABLE_FIELDS = {
  date: "date",
  type: "type",
  createdAt: "createdAt",
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
  handleEdit: (entry: ListedExitReentry) => void,
  handleDelete: (entry: ListedExitReentry) => void,
  employeesMap: Map<number, GlobalDataEmployee>,
  canEdit: boolean,
  canDelete: boolean,
  role: number | string | undefined
): TableColumn<ListedExitReentry>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedExitReentry) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "employeeId",
    header: "Employee",
    ...commonColumnProps,
    style: { minWidth: 250 },
    body: (rowData: ListedExitReentry) => {
      const employee = employeesMap.get(rowData.employeeId);
      return (
        <span className="text-sm">
          {employee
            ? `${employee.employeeCode} - ${employee.nameEn}`
            : `Employee #${rowData.employeeId}`}
        </span>
      );
    },
  },
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { minWidth: 150 },
    body: (rowData: ListedExitReentry) => (
      <span className="text-sm">
        {rowData.date ? dayjs(rowData.date).format("DD/MM/YYYY") : "-"}
      </span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ListedExitReentry) => (
      <TypeBadge
        text={rowData.type}
        variant={rowData.type === "EXIT" ? "danger" : "success"}
      />
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    style: { minWidth: 200 },
    body: (rowData: ListedExitReentry) => (
      <span className="text-sm line-clamp-2">{rowData.remarks || "-"}</span>
    ),
  },
  ...(canEdit || canDelete
    ? [
        {
          field: "actions",
          header: "Actions",
          sortable: false,
          filterable: false,
          align: "center",
          style: { minWidth: 150 },
          body: (rowData: ListedExitReentry) => (
            <TableActions
              rowData={rowData}
              onEdit={canEdit ? handleEdit : undefined}
              onDelete={
                canDelete && Number(role) !== 4 ? handleDelete : undefined
              }
            />
          ),
        } as TableColumn<ListedExitReentry>,
      ]
    : []),
];

const ExitReentryPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<
    SortableField | ListExitReentriesSortableField
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteExitReentry } = useDeleteExitReentry();

  const { can, role } = useAccess();
  const canEdit = can("exitReentry", "edit");
  const canDelete = can("exitReentry", "full"); // Usually 'full' or 'delete' if defined
  const canAdd = can("exitReentry", "add");

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value or date changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  useEffect(() => {
    if (selectedDate && page !== 1) {
      setPage(1);
    }
  }, [selectedDate, page]);

  // Convert selected date to Date object for API
  const dateFilter = selectedDate
    ? {
        startDate: dayjs(selectedDate).startOf("day").toDate(),
        endDate: dayjs(selectedDate).endOf("day").toDate(),
      }
    : undefined;

  const { data: exitReentriesResponse, isLoading } = useGetExitReentries({
    page,
    limit,
    sortBy: sortBy as ListExitReentriesSortableField,
    sortOrder,
    search: debouncedSearch || undefined,
    ...(dateFilter && {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
    }),
  });

  // Fetch all employees for display
  const { data: globalData } = useGlobalData();
  const employees = globalData.employees || [];

  // Create a map for quick employee lookup
  const employeesMap = useMemo(() => {
    const map = new Map<number, GlobalDataEmployee>();
    employees.forEach((emp: GlobalDataEmployee) => {
      map.set(emp.id, emp);
    });
    return map;
  }, [employees]);

  const exitReentries = exitReentriesResponse?.exitReentries ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = exitReentriesResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (entry: ListedExitReentry) => {
      router.push(`/exit-reentry/${entry.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (entry: ListedExitReentry) => {
      const employee = employeesMap.get(entry.employeeId);
      const employeeName = employee
        ? `${employee.employeeCode} - ${employee.nameEn}`
        : `Employee #${entry.employeeId}`;

      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Exit/Re-entry",
        message: `Are you sure you want to delete exit/re-entry record for ${employeeName}?`,
        onAccept: async () => {
          await deleteExitReentry(
            { id: entry.id },
            {
              onSuccess: () => {
                toastService.showInfo(
                  "Done",
                  "Exit/Re-entry deleted successfully"
                );
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete exit/re-entry"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteExitReentry, employeesMap]
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

  // Wrapper for setSortBy to handle undefined (reset to default)
  const handleSortByChange = useCallback((field: SortableField | undefined) => {
    setSortBy(field ?? "createdAt");
  }, []);

  // Wrapper for setSortOrder to handle undefined (reset to default)
  const handleSortOrderChange = useCallback(
    (order: "asc" | "desc" | undefined) => {
      setSortOrder(order ?? "desc");
    },
    []
  );

  // Memoized sort handler
  const sortHandler = useMemo(
    () =>
      createSortHandler({
        currentPage: page,
        fieldMap: SORTABLE_FIELDS,
        onPageReset: handlePageReset,
        onSortByChange: handleSortByChange,
        onSortOrderChange: handleSortOrderChange,
      }),
    [page, handlePageReset, handleSortByChange, handleSortOrderChange]
  );

  // Memoized columns
  const tableColumns = useMemo(
    () =>
      columns(handleEdit, handleDelete, employeesMap, canEdit, canDelete, role),
    [handleEdit, handleDelete, employeesMap, canEdit, canDelete, role]
  );

  // Memoized header renderer
  const renderHeader = useCallback(() => {
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
              className="w-full md:w-64"
              icon="pi pi-search"
              iconPosition="left"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by remarks..."
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
        </div>
      </div>
    );
  }, [searchValue, selectedDate, exportCSV, exportExcel]);

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
          {canAdd && (
            <Button
              size="small"
              variant="solid"
              icon="pi pi-plus"
              label="Add Exit Re-Entry"
              onClick={() => router.push("/exit-reentry/new")}
            />
          )}
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          removableSort
          data={exitReentries}
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

export default ExitReentryPage;
