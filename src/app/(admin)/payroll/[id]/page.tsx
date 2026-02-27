"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Input,
  Table,
  Badge,
  Button,
  Dropdown,
  TableRef,
  TitleHeader,
  TableColumn,
  NumberInput,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import {
  useRepostPayroll,
  useGetPayrollDate,
  useGetPayrollDetails,
  useSavePayrollDetailsBatch,
  useRefreshPayrollDetailRow,
} from "@/lib/db/services/payroll-summary";
import {
  formatNum,
  formatPayrollPeriod,
  parseGroupDropdownFilter,
} from "@/utils/helpers";
import { useDebounce, useSavePayrollRow } from "@/hooks";
import { toastService } from "@/lib/toast";
import { queryClient } from "@/lib/react-query";
import { useGlobalData } from "@/context/GlobalDataContext";
import GroupDropdown from "@/components/common/group-dropdown";

const tableCommonProps = {
  sortable: false,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 120 },
  headerClassName: "text-sm! font-semibold",
};

// --- Module-level helpers ---
const calculateNetSalaryPayable = (entry: PayrollDetailEntry) =>
  entry.totalSalary - entry.loanDeduction - entry.challanDeduction;

const calculateNetLoan = (entry: PayrollDetailEntry) =>
  (entry?.previousAdvance ?? 0) +
  (entry.currentAdvance ?? 0) -
  (entry.loanDeduction ?? 0);

const calculateNetTrafficChallan = (entry: PayrollDetailEntry) =>
  (entry?.previousChallan ?? 0) +
  (entry.currentChallan ?? 0) -
  (entry.challanDeduction ?? 0);

const ActionButtons = ({
  rowData,
  onRefreshComplete,
  isSavingAll,
}: {
  rowData: PayrollDetailEntry;
  onRefreshComplete: (updated: PayrollDetailEntry) => void;
  isSavingAll: boolean;
}) => {
  const { saveRow, isSaving } = useSavePayrollRow();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { mutateAsync: refreshDetailRow } = useRefreshPayrollDetailRow();

  const isLocked = rowData.isLocked || rowData.payrollSummaryStatusId === 3;

  const handleRefreshRow = async () => {
    try {
      setIsRefreshing(true);
      const result = await refreshDetailRow({ payrollDetailId: rowData.id });
      if (result?.updatedEntry) {
        onRefreshComplete(result.updatedEntry);
      }
      toastService.showSuccess(
        "Refreshed",
        `Row refreshed successfully for ${rowData.empCode} - ${rowData.name}`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to refresh payroll details"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <Button
        rounded
        size="small"
        variant="text"
        {...(isSaving ? { loading: true } : { icon: "pi pi-save text-lg!" })}
        tooltipOptions={{ position: "top" }}
        onClick={() => saveRow(rowData)}
        disabled={isLocked || isSaving || isRefreshing || isSavingAll}
        className="w-8 h-8!"
        tooltip="Save Row"
      />
      <Button
        rounded
        size="small"
        variant="text"
        tooltipOptions={{ position: "top" }}
        {...(isRefreshing
          ? { loading: true }
          : { icon: "pi pi-refresh text-lg!" })}
        onClick={handleRefreshRow}
        disabled={isLocked || isSaving || isRefreshing || isSavingAll}
        className="w-8 h-8!"
        tooltip="Refresh"
      />
    </div>
  );
};

const PayrollDetailPage = () => {
  const router = useRouter();
  const tableRef = useRef<TableRef>(null);
  const { id: periodParam } = useParams();
  const payrollId = Number(periodParam);

  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    null
  );
  const [payrollData, setPayrollData] = useState<PayrollDetailEntry[]>([]); // Start empty
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  // Parse filter parameters from GroupDropdown selection
  const filterParams = parseGroupDropdownFilter(selectedFilter);
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [selectedFilter, debouncedSearch]);

  const { data: globalData } = useGlobalData();

  useEffect(() => {
    if (selectedFilter !== null) return;
    // Auto-select "Forman Construction" payroll section on first load
    const formanSection = globalData.payrollSections?.find((s) =>
      s.nameEn?.toLowerCase().includes("forman")
    );
    if (formanSection) {
      setSelectedFilter(`payroll-${formanSection.id}`);
    }
  }, [globalData.payrollSections]);

  const statusOptions = globalData.payrollStatuses.map((s) => ({
    label: s.nameEn,
    value: s.id,
  }));

  // Payment Method options
  const paymentMethodOptions = globalData.paymentMethods.map((p) => ({
    label: p.nameEn,
    value: p.id.toString(),
  }));

  const { data, isLoading } = useGetPayrollDetails({
    payrollId: isNaN(payrollId) ? 0 : payrollId,
    search: debouncedSearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    page,
    limit,
  });

  const total = data?.total ?? 0;

  // Map backend data to table format
  useEffect(() => {
    if (data?.details) {
      setPayrollData(data.details);
    }
  }, [data]);

  const { mutateAsync: savePayrollDetails } = useSavePayrollDetailsBatch();
  const { saveRow: saveRowOnEnter } = useSavePayrollRow();
  const { mutateAsync: repostPayroll } = useRepostPayroll();
  const [isSavingRow, setIsSavingRow] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);

  const handleRowRefreshComplete = (updated: PayrollDetailEntry) => {
    setPayrollData((prev) =>
      prev.map((entry) => (entry.id === updated.id ? updated : entry))
    );
  };

  const handleSave = async () => {
    setIsSavingAll(true);
    try {
      const entries = payrollData.map((row) => ({
        id: row.id,
        loanDeduction: row.loanDeduction,
        challanDeduction: row.challanDeduction,
        netSalaryPayable: calculateNetSalaryPayable(row),
        netLoan: calculateNetLoan(row),
        netChallan: calculateNetTrafficChallan(row),
        cardSalary: row.cardSalary,
        cashSalary: row.cashSalary,
        remarks: row.remarks,
        paymentMethodId: row.paymentMethodId,
        payrollStatusId: row.payrollStatusId,
      }));

      const result = await savePayrollDetails(
        { entries },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
            queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
          },
        }
      );
      toastService.showSuccess(
        "Saved",
        `${result.saved} payroll entr${result.saved === 1 ? "y" : "ies"} saved successfully`
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to save payroll details"
      );
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      setIsRefreshingAll(true);
      await repostPayroll({ id: payrollId });
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
      toastService.showSuccess(
        "Refreshed",
        "Payroll recalculated successfully for all employees"
      );
    } catch (error: any) {
      toastService.showError(
        "Error",
        error.message || "Failed to refresh payroll"
      );
    } finally {
      setIsRefreshingAll(false);
    }
  };

  const updatePayrollEntry = (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => {
    setPayrollEntry(id, field, value);
  };

  /**
   * When the user edits cardSalary or cashSalary, keep the pair
   * summing to netSalaryPayable. If the typed value exceeds net,
   * cap it and zero the other field.
   */
  const updateSalaryPair = (
    id: number,
    changed: "cardSalary" | "cashSalary",
    rawValue: number
  ) => {
    setPayrollData((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const net = calculateNetSalaryPayable(entry);
        const capped = Math.min(rawValue, net);
        const other = net - capped;
        return changed === "cardSalary"
          ? { ...entry, cardSalary: capped, cashSalary: other }
          : { ...entry, cashSalary: capped, cardSalary: other };
      })
    );
  };

  const setPayrollEntry = (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => {
    setPayrollData((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return { ...entry, [field]: value };
        }
        return entry;
      })
    );
  };

  const scrollToTop = () => {
    // PrimeReact DataTable scrollable body class
    const scrollableBody = document.querySelector(".p-datatable-wrapper");
    if (scrollableBody) {
      scrollableBody.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Scroll to top when filter changes
  useEffect(() => {
    scrollToTop();
  }, [selectedFilter]);

  const onPage = (event: any) => {
    setPage(event.page + 1);
    setLimit(event.rows);
    scrollToTop();
  };

  const handleSaveSingleRowOnEnter = (payrollId: number) => {
    setTimeout(async () => {
      if (!payrollId) return;
      const rowData = payrollData.find((r) => r.id === payrollId);
      if (!rowData) return;
      setIsSavingRow(true);
      await saveRowOnEnter(rowData);
      setIsSavingRow(false);
    }, 100);
  };

  const columns = useMemo(
    (): TableColumn<PayrollDetailEntry>[] => [
      {
        field: "empCode",
        header: "Emp. Code",
        ...tableCommonProps,
        style: { minWidth: 120, zIndex: 1 },
        headerStyle: { zIndex: 10 },
        frozen: true,
        body: (rowData: PayrollDetailEntry) => (
          <span className="text-sm font-semibold!">{rowData.empCode}</span>
        ),
      },
      {
        field: "name",
        header: "Name",
        ...tableCommonProps,
        style: { minWidth: 300, zIndex: 1 },
        headerStyle: { zIndex: 10 },
        frozen: true,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex items-start gap-2 min-w-0">
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <span className="text-sm font-medium leading-tight wrap-break-word">
                {rowData.name}
              </span>
            </div>
            {(rowData.isFixed ||
              rowData.isDeductable ||
              rowData.isCardDelivered) && (
              <div className="flex items-center justify-center gap-x-1 shrink-0">
                {rowData.isCardDelivered && <Badge text="C" />}
                {rowData.isFixed && <Badge text="F" />}
              </div>
            )}
          </div>
        ),
      },
      {
        field: "designation",
        header: "Designation",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-sm text-center font-medium!">
              {rowData.designation}
            </span>
          </div>
        ),
      },
      {
        field: "idNumber",
        header: "ID Number",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData: PayrollDetailEntry) => (
          <span className="text-sm font-medium!">{rowData.idNumber}</span>
        ),
      },
      {
        field: "workDays",
        header: "Work Days",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {rowData.workDays.toString()}
            </span>
          </div>
        ),
      },
      {
        field: "overTime",
        header: "Over Time",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.overTime).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "totalHours",
        header: "Total Hours",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.totalHours).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "hourlyRate",
        header: "Hourly Rate",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.hourlyRate).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "breakfastAllowance",
        header: "Brkfst. Allow.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.breakfastAllowance).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "otherAllowances",
        header: "Other Allow.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.otherAllowances).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "totalAllowances",
        header: "Total Allow.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(
                (rowData.breakfastAllowance ?? 0) +
                  (rowData.otherAllowances ?? 0)
              )}
            </span>
          </div>
        ),
      },
      {
        field: "totalSalary",
        header: "Total Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.totalSalary, 0).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "previousAdvance",
        header: "Prev. Adv.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.previousAdvance).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "currentAdvance",
        header: "Curr. Adv.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.currentAdvance).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "loanDeduction",
        header: "Loan Ded.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.loanDeduction}
              onValueChange={(e) =>
                updatePayrollEntry(rowData.id, "loanDeduction", e.value || 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveSingleRowOnEnter(rowData.id);
                }
              }}
            />
          </div>
        ),
      },
      {
        field: "netLoan",
        header: "Net Loan",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetLoan(rowData)).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "previousChallan",
        header: "Prev. Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.previousChallan).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "currentChallan",
        header: "Curr. Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold!">
              {formatNum(rowData.currentChallan).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "challanDeduction",
        header: "Traff. Ded.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.challanDeduction}
              onValueChange={(e) =>
                updatePayrollEntry(rowData.id, "challanDeduction", e.value || 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveSingleRowOnEnter(rowData.id);
                }
              }}
            />
          </div>
        ),
      },
      {
        field: "netChallan",
        header: "Net Traff.",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetTrafficChallan(rowData)).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "netSalaryPayable",
        header: "Net Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <span className="text-[15px] font-semibold! text-primary!">
              {formatNum(calculateNetSalaryPayable(rowData), 0).toString()}
            </span>
          </div>
        ),
      },
      {
        field: "cardSalary",
        header: "Card Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.cardSalary}
              onValueChange={(e) =>
                updateSalaryPair(rowData.id, "cardSalary", e.value ?? 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "cashSalary",
        header: "Cash Salary",
        ...tableCommonProps,
        body: (rowData: PayrollDetailEntry) => (
          <div className="flex justify-center">
            <NumberInput
              useGrouping={false}
              disabled={rowData.payrollSummaryStatusId === 3}
              value={rowData.cashSalary}
              onValueChange={(e) =>
                updateSalaryPair(rowData.id, "cashSalary", e.value ?? 0)
              }
              className="timesheet-number-input payroll-input"
              min={0}
              showButtons={false}
            />
          </div>
        ),
      },
      {
        field: "remarks",
        header: "Remarks",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (rowData: PayrollDetailEntry) => (
          <Input
            small
            disabled={rowData.payrollSummaryStatusId === 3}
            placeholder="Add remarks"
            value={rowData.remarks}
            onChange={(e) =>
              updatePayrollEntry(rowData.id, "remarks", e.target.value)
            }
            className="w-full h-10! payroll-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveSingleRowOnEnter(rowData.id);
              }
            }}
          />
        ),
      },
      {
        field: "paymentMethodId",
        header: "Salary Method",
        ...tableCommonProps,
        style: { minWidth: 200, width: 200 },
        body: (rowData: PayrollDetailEntry) => (
          <Dropdown
            small
            filter
            options={paymentMethodOptions}
            disabled={rowData.payrollSummaryStatusId === 3}
            className="w-[200px]! h-10!"
            placeholder="Choose Method"
            value={rowData.paymentMethodId?.toString()}
            onChange={(e) =>
              updatePayrollEntry(
                rowData.id,
                "paymentMethodId",
                e.value ? Number(e.value) : null
              )
            }
          />
        ),
      },
      {
        field: "payrollStatusId",
        header: "Status",
        ...tableCommonProps,
        style: { minWidth: 150, width: 150 },
        body: (rowData: PayrollDetailEntry) => (
          <Dropdown
            small
            options={statusOptions.slice(0, 2)}
            disabled={rowData.payrollSummaryStatusId === 3}
            className="w-[150px]! h-10!"
            placeholder="Pending"
            value={rowData.payrollStatusId}
            onChange={(e) =>
              updatePayrollEntry(rowData.id, "payrollStatusId", e.value)
            }
          />
        ),
      },
      {
        field: "id",
        header: "Actions",
        ...tableCommonProps,
        sortable: false,
        filterable: false,
        style: { minWidth: 80, width: 80, textAlign: "center" },
        body: (rowData: PayrollDetailEntry) => (
          <ActionButtons
            rowData={rowData}
            isSavingAll={isSavingAll}
            onRefreshComplete={handleRowRefreshComplete}
          />
        ),
      },
    ],
    // Rebuilt only when data that drives disabled/options states changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      payrollData,
      isSavingAll,
      isSavingRow,
      isLoading,
      statusOptions,
      paymentMethodOptions,
    ]
  );

  const renderHeader = ({ exportCSV, exportExcel }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col lg:flex-row justify-between bg-theme-primary-light items-center gap-3 flex-1 w-full">
        <div className="flex flex-1 items-center gap-3 w-full">
          <div className="w-full lg:w-auto">
            <GroupDropdown
              hideAllOption
              value={selectedFilter}
              onChange={setSelectedFilter}
              className="w-full lg:w-64 h-10.5!"
            />
          </div>
          <div className="w-full lg:w-auto hidden lg:block">
            <Button
              size="small"
              className="w-full xl:w-32 2xl:w-36 h-10!"
              label="Refresh"
              {...(isRefreshingAll
                ? { loading: true }
                : { icon: "pi pi-refresh" })}
              disabled={isLoading || isSavingAll || isRefreshingAll}
              onClick={handleRefreshAll}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="block lg:hidden w-full lg:w-auto">
            <Button
              size="small"
              className="w-full lg:w-auto h-10!"
              label="Refresh"
              {...(isRefreshingAll
                ? { loading: true }
                : { icon: "pi pi-refresh" })}
              disabled={isLoading || isSavingAll || isRefreshingAll}
              onClick={handleRefreshAll}
            />
          </div>
          <div className="w-full lg:w-auto">
            <ExportOptions
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
              buttonClassName="w-full lg:w-auto h-9!"
            />
          </div>
          <div className="w-full lg:w-auto">
            <Button
              size="small"
              label="Save"
              onClick={handleSave}
              loading={isSavingAll}
              disabled={isLoading || isSavingAll || isRefreshingAll}
              className="w-full bg-primary-light! text-primary! border-primary-light! lg:w-28 h-10!"
            />
          </div>
        </div>
      </div>
    );
  };

  const exportCSV = () => {
    tableRef.current?.exportCSV();
  };

  const exportExcel = () => {
    tableRef.current?.exportExcel();
  };

  // Fetch payroll date info
  const { data: dateData } = useGetPayrollDate({
    id: isNaN(payrollId) ? 0 : payrollId,
  });

  const payrollTitle = dateData
    ? `PAYROLL DETAILS OF ${formatPayrollPeriod(
        dateData.payrollMonth,
        dateData.payrollYear
      )}`
    : `PAYROLL DETAILS #${periodParam}`;

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        title={payrollTitle}
        icon={<i className="fa-light fa-calendar text-xl!" />}
        value={searchValue}
        onChange={(e) => {
          const value = e.target.value;
          setSearchValue(value);
        }}
        onBack={() => router.replace("/payroll")}
      />
      <div className="flex flex-1 flex-col gap-4 px-6 py-6 bg-theme-primary-light">
        {renderHeader({
          exportCSV,
          exportExcel,
        })}
        <div className="bg-white h-full rounded-xl overflow-hidden">
          <Table
            lazy
            ref={tableRef}
            dataKey="id"
            extraSmall
            data={payrollData}
            columns={columns}
            pagination={true}
            rowsPerPageOptions={[50, 100]}
            rows={limit}
            totalRecords={total}
            first={(page - 1) * limit}
            globalSearch={false}
            emptyMessage={
              !filterParams.designationId && !filterParams.payrollSectionId
                ? "No Payroll Section or Designation is Selected"
                : "No Payroll Data Found"
            }
            scrollable
            scrollHeight="65vh"
            stripedRows
            loading={isLoading || isRefreshingAll || isSavingAll || isSavingRow}
            onPage={onPage}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailPage;
