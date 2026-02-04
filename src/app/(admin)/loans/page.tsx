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
  BulkUploadDialog,
  BulkUploadOptions,
} from "@/components";
import {
  getErrorMessage,
  createSortHandler,
  toPrimeReactSortOrder,
} from "@/utils/helpers";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import {
  ListedLoan,
  BulkUploadLoanResult,
} from "@/lib/db/services/loan/loan.dto";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { ListLoansSortableField } from "@/lib/db/services/loan/loan.dto";
import {
  useGetLoans,
  useDeleteLoan,
  useBulkUploadLoans,
} from "@/lib/db/services/loan/requests";
import {
  parseCSVFile,
  parseExcelFile,
  downloadSampleTemplate,
} from "@/lib/db/services/loan/bulk-upload-utils";

// Constants
const SORTABLE_FIELDS = {
  date: "date",
  type: "type",
  amount: "amount",
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
  handleEdit: (loan: ListedLoan) => void,
  handleDelete: (loan: ListedLoan) => void
): TableColumn<ListedLoan>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedLoan) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { minWidth: "100px" },
    body: (rowData: ListedLoan) => {
      const date = new Date(rowData.date);
      return (
        <span className="text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      );
    },
  },
  {
    field: "employeeId",
    header: "Employee",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: ListedLoan) => (
      <span className="text-sm line-clamp-2">
        {!!rowData.employee?.employeeCode && (
          <span className="font-semibold text-primary">
            {rowData.employee?.employeeCode}
            {!!rowData.employee?.nameEn ? " - " : ""}
          </span>
        )}
        {!!rowData.employee?.nameEn && <span>{rowData.employee?.nameEn}</span>}
      </span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    filterable: false,
    style: { minWidth: "120px" },
    align: "center",
    body: (rowData: ListedLoan) => (
      <TypeBadge
        text={rowData.type}
        variant={rowData.type === "LOAN" ? "warning" : "success"}
      />
    ),
  },
  {
    field: "amount",
    header: "Amount",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    align: "right",
    body: (rowData: ListedLoan) => (
      <span className="text-sm font-semibold">
        {rowData.amount?.toLocaleString() || "0"}
      </span>
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    style: { minWidth: "300px" },
    body: (rowData: ListedLoan) => (
      <span className="text-sm line-clamp-2">{rowData.remarks || "-"}</span>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: ListedLoan) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const LoansPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<SortableField | ListLoansSortableField>(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilePicker, setShowFilePicker] = useState<boolean>(false);
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteLoan } = useDeleteLoan();
  const { mutateAsync: bulkUploadLoans } = useBulkUploadLoans();

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
  // Set startDate to beginning of day and endDate to end of day
  const dateFilter = selectedDate
    ? (() => {
        const selected = new Date(selectedDate);
        const startOfDay = new Date(selected);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selected);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          startDate: startOfDay,
          endDate: endOfDay,
        };
      })()
    : undefined;

  const { data: loansResponse, isLoading } = useGetLoans({
    page,
    limit,
    sortBy: sortBy as ListLoansSortableField,
    sortOrder,
    search: debouncedSearch || undefined,
    ...(dateFilter && {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
    }),
  });

  const loans = loansResponse?.loans ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = loansResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (loan: ListedLoan) => {
      router.push(`/loans/${loan.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (loan: ListedLoan) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Loan",
        message: `Are you sure you want to delete this loan record?`,
        onAccept: async () => {
          await deleteLoan(
            { id: loan.id },
            {
              onSuccess: () => {
                toastService.showInfo("Done", "Loan deleted successfully");
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete loan"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteLoan]
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
        fieldMap: SORTABLE_FIELDS,
        currentPage: page,
        onSortByChange: handleSortByChange,
        onSortOrderChange: handleSortOrderChange,
        onPageReset: handlePageReset,
      }),
    [page, handlePageReset, handleSortByChange, handleSortOrderChange]
  );

  // Memoized columns
  const tableColumns = useMemo(
    () => columns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  // Bulk upload handlers
  const handleUploadCSV = useCallback(() => {
    setShowFilePicker(true);
  }, []);

  const handleUploadExcel = useCallback(() => {
    setShowFilePicker(true);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        // Detect file type from file extension or MIME type
        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";

        let parseResult;
        if (isCSV) {
          parseResult = await parseCSVFile(file);
        } else {
          parseResult = await parseExcelFile(file);
        }

        if (parseResult.errors.length > 0) {
          toastService.showWarn(
            "Parse Warnings",
            `${parseResult.errors.length} row(s) had errors. Check console for details.`
          );
          console.error("Parse errors:", parseResult.errors);
        }

        if (parseResult.data.length === 0) {
          toastService.showError("Error", "No valid data found in file");
          throw new Error("No valid data found in file");
        }

        // Upload the data
        await bulkUploadLoans(
          { loans: parseResult.data },
          {
            onSuccess: (result: BulkUploadLoanResult) => {
              const message =
                result.success > 0
                  ? `Successfully uploaded ${result.success} loan(s)`
                  : "Upload completed";

              if (result.failed > 0) {
                toastService.showWarn(
                  "Upload Complete",
                  `${message}. ${result.failed} failed. Check console for details.`
                );
                console.error("Upload errors:", result.errors);
              } else {
                toastService.showSuccess("Success", message);
              }
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(
                error,
                "Failed to upload loans"
              );
              toastService.showError("Error", errorMessage);
              throw error; // Re-throw to prevent dialog from closing
            },
          }
        );
      } catch (error: any) {
        const errorMessage = getErrorMessage(error, "Failed to parse file");
        toastService.showError("Error", errorMessage);
        throw error; // Re-throw to prevent dialog from closing
      }
    },
    [bulkUploadLoans]
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
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={handleUploadCSV}
              uploadExcel={handleUploadExcel}
              downloadTemplate={downloadSampleTemplate}
              buttonClassName="w-full md:w-auto h-9!"
            />
          </div>
        </div>
      </div>
    );
  }, [
    searchValue,
    selectedDate,
    exportCSV,
    exportExcel,
    handleUploadCSV,
    handleUploadExcel,
  ]);

  return (
    <>
      <div className="flex h-full flex-col gap-6 px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
          <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              Loan Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View, manage loan records, and loan details.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Button
              size="small"
              variant="solid"
              icon="pi pi-plus"
              label="Add Loan"
              onClick={() => router.push("/loans/new")}
            />
          </div>
        </div>
        <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
          <Table
            dataKey="id"
            removableSort
            data={loans}
            ref={tableRef}
            loading={isLoading}
            loadingIcon={
              <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            }
            customHeader={renderHeader}
            columns={tableColumns}
            sortMode="single"
            onPage={handlePageChange}
            lazy
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

      <BulkUploadDialog
        visible={showFilePicker}
        title="Upload Loans"
        onHide={() => {
          setShowFilePicker(false);
        }}
        onUpload={handleUpload}
        accept={{
          "text/csv": [".csv"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "application/vnd.ms-excel": [".xls"],
        }}
      />
    </>
  );
};

export default LoansPage;
