"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import { TableRef, useAccess, BulkUploadDialog } from "@/components";
import { getErrorMessage, createSortHandler } from "@/utils/helpers";
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
import {
  exportLoansToExcel,
  exportLoansToCSV,
} from "@/lib/db/services/loan/loan-export-utils";
import { listAllLoansAction } from "@/lib/db/services/loan/actions";
import { useGetPayrollSummaryStatus } from "@/lib/db/services/payroll-summary/requests";

// Components
import { LoansHeader } from "./components/LoansHeader";
import { LoansFilters } from "./components/LoansFilters";
import { LoansTable } from "./components/LoansTable";

// Helpers
import {
  SORTABLE_FIELDS,
  getLoansTableColumns,
  SortableField,
} from "./helpers";
import dayjs from "@/lib/dayjs";

const LoansPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM")
  );
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

  const { can, role } = useAccess();
  const hasFull = can("loans", "full");
  const canEdit = can("loans", "edit");
  const canAdd = can("loans", "add");

  const { month: selectedMonth, year: selectedYear } = useMemo(() => {
    const d = dayjs(selectedDate || new Date());
    return { month: d.month() + 1, year: d.year() };
  }, [selectedDate]);

  const { data: payrollSummaryStatus } = useGetPayrollSummaryStatus({
    month: selectedMonth,
    year: selectedYear,
  });

  const isPayrollPosted = payrollSummaryStatus?.payrollStatusId === 3;

  const isLocked = useCallback(() => {
    if (isPayrollPosted) return true;
    if (role === 4 && hasFull) return false;
    if (role === 4 && !canEdit) return true;
    return false;
  }, [isPayrollPosted, canEdit, role, hasFull]);

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Reset to first page when date changes
  useEffect(() => {
    setPage(1);
  }, [selectedDate]);

  // Convert selected date to Date object for API
  const dateFilter = selectedDate
    ? (() => {
        const date = dayjs(selectedDate);
        return {
          startDate: date.startOf("month").toDate(),
          endDate: date.endOf("month").toDate(),
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

  const exportCSV = useCallback(async () => {
    try {
      const monthLabel = selectedDate
        ? dayjs(selectedDate).format("MMM-YYYY")
        : undefined;
      const [result] = await listAllLoansAction({
        ...(dateFilter && {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        }),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      exportLoansToCSV(result?.loans ?? [], monthLabel);
    } catch (err) {
      console.log("Export CSV failed:", err);
    }
  }, [selectedDate, dateFilter, debouncedSearch]);

  const exportExcel = useCallback(async () => {
    try {
      const monthLabel = selectedDate
        ? dayjs(selectedDate).format("MMM-YYYY")
        : undefined;
      const [result] = await listAllLoansAction({
        ...(dateFilter && {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        }),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      await exportLoansToExcel(result?.loans ?? [], monthLabel);
    } catch (err) {
      console.log("Export Excel failed:", err);
    }
  }, [selectedDate, dateFilter, debouncedSearch]);

  const handlePageChange = useCallback(
    (e: { page?: number; rows?: number }) => {
      setPage((e.page ?? 0) + 1);
      setLimit(e.rows ?? currentLimit);
    },
    [currentLimit]
  );

  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((field: SortableField | undefined) => {
    setSortBy(field ?? "createdAt");
  }, []);

  const handleSortOrderChange = useCallback(
    (order: "asc" | "desc" | undefined) => {
      setSortOrder(order ?? "desc");
    },
    []
  );

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

  const tableColumns = useMemo(
    () =>
      getLoansTableColumns(
        handleEdit,
        handleDelete,
        isLocked,
        canEdit,
        isPayrollPosted,
        role
      ),
    [handleEdit, handleDelete, isLocked, canEdit, role, isPayrollPosted]
  );

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";

        let parseResult;
        if (isCSV) {
          parseResult = await parseCSVFile(file);
        } else {
          parseResult = await parseExcelFile(file);
        }

        if (parseResult.errors.length > 0) {
          const errorSummary =
            parseResult.errors.length > 3
              ? parseResult.errors.slice(0, 3).join("; ") +
                ` and ${parseResult.errors.length - 3} more...`
              : parseResult.errors.join("; ");

          toastService.showWarn(
            "Parse Warnings",
            `Valid: ${parseResult.data.length}, Errors: ${parseResult.errors.length}. Reasons: ${errorSummary}`
          );
        }

        if (parseResult.data.length === 0) {
          toastService.showError("Error", "No valid data found in file");
          throw new Error("No valid data found in file");
        }

        await bulkUploadLoans(
          { loans: parseResult.data },
          {
            onSuccess: (result: BulkUploadLoanResult) => {
              const message =
                result.success > 0
                  ? `Successfully uploaded ${result.success} loan(s)`
                  : "Upload completed";

              if (result.failed > 0) {
                const errorSummary =
                  result.errors.length > 3
                    ? result.errors.slice(0, 3).join("; ") +
                      ` and ${result.errors.length - 3} more...`
                    : result.errors
                        ?.map((error: any) => error?.error ?? "")
                        .join("; ");

                toastService.showWarn(
                  "Upload Complete",
                  `Done: ${result.success}, Errors: ${result.failed}. Reasons: ${errorSummary}`
                );
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
              throw error;
            },
          }
        );
      } catch (error: any) {
        const errorMessage = getErrorMessage(error, "Failed to parse file");
        toastService.showError("Error", errorMessage);
        throw error;
      }
    },
    [bulkUploadLoans]
  );

  const renderFilters = useCallback(
    () => (
      <LoansFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        exportCSV={exportCSV}
        exportExcel={exportExcel}
        canAdd={canAdd}
        uploadCSV={() => setShowFilePicker(true)}
        uploadExcel={() => setShowFilePicker(true)}
        downloadTemplate={downloadSampleTemplate}
      />
    ),
    [selectedDate, searchValue, exportCSV, exportExcel, canAdd]
  );

  return (
    <>
      <div className="flex h-full flex-col gap-6 px-6 py-6">
        <LoansHeader
          canAdd={canAdd}
          onAddLoan={() => router.push("/loans/new")}
        />
        <LoansTable
          tableRef={tableRef}
          loans={loans}
          isLoading={isLoading}
          renderHeader={renderFilters}
          tableColumns={tableColumns}
          handlePageChange={handlePageChange}
          sortHandler={sortHandler}
          sortBy={sortBy}
          sortOrder={sortOrder}
          currentLimit={currentLimit}
          currentPage={currentPage}
          total={total}
        />
      </div>

      <BulkUploadDialog
        visible={showFilePicker}
        title="Upload Loans"
        onHide={() => setShowFilePicker(false)}
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
