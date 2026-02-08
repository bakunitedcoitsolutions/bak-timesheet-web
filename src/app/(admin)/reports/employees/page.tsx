"use client";
import { useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";
import { InputNumberChangeEvent } from "primereact/inputnumber";

import {
  Table,
  Button,
  TableRef,
  TitleHeader,
  TableColumn,
  MultiSelect,
  GroupDropdown,
  NumberInput,
} from "@/components";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { useGetEmployees } from "@/lib/db/services/employee";
import { printGroupedTable } from "@/utils/helpers/print-utils";
import { ListedDesignation } from "@/lib/db/services/designation";
import { ListedEmployeeStatus } from "@/lib/db/services/employee-status";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { useGetDesignations } from "@/lib/db/services/designation/requests";
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
  onSearch: (search: string, filter: string | number | null) => void;
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

  const handleSearch = () => {
    onSearch(searchValue, selectedFilter);
  };

  return (
    <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6 print:hidden">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div className="w-full">
          <NumberInput
            small
            useGrouping={false}
            placeholder="Employee Codes / Name"
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
        <div className="w-[100px]">
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
  const [selectedColumn, setSelectedColumn] = useState<string[]>([]);
  const [zeroRate, setZeroRate] = useState<boolean>(false);

  const filterParams = parseGroupDropdownFilter(queryFilter);
  const hasActiveFilter =
    !!querySearch ||
    !!filterParams.designationId ||
    !!filterParams.payrollSectionId ||
    filterParams.payrollSectionId === 0;

  // Data Fetching
  const { data: employeesResponse, isLoading } = useGetEmployees({
    page: 1,
    limit: 1000,
    search: querySearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
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

  // Construct employees list with mapped data
  const employees: any[] = useMemo(() => {
    if (!employeesResponse?.employees) return [];

    const groupCounters: Record<number | string, number> = {};

    let data = employeesResponse.employees.map((emp: ListedEmployee) => {
      const designation = designationMap.get(emp.designationId ?? -1);
      const status = statusMap.get(emp.statusId ?? -1); // Handle null statusId

      const sectionId = emp.payrollSectionId ?? "unassigned";
      groupCounters[sectionId] = (groupCounters[sectionId] || 0) + 1;

      // Calculate total allowance
      const totalAllowance =
        (Number(emp.foodAllowance) || 0) +
        (Number(emp.mobileAllowance) || 0) +
        (Number(emp.otherAllowance) || 0);

      return {
        ...emp,
        designationName: designation?.nameEn,
        sectionName: emp.payrollSection?.nameEn || "Unassigned",
        statusName: status?.nameEn,
        totalAllowance,
        groupSerial: groupCounters[sectionId],
      };
    });

    return data;
  }, [employeesResponse?.employees, designationMap, statusMap]); // Updated dependencies

  // Handle Search
  const handleSearch = (search: string, filter: string | number | null) => {
    setQuerySearch(search);
    setQueryFilter(filter);
  };

  const tableCommonProps = {
    sortable: true,
    filterable: false,
  };

  // Define all available columns
  const allColumns = useMemo(
    (): TableColumn<any>[] => [
      {
        field: "id", // Will be used for row index in body
        header: "#",
        ...tableCommonProps,
        sortable: false,
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
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.employeeCode}</span>
        ),
      },
      {
        field: "nameEn",
        header: "Name",
        ...tableCommonProps,
        style: { minWidth: 250 },
        body: (rowData) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{rowData.nameEn}</span>
            <span className="text-sm text-gray-600">{rowData.nameAr}</span>
          </div>
        ),
      },
      {
        field: "idCardNo",
        header: "ID Card",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{rowData.idCardNo}</span>
            {rowData.idCardExpiryDate && (
              <span className="text-sm text-gray-600">
                Exp: {new Date(rowData.idCardExpiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        ),
      },
      {
        field: "passportNo",
        header: "Passport",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <div className="flex flex-col gap-1">
            {rowData.passportNo ? (
              <>
                <span className="text-sm">{rowData.passportNo}</span>
                {rowData.passportExpiryDate && (
                  <span className="text-sm text-gray-600">
                    Exp:{" "}
                    {new Date(rowData.passportExpiryDate).toLocaleDateString()}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </div>
        ),
      },
      {
        field: "designationName",
        header: "Designation",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.designationName}</span>
        ),
      },
      {
        field: "iban",
        header: "IBAN",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (rowData) => <span className="text-sm">{rowData.iban}</span>,
      },
      {
        field: "salary", // Assuming "Goal Salary" maps to salary? Or strict salary?
        header: "Basic Salary",
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
        header: "Rate",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.hourlyRate ? Number(rowData.hourlyRate).toFixed(2) : "-"}
          </span>
        ),
      },
      {
        field: "totalAllowance",
        header: "Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.totalAllowance.toLocaleString()}
          </span>
        ),
      },
      {
        field: "isDeductable",
        header: "Deductable",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isDeductable ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "statusName",
        header: "Status",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.statusName}</span>
        ),
      },
      {
        field: "joiningDate",
        header: "Joining",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.joiningDate
              ? new Date(rowData.joiningDate).toLocaleDateString()
              : "-"}
          </span>
        ),
      },
      {
        field: "openingBalance",
        header: "Opening",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.openingBalance
              ? Number(rowData.openingBalance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "isFixed",
        header: "Fixed",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isFixed ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "gender",
        header: "Gender",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm capitalize">{rowData.gender}</span>
        ),
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
  const handlePrint = () => {
    const columnsToPrint = allColumns.filter((col) => {
      if (col.field === "id") return true;
      if (selectedColumn.length === 0) return true;
      return selectedColumn.includes(col.field as string);
    });

    const printTitle = zeroRate
      ? "EMPLOYEES REPORT (ZERO RATE)"
      : "EMPLOYEES REPORT";

    printGroupedTable({
      data: employees,
      columns: columnsToPrint.map((col) => ({
        field: col.field,
        header: (col.header as string) || "",
        align: (col.align || "left") as "left" | "center" | "right",
        style: col.style,
        body: col.body,
      })),
      groupBy: "sectionName",
      printTitle: printTitle,
      printHeaderContent: printTitle,
    });
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
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                className="w-full lg:w-28 h-10! bg-white!"
                onClick={handlePrint}
              />
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
        <Table
          dataKey="id"
          showGridlines
          ref={tableRef}
          data={employees}
          columns={columns}
          loading={isLoading}
          pagination={true}
          rowsPerPage={100}
          globalSearch={false}
          rowGroupMode={!hasActiveFilter ? "subheader" : undefined}
          groupRowsBy={!hasActiveFilter ? "sectionName" : undefined}
          rowGroupHeaderTemplate={
            !hasActiveFilter
              ? (rowData: any) => (
                  <div className="border border-primary/50 py-3 px-4 bg-gray-50">
                    <span className="font-semibold text-primary text-sm uppercase">
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
          scrollHeight="72vh"
        />
      </div>
    </div>
  );
};

export default EmployeesReportPage;
