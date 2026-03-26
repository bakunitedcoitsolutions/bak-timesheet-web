"use client";

import { useRef, useState, useEffect } from "react";
import { FilterMatchMode } from "primereact/api";
import { useParams, useRouter } from "next/navigation";
import { DataTableFilterMeta } from "primereact/datatable";

import {
  useRepostPayroll,
  useGetPayrollDate,
  useGetPayrollDetails,
  useSavePayrollDetailsBatch,
} from "@/lib/db/services/payroll-summary";
import { toastService } from "@/lib/toast";
import { useSavePayrollRow } from "@/hooks";
import { queryClient } from "@/lib/react-query";
import { useGlobalData } from "@/context/GlobalDataContext";
import { Input, Table, TableRef, TitleHeader } from "@/components";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { formatPayrollPeriod, parseGroupDropdownFilter } from "@/utils/helpers";

// Extracted components and utilities
import {
  calculateNetLoan,
  calculateNetSalaryPayable,
  calculateNetTrafficChallan,
} from "./utils";
import { PayrollHeader } from "./components/PayrollHeader";
import { usePayrollTableColumns } from "./components/PayrollTableColumns";

const PayrollDetailPage = () => {
  const router = useRouter();
  const tableRef = useRef<TableRef>(null);
  const { id: periodParam } = useParams();
  const payrollId = Number(periodParam);

  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    null
  );
  const [payrollData, setPayrollData] = useState<PayrollDetailEntry[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [tableFilters, setTableFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    empCode: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    idNumber: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    designation: { value: null, matchMode: FilterMatchMode.EQUALS },
    remarks: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const filterParams = parseGroupDropdownFilter(selectedFilter);

  useEffect(() => {
    setPage(1);
  }, [selectedFilter, activeSearch, tableFilters]);

  const { data: globalData } = useGlobalData();

  useEffect(() => {
    if (selectedFilter !== null) return;
    const formanSection = globalData.payrollSections?.find((s) =>
      s.nameEn?.toLowerCase().includes("forman")
    );
    if (formanSection) {
      setSelectedFilter(`payroll-${formanSection.id}`);
    }
  }, [globalData.payrollSections, selectedFilter]);

  const statusOptions = globalData.payrollStatuses.map((s) => ({
    label: s.nameEn || "Unknown",
    value: s.id,
  }));

  const paymentMethodOptions = globalData.paymentMethods.map((p) => ({
    label: p.nameEn || "Unknown",
    value: p.id.toString(),
  }));

  // Map individual column filters to search if multiple are present
  const getSearchValue = () => {
    if (activeSearch) return activeSearch;
    // Simple priority for column-level text filters
    const nameFilter = (tableFilters.name as any)?.value;
    const codeFilter = (tableFilters.empCode as any)?.value;
    const idFilter = (tableFilters.idNumber as any)?.value;
    const remarksFilter = (tableFilters.remarks as any)?.value;
    return nameFilter || codeFilter || idFilter || remarksFilter || undefined;
  };

  const { data, isLoading } = useGetPayrollDetails({
    payrollId: isNaN(payrollId) ? 0 : payrollId,
    search: getSearchValue(),
    designationId:
      (tableFilters.designation as any)?.value || filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    page,
    limit,
  });

  const total = data?.total ?? 0;

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

      const result = await savePayrollDetails({ entries });
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
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
      await repostPayroll({
        id: payrollId,
        designationId: filterParams.designationId ?? null,
        payrollSectionId: filterParams.payrollSectionId ?? null,
      });
      queryClient.invalidateQueries({ queryKey: ["payroll-details"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-summaries"] });
      toastService.showSuccess(
        "Refreshed",
        filterParams.designationId || filterParams.payrollSectionId
          ? "Payroll refreshed successfully for selected section/designation"
          : "Payroll refreshed successfully for all employees"
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

  const onFilter = (filters: DataTableFilterMeta) => {
    setTableFilters(filters);
  };

  const updatePayrollEntry = (
    id: number,
    field: keyof PayrollDetailEntry,
    value: any
  ) => {
    setPayrollData((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

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

  const scrollToTop = () => {
    const scrollableBody = document.querySelector(".p-datatable-wrapper");
    if (scrollableBody) scrollableBody.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    scrollToTop();
  }, [selectedFilter]);

  const onPage = (event: any) => {
    setPage(event.page + 1);
    setLimit(event.rows);
    scrollToTop();
  };

  const handleSaveSingleRowOnEnter = (
    payrollId: number,
    fieldName?: keyof PayrollDetailEntry,
    value?: any
  ) => {
    setTimeout(async () => {
      if (!payrollId) return;
      const row = payrollData.find((r) => r.id === payrollId);
      if (!row) return;

      const updatedRow = fieldName ? { ...row, [fieldName]: value } : row;
      const payloadToSave = {
        id: updatedRow.id,
        loanDeduction: updatedRow.loanDeduction,
        challanDeduction: updatedRow.challanDeduction,
        netSalaryPayable: calculateNetSalaryPayable(updatedRow),
        netLoan: calculateNetLoan(updatedRow),
        netChallan: calculateNetTrafficChallan(updatedRow),
        cardSalary: updatedRow.cardSalary,
        cashSalary: updatedRow.cashSalary,
        remarks: updatedRow.remarks,
        paymentMethodId: updatedRow.paymentMethodId,
        payrollStatusId: updatedRow.payrollStatusId,
      };

      setIsSavingRow(true);
      await saveRowOnEnter(payloadToSave as any);
      setIsSavingRow(false);
    }, 100);
  };

  const columns = usePayrollTableColumns({
    isLoading,
    payrollData,
    isSavingAll,
    isSavingRow,
    statusOptions,
    updateSalaryPair,
    updatePayrollEntry,
    paymentMethodOptions,
    handleRowRefreshComplete,
    handleSaveSingleRowOnEnter,
  });

  const { data: dateData } = useGetPayrollDate({
    id: isNaN(payrollId) ? 0 : payrollId,
  });

  const payrollTitle = dateData
    ? `PAYROLL DETAILS OF ${formatPayrollPeriod(dateData.payrollMonth, dateData.payrollYear)}`
    : `PAYROLL DETAILS #${periodParam}`;

  return (
    <div className="flex h-full flex-col">
      <TitleHeader
        title={payrollTitle}
        icon={<i className="fa-light fa-calendar text-xl!" />}
        onBack={() => router.replace("/payroll")}
        renderInput={() => (
          <div className="w-full md:w-80">
            <Input
              value={searchValue}
              className="w-full"
              icon="pi pi-search"
              iconPosition="left"
              placeholder="Search (Press Enter)"
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") setActiveSearch(searchValue);
              }}
            />
          </div>
        )}
      />
      <div className="flex flex-1 flex-col gap-4 px-6 py-6 bg-theme-primary-light">
        <PayrollHeader
          isLoading={isLoading}
          handleSave={handleSave}
          isSavingAll={isSavingAll}
          selectedFilter={selectedFilter}
          isRefreshingAll={isRefreshingAll}
          handleRefreshAll={handleRefreshAll}
          setSelectedFilter={setSelectedFilter}
        />
        <div className="bg-white h-full rounded-xl overflow-hidden">
          <Table
            lazy
            rowHover
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
            filters={tableFilters}
            emptyMessage={
              !filterParams.designationId && !filterParams.payrollSectionId
                ? "No Payroll Section or Designation is Selected"
                : "No Payroll Data Found"
            }
            scrollable
            stripedRows
            onPage={onPage}
            scrollHeight="65vh"
            onFilter={onFilter}
            loading={isLoading || isRefreshingAll || isSavingAll || isSavingRow}
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailPage;
