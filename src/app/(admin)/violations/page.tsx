"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import { TableRef, useAccess } from "@/components";
import { getErrorMessage, createSortHandler } from "@/utils/helpers";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useGetTrafficChallans,
  useDeleteTrafficChallan,
  useBulkUploadTrafficChallans,
} from "@/lib/db/services/traffic-challan/requests";
import {
  parseCSVFile,
  parseExcelFile,
  downloadSampleTemplate,
} from "@/lib/db/services/traffic-challan/bulk-upload-utils";
import { useGetPayrollSummaryStatus } from "@/lib/db/services/payroll-summary/requests";
import {
  ListedTrafficChallan,
  ListTrafficChallansSortableField,
} from "@/lib/db/services/traffic-challan/traffic-challan.dto";
import {
  listAllTrafficChallansAction,
} from "@/lib/db/services/traffic-challan/actions";
import {
  exportTrafficChallansToExcel,
  exportTrafficChallansToCSV,
} from "@/lib/db/services/traffic-challan/traffic-challan-export-utils";

// Sub-components and Helpers
import {
  SORTABLE_FIELDS,
  SortableField,
  createColumns,
  checkIsLocked,
} from "./helpers";
import dayjs from "@/lib/dayjs";
import { ViolationsHeader } from "./components/ViolationsHeader";
import { ViolationsFilters } from "./components/ViolationsFilters";
import { ViolationsTable } from "./components/ViolationsTable";
import { ViolationsDialogs } from "./components/ViolationsDialogs";

const ChallansPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM")
  );
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<
    SortableField | ListTrafficChallansSortableField
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilePicker, setShowFilePicker] = useState<boolean>(false);
  const tableRef = useRef<TableRef>(null);

  const { mutateAsync: deleteTrafficChallan } = useDeleteTrafficChallan();
  const { mutateAsync: bulkUploadTrafficChallans } =
    useBulkUploadTrafficChallans();

  const { can, role } = useAccess();
  const hasFull = can("trafficViolations", "full");
  const canEdit = can("trafficViolations", "edit");
  const canAdd = can("trafficViolations", "add");

  const { month: selectedMonth, year: selectedYear } = useMemo(() => {
    const d = dayjs(selectedDate || new Date());
    return { month: d.month() + 1, year: d.year() };
  }, [selectedDate]);

  const { data: payrollSummaryStatus } = useGetPayrollSummaryStatus({
    month: selectedMonth,
    year: selectedYear,
  });

  const isPayrollPosted = payrollSummaryStatus?.payrollStatusId === 3;

  const isLocked = useMemo(() => {
    return checkIsLocked(isPayrollPosted, role, hasFull, canEdit);
  }, [isPayrollPosted, role, hasFull, canEdit]);

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
        const date = dayjs(selectedDate, "YYYY-MM");
        return {
          startDate: date.startOf("month").toDate(),
          endDate: date.endOf("month").toDate(),
        };
      })()
    : undefined;

  const { data: challansResponse, isLoading } = useGetTrafficChallans({
    page,
    limit,
    sortBy: sortBy as ListTrafficChallansSortableField,
    sortOrder,
    search: debouncedSearch || undefined,
    ...(dateFilter && {
      startDate: dateFilter.startDate,
      endDate: dateFilter.endDate,
    }),
  });

  const challans = challansResponse?.trafficChallans ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = challansResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (challan: ListedTrafficChallan) => {
      router.push(`/violations/${challan.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (challan: ListedTrafficChallan) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Traffic Violation",
        message: `Are you sure you want to delete this traffic Violation record?`,
        onAccept: async () => {
          await deleteTrafficChallan(
            { id: challan.id },
            {
              onSuccess: () => {
                toastService.showInfo(
                  "Done",
                  "Traffic Violation deleted successfully"
                );
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete traffic Violation"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteTrafficChallan]
  );

  const exportCSV = useCallback(async () => {
    try {
      const monthLabel = selectedDate
        ? dayjs(selectedDate).format("MMM-YYYY")
        : undefined;
      const [result, error] = await listAllTrafficChallansAction({
        ...(dateFilter && {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        }),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });

      if (error) {
        toastService.showError("Error", "Failed to fetch violations for export");
        return;
      }

      exportTrafficChallansToCSV(result?.trafficChallans ?? [], monthLabel);
    } catch (err) {
      console.log("Export CSV failed:", err);
      toastService.showError("Error", "An unexpected error occurred during export");
    }
  }, [selectedDate, dateFilter, debouncedSearch]);

  const exportExcel = useCallback(async () => {
    try {
      const monthLabel = selectedDate
        ? dayjs(selectedDate).format("MMM-YYYY")
        : undefined;
      const [result, error] = await listAllTrafficChallansAction({
        ...(dateFilter && {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        }),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });

      if (error) {
        toastService.showError("Error", "Failed to fetch violations for export");
        return;
      }

      await exportTrafficChallansToExcel(result?.trafficChallans ?? [], monthLabel);
    } catch (err) {
      console.log("Export Excel failed:", err);
      toastService.showError("Error", "An unexpected error occurred during export");
    }
  }, [selectedDate, dateFilter, debouncedSearch]);

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

  const handleSortByChange = useCallback((field: SortableField | undefined) => {
    setSortBy(field ?? "createdAt");
  }, []);

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
    () => createColumns(handleEdit, handleDelete, isLocked, canEdit, role),
    [handleEdit, handleDelete, isLocked, canEdit, role]
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
          const errorSummary =
            parseResult.errors.length > 3
              ? parseResult.errors.slice(0, 3).join("; ") +
                ` and ${parseResult.errors.length - 3} more...`
              : parseResult.errors.join("; ");

          toastService.showWarn(
            "Parse Warnings",
            `Valid: ${parseResult.data.length}, Errors: ${parseResult.errors.length}. Reasons: ${errorSummary}`
          );
          console.log("Parse errors:", parseResult.errors);
        }

        if (parseResult.data.length === 0) {
          toastService.showError("Error", "No valid data found in file");
          throw new Error("No valid data found in file");
        }

        // Upload the data
        await bulkUploadTrafficChallans(
          { trafficChallans: parseResult.data },
          {
            onSuccess: (result) => {
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
                const message = `Successfully uploaded ${result.success} traffic violation(s)`;
                toastService.showSuccess("Success", message);
              }
            },
            onError: (error: any) => {
              const errorMessage = getErrorMessage(
                error,
                "Failed to upload traffic Violations"
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
    [bulkUploadTrafficChallans]
  );

  // Memoized header renderer
  const renderHeader = useCallback(() => {
    return (
      <ViolationsFilters
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onExportCSV={exportCSV}
        onExportExcel={exportExcel}
        canAdd={canAdd}
        onUploadCSV={handleUploadCSV}
        onUploadExcel={handleUploadExcel}
        onDownloadTemplate={downloadSampleTemplate}
      />
    );
  }, [
    searchValue,
    selectedDate,
    exportCSV,
    exportExcel,
    canAdd,
    handleUploadCSV,
    handleUploadExcel,
  ]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6 font-primary">
      <ViolationsHeader
        canAdd={canAdd}
        onAdd={() => router.push("/violations/new")}
      />

      <ViolationsTable
        tableRef={tableRef}
        challans={challans}
        isLoading={isLoading}
        columns={tableColumns}
        renderHeader={renderHeader}
        page={currentPage}
        limit={currentLimit}
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onSort={sortHandler}
      />

      <ViolationsDialogs
        showFilePicker={showFilePicker}
        onHide={() => setShowFilePicker(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default ChallansPage;
