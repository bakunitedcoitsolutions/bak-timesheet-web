"use client";
import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { Paginator } from "primereact/paginator";
import { InputNumberChangeEvent } from "primereact/inputnumber";

import {
  Table,
  Button,
  TableRef,
  MultiSelect,
  TableColumn,
  NumberInput,
  TitleHeader,
  GroupDropdown,
  ExportOptions,
} from "@/components";
import { Dropdown } from "@/components";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import {
  useGetEmployees,
  listEmployeesAction,
} from "@/lib/db/services/employee";
import { toastService } from "@/lib/toast";
import { ListedDesignation } from "@/lib/db/services/designation";
import { ListedEmployeeStatus } from "@/lib/db/services/employee-status";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { useGetDesignations } from "@/lib/db/services/designation/requests";
import {
  exportEmployeesCSV,
  exportEmployeesExcel,
  mapEmployeeToExportRow,
} from "@/utils/helpers/export-employees-report";
import { printGroupedTable, printTable } from "@/utils/helpers/print-utils";
import { useGetEmployeeStatuses } from "@/lib/db/services/employee-status/requests";

// Filter Component
const FilterSection = ({
  onSearch,
  selectedColumns,
  columnOptions,
  onColumnChange,
  zeroRate,
  onZeroRateChange,
}: {
  onSearch: (
    search: string,
    filter: string | number | null,
    statusId: number
  ) => void;
  selectedColumns: string[];
  columnOptions: { label: string; value: string }[];
  onColumnChange: (value: string[]) => void;
  zeroRate: boolean;
  onZeroRateChange: (value: boolean) => void;
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [statusId, setStatusId] = useState<number>(1); // Default to Active (1)

  const { data: statusesResponse } = useGetEmployeeStatuses({
    ...COMMON_QUERY_INPUT,
    sortBy: "nameEn",
  });
  const statuses: ListedEmployeeStatus[] =
    statusesResponse?.employeeStatuses ?? [];

  const statusOptions = useMemo(() => {
    return [
      { label: "All Statuses", value: 0 },
      ...statuses.map((s) => ({ label: s.nameEn, value: s.id })),
    ];
  }, [statuses]);

  const handleSearch = () => {
    onSearch(searchValue, selectedFilter, statusId);
  };

  return (
    <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
        <div className="w-full">
          <NumberInput
            small
            useGrouping={false}
            placeholder="Employee Codes"
            value={!!searchValue ? parseInt(searchValue) : undefined}
            onChange={(e: InputNumberChangeEvent) =>
              setSearchValue(e.value?.toString() || "")
            }
            className="w-full h-10!"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="w-full lg:col-span-2">
          <GroupDropdown
            placeholder="Select Section / Designation"
            className="w-full h-10.5!"
            value={selectedFilter}
            onChange={setSelectedFilter}
          />
        </div>
        <div className="w-full lg:col-span-1">
          <Dropdown
            value={statusId}
            options={statusOptions}
            className="w-full h-10!"
            placeholder="Select Status"
            onChange={(e) => setStatusId(e.value)}
          />
        </div>
        <div className="w-full lg:col-span-2">
          <MultiSelect
            small
            options={columnOptions}
            className="w-full h-10!"
            placeholder="Select Columns"
            selectedItem={selectedColumns}
            setSelectedItem={onColumnChange}
          />
        </div>
      </div>
      <div className="flex items-center gap-5 justify-between xl:justify-end">
        <div className="w-fit whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Checkbox
              inputId="zeroRate"
              checked={zeroRate}
              onChange={(e) => onZeroRateChange(e.checked ?? false)}
            />
            <label htmlFor="zeroRate" className="text-sm cursor-pointer">
              Zero Rate
            </label>
          </div>
        </div>
        <Button
          size="small"
          className="w-32 h-10!"
          label="Search"
          onClick={handleSearch}
        />
      </div>
    </div>
  );
};

const EmployeesReportPage = () => {
  const router = useRouter();
  const tableRef = useRef<TableRef>(null);

  // Query states
  const [querySearch, setQuerySearch] = useState<string>("");
  const [queryFilter, setQueryFilter] = useState<string | number | null>("all");
  const [queryStatusId, setQueryStatusId] = useState<number>(1); // Default to Active (1)
  const [selectedColumn, setSelectedColumn] = useState<string[]>(["employeeCode", "nameEn", "designationName", "phone"]);
  const [zeroRate, setZeroRate] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Pagination states
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(50);

  const filterParams = parseGroupDropdownFilter(queryFilter);
  const hasActiveFilter =
    !!querySearch ||
    !!filterParams.designationId ||
    !!filterParams.payrollSectionId ||
    filterParams.payrollSectionId === 0 ||
    (queryStatusId !== null && queryStatusId !== 1);

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees({
    page: Math.floor(first / rows) + 1,
    limit: rows,
    search: querySearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    statusId: queryStatusId === 0 ? undefined : queryStatusId,
    sortBy: !hasActiveFilter ? "payrollSectionId" : "employeeCode",
    sortOrder: "asc",
    zeroRate,
  });

  const { data: designationsResponse } = useGetDesignations(COMMON_QUERY_INPUT);
  const designations: ListedDesignation[] =
    designationsResponse?.designations ?? [];

  const { data: statusesResponse } = useGetEmployeeStatuses({
    ...COMMON_QUERY_INPUT,
    sortBy: "nameEn",
  });
  const statuses: ListedEmployeeStatus[] =
    statusesResponse?.employeeStatuses ?? [];

  // Create Maps for O(1) Access
  const designationMap = useMemo(
    () => new Map(designations.map((d) => [d.id, d])),
    [designations]
  );
  const statusMap = useMemo(
    () => new Map(statuses.map((s) => [s.id, s])),
    [statuses]
  );

  // Fetch all employees for export
  const fetchAllEmployees = async () => {
    setIsExporting(true);
    try {
      const [response, error] = await listEmployeesAction({
        limit: 9999, // Fetch all
        search: querySearch || undefined,
        designationId: filterParams.designationId,
        payrollSectionId: filterParams.payrollSectionId,
        statusId: queryStatusId === 0 ? undefined : queryStatusId,
        sortBy: "employeeCode", // Default sort for export
        sortOrder: "asc",
        zeroRate,
      });

      if (error || !response?.employees) {
        toastService.showError(
          "Error",
          error?.message || "Failed to fetch data"
        );
        return [];
      }

      if (response.employees.length === 0) {
        toastService.showWarn(
          "Warning",
          "No data found for the current filters"
        );
        return [];
      }

      return response.employees.map((emp: ListedEmployee, index: number) =>
        mapEmployeeToExportRow(emp, index)
      );
    } catch (err: any) {
      toastService.showError(
        "Error",
        err.message || "An unexpected error occurred"
      );
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  // Construct employees list with mapped data
  const employees: any[] = useMemo(() => {
    if (!employeesResponse?.employees) return [];

    const groupCounters: Record<number | string, number> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let data = employeesResponse.employees.map((emp: ListedEmployee) => {
      const designation = emp.designation;
      const status = emp.status;

      const sectionId = emp.payrollSectionId ?? "unassigned";
      groupCounters[sectionId] = (groupCounters[sectionId] || 0) + 1;

      // Calculate total allowance
      const totalAllowance =
        (Number(emp.foodAllowance) || 0) +
        (Number(emp.mobileAllowance) || 0) +
        (Number(emp.otherAllowance) || 0);

      // Calculate contract remaining days
      let contractRemainingDays: number | null = null;
      if (emp.contractStartDate && emp.contractEndDate) {
        const endDate = new Date(emp.contractEndDate);
        endDate.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        contractRemainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...emp,
        designationName: designation?.nameEn,
        sectionName: emp.payrollSection?.nameEn || "Unassigned",
        statusName: status?.nameEn,
        countryName: emp.country?.nameEn || "-",
        cityName: emp.city?.nameEn || "-",
        branchName: emp.branch?.nameEn || "-",
        gosiCityName: emp.gosiCity?.nameEn || "-",
        nationalityName: emp.nationality?.nameEn || "-",
        totalAllowance,
        contractRemainingDays,
        groupSerial: groupCounters[sectionId],
      };
    });

    return data;
  }, [employeesResponse?.employees]);

  // Handle Search
  const handleSearch = (
    search: string,
    filter: string | number | null,
    statusId: number
  ) => {
    setQuerySearch(search);
    setQueryFilter(filter);
    setQueryStatusId(statusId);
    setFirst(0); // Reset pagination on search
  };

  const tableCommonProps = {
    sortable: false, // Lazy pagination doesn't support easy client-side sorting with grouping
    filterable: false,
  };

  // Document view button template
  const documentBodyTemplate = (rowData: any, field: string) => {
    const url = rowData[field];
    if (!url) return <span className="text-sm text-gray-400">-</span>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary text-sm hover:underline break-all line-clamp-2"
      >
        View
      </a>
    );
  };

  // Define all available columns
  const allColumns = useMemo(
    (): TableColumn<any>[] => [
      // Frozen Columns
      {
        field: "id",
        header: "#",
        ...tableCommonProps,
        frozen: true,
        align: "center",
        style: { minWidth: 50, width: 50 },
        body: (rowData, options) => (
          <span className="text-sm">
            {!hasActiveFilter
              ? rowData.groupSerial
              : (options?.rowIndex ?? 0) + 1}
          </span>
        ),
      },
      {
        field: "employeeCode",
        header: "Code",
        ...tableCommonProps,
        frozen: true,
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.employeeCode}</span>
        ),
      },
      {
        field: "nameEn",
        header: "Name",
        ...tableCommonProps,
        frozen: true,
        style: { minWidth: 250 },
        body: (rowData) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{rowData.nameEn}</span>
            <span className="text-sm text-gray-600">{rowData.nameAr}</span>
          </div>
        ),
      },
      // Regular Columns
      {
        field: "dob",
        header: "Birth Date",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.dob ? new Date(rowData.dob).toLocaleDateString() : "-"}
          </span>
        ),
      },
      {
        field: "phone",
        header: "Mobile No.",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">{rowData.phone || "-"}</span>
        ),
      },
      // Contract Details
      {
        field: "gender",
        header: "Gender",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm capitalize">{rowData.gender || "-"}</span>
        ),
      },
      {
        field: "countryName",
        header: "Country",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.countryName}</span>
        ),
      },
      {
        field: "cityName",
        header: "City",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => <span className="text-sm">{rowData.cityName}</span>,
      },
      {
        field: "statusName",
        header: "Status",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.statusName}</span>
        ),
      },
      {
        field: "branchName",
        header: "Branch",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.branchName}</span>
        ),
      },
      {
        field: "designationName",
        header: "Designation",
        ...tableCommonProps,
        style: { minWidth: 180 },
        body: (rowData) => (
          <span className="text-sm">{rowData.designationName}</span>
        ),
      },
      {
        field: "sectionName",
        header: "Payroll Section",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.sectionName}</span>
        ),
      },
      {
        field: "isFixed",
        header: "Is Fixed?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isFixed ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "isDeductable",
        header: "Is Deductable?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isDeductable ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "workingDays",
        header: "Working Days",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.workingDays || "-"}</span>
        ),
      },
      {
        field: "salary",
        header: "Salary",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.salary ? Number(rowData.salary).toLocaleString() : "-"}
          </span>
        ),
      },
      {
        field: "hourlyRate",
        header: "Hourly Rate",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.hourlyRate ? Number(rowData.hourlyRate).toFixed(2) : "-"}
          </span>
        ),
      },
      {
        field: "breakfastAllowance",
        header: "Breakfast All.",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.breakfastAllowance ? "Yes" : "No"}
          </span>
        ),
      },
      {
        field: "foodAllowance",
        header: "Food Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.foodAllowance
              ? Number(rowData.foodAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "mobileAllowance",
        header: "Mobile Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.mobileAllowance
              ? Number(rowData.mobileAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "otherAllowance",
        header: "Other Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.otherAllowance
              ? Number(rowData.otherAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "contractStartDate",
        header: "Contract Start",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.contractStartDate
              ? new Date(rowData.contractStartDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "contractEndDate",
        header: "Contract End",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.contractEndDate
              ? new Date(rowData.contractEndDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "contractRemainingDays",
        header: "Contract Rem. Days",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 150 },
        body: (rowData) => {
          const days = rowData.contractRemainingDays;
          if (days === null)
            return <span className="text-sm text-gray-400">-</span>;
          const isExpired = days < 0;
          return (
            <span
              className={`text-sm font-semibold ${isExpired ? "text-red-600" : "text-green-600"}`}
            >
              {days} days {isExpired ? "(Exp)" : ""}
            </span>
          );
        },
      },
      {
        field: "joiningDate",
        header: "Joining Date",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.joiningDate
              ? new Date(rowData.joiningDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "contractEndReason",
        header: "End Reason",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (rowData) => (
          <span className="text-sm line-clamp-2">
            {rowData.contractEndReason || "-"}
          </span>
        ),
      },
      {
        field: "contractDocument",
        header: "Contract Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "contractDocument"),
      },
      // Identity
      {
        field: "idCardNo",
        header: "ID Card No.",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.idCardNo || "-"}</span>
        ),
      },
      {
        field: "idCardExpiryDate",
        header: "ID Card Expiry",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.idCardExpiryDate
              ? new Date(rowData.idCardExpiryDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "profession",
        header: "Profession",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.profession || "-"}</span>
        ),
      },
      {
        field: "idCardDocument",
        header: "ID Card Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "idCardDocument"),
      },
      // Passport
      {
        field: "nationalityName",
        header: "Nationality",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.nationalityName}</span>
        ),
      },
      {
        field: "passportNo",
        header: "Passport No.",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">{rowData.passportNo || "-"}</span>
        ),
      },
      {
        field: "passportExpiryDate",
        header: "Passport Expiry",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.passportExpiryDate
              ? new Date(rowData.passportExpiryDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "passportDocument",
        header: "Passport Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "passportDocument"),
      },
      // Bank Details
      {
        field: "bankName",
        header: "Bank Name",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.bankName || "-"}</span>
        ),
      },
      {
        field: "bankCode",
        header: "Bank Code",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.bankCode || "-"}</span>
        ),
      },
      // GOSI Details
      {
        field: "gosiSalary",
        header: "GOSI Salary",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.gosiSalary
              ? Number(rowData.gosiSalary).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "gosiCityName",
        header: "GOSI City",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.gosiCityName}</span>
        ),
      },
      // Bank Card Details
      {
        field: "isCardDelivered",
        header: "Card Delivered?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.isCardDelivered ? "Yes" : "No"}
          </span>
        ),
      },
      {
        field: "cardDocument",
        header: "Card Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "cardDocument"),
      },
    ],
    []
  );

  // Generate column options for MultiSelect
  const columnOptions = useMemo(
    () =>
      allColumns
        .filter((col) => col.field !== "id")
        .map((col) => ({
          label: (col.header as string) || String(col.field),
          value: col.field as string,
        })),
    [allColumns]
  );

  // Get columns for display
  const columns = useMemo(() => allColumns, [allColumns]);

  // Print handler
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const [response, error] = await listEmployeesAction({
        limit: 9999, // Fetch all for print
        search: querySearch || undefined,
        designationId: filterParams.designationId,
        payrollSectionId: filterParams.payrollSectionId,
        statusId: queryStatusId === 0 ? undefined : queryStatusId,
        sortBy: "employeeCode",
        sortOrder: "asc",
        zeroRate,
      });

      if (error || !response?.employees) {
        toastService.showError(
          "Error",
          error?.message || "Failed to fetch data for printing"
        );
        return;
      }

      const allData = response.employees.map((emp: ListedEmployee, index: number) =>
        mapEmployeeToExportRow(emp, index)
      );

      const columnsToPrint = allColumns.filter((col) => {
        if (col.field === "id") return true;
        if (selectedColumn.length === 0) return true;
        return selectedColumn.includes(col.field as string);
      });

      const printTitle = zeroRate
        ? "EMPLOYEES REPORT (ZERO RATE)"
        : "EMPLOYEES REPORT";

      const commonPrintProps = {
        data: allData,
        columns: columnsToPrint.map((col) => ({
          field: col.field,
          header: (col.header as string) || "",
          align: (col.align || "left") as "left" | "center" | "right",
          style: col.style,
          body: col.body,
        })),
        printTitle: printTitle,
        // Using printTitle only in main title area to avoid clutter
      };

      printGroupedTable({
        ...commonPrintProps,
        groupBy: "sectionName",
      });
    } catch (err: any) {
      toastService.showError(
        "Error",
        err.message || "An unexpected error occurred during printing"
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="h-full bg-white">
      <div className="print:hidden">
        <TitleHeader
          title="EMPLOYEES REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-user-group text-xl!" />}
          renderInput={() => (
            <div className="w-full lg:w-auto">
              <div className="flex items-center gap-5">
                <ExportOptions
                  loading={isExporting}
                  disabled={isLoading || isPrinting || isExporting || employees.length === 0}
                  exportCSV={async () => {
                    const allData = await fetchAllEmployees();
                    if (allData.length === 0) return;
                    exportEmployeesCSV(allData);
                  }}
                  exportExcel={async () => {
                    const allData = await fetchAllEmployees();
                    if (allData.length === 0) return;
                    exportEmployeesExcel(allData);
                  }}
                  buttonClassName="w-full lg:w-28 h-10! border-2 border-white! text-white!"
                />
                <Button
                  size="small"
                  label="Print"
                  icon="pi pi-print"
                  variant="outlined"
                  loading={isPrinting}
                  disabled={isLoading || isPrinting || isExporting || employees.length === 0}
                  className="w-full lg:w-28 h-10! bg-white!"
                  onClick={handlePrint}
                />
              </div>
            </div>
          )}
        />
        <div className="bg-theme-primary-light">
          <FilterSection
            onSearch={handleSearch}
            selectedColumns={selectedColumn}
            columnOptions={columnOptions}
            onColumnChange={setSelectedColumn}
            zeroRate={zeroRate}
            onZeroRateChange={setZeroRate}
          />
        </div>
      </div>
      <div className="bg-white mt-4 overflow-hidden">
        {/* Top Paginator */}
        <div className="mb-4 px-6 print:hidden flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">
            Showing <span className="text-primary font-bold">{first + 1}</span>{" "}
            to{" "}
            <span className="text-primary font-bold">
              {Math.min(
                first + rows,
                employeesResponse?.pagination?.total ?? 0
              )}
            </span>{" "}
            of{" "}
            <span className="text-primary font-bold">
              {employeesResponse?.pagination?.total ?? 0}
            </span>{" "}
            employees
          </span>
          <Paginator
            first={first}
            rows={rows}
            totalRecords={employeesResponse?.pagination?.total ?? 0}
            rowsPerPageOptions={[50, 100]}
            onPageChange={(e) => {
              setFirst(e.first);
              setRows(e.rows);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className="paginator-sm border-none! p-0! bg-transparent!"
          />
        </div>

        <Table
          dataKey="id"
          showGridlines
          ref={tableRef}
          data={employees}
          columns={columns}
          loading={isLoading}
          pagination={false}
          globalSearch={false}
          lazy
          rowGroupMode={!hasActiveFilter ? "subheader" : undefined}
          groupRowsBy={!hasActiveFilter ? "sectionName" : undefined}
          rowGroupHeaderTemplate={
            !hasActiveFilter
              ? (rowData: any) => (
                  <div className="border border-primary/50 py-3 px-4 bg-gray-50 uppercase">
                    <span className="font-semibold text-primary text-sm">
                      {rowData.sectionName}
                    </span>
                  </div>
                )
              : undefined
          }
          printTitle="EMPLOYEES REPORT"
          tableClassName="report-table"
          emptyMessage="No employees data found."
          scrollable
          scrollHeight="70vh"
        />
      </div>
    </div>
  );
};

export default EmployeesReportPage;
