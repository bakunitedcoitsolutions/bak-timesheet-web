"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";

import {
  useGetEmployees,
  listEmployeesAction,
} from "@/lib/db/services/employee";
import {
  exportEmployeesCSV,
  exportEmployeesExcel,
  mapEmployeeToExportRow,
} from "@/utils/helpers/export-employees-report";
import { toastService } from "@/lib/toast";
import { parseGroupDropdownFilter } from "@/utils/helpers";
import { TitleHeader, Button, ExportOptions } from "@/components";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { printGroupedTable, printTable } from "@/utils/helpers/print-utils";

// Extracted Components & Utilities
import { ReportTable } from "./components/report-table";
import { FilterSection } from "./components/filter-section";
import { mapEmployeesData } from "./utils/employees-report.utils";

const EmployeesReportPage = () => {
  const router = useRouter();

  // Query states
  const [querySearch, setQuerySearch] = useState<string>("");
  const [queryFilter, setQueryFilter] = useState<string | number | null>("all");
  const [queryStatusId, setQueryStatusId] = useState<number>(1); // Default to Active (1)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "designationName",
    "phone",
    "statusName",
  ]);
  const [zeroRate, setZeroRate] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

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
  const employees = useMemo(() => {
    return mapEmployeesData(employeesResponse?.employees || []);
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

  // Define column options for MultiSelect based on table column keys
  // This list should match the available fields in ReportTable (excluding frozen)
  const availableColumns = [
    { label: "Birth Date", value: "dob" },
    { label: "Mobile No.", value: "phone" },
    { label: "Gender", value: "gender" },
    { label: "Country", value: "countryName" },
    { label: "City", value: "cityName" },
    { label: "Status", value: "statusName" },
    { label: "Branch", value: "branchName" },
    { label: "Designation", value: "designationName" },
    { label: "Payroll Section", value: "sectionName" },
    { label: "Is Fixed?", value: "isFixed" },
    { label: "Is Deductable?", value: "isDeductable" },
    { label: "Working Days", value: "workingDays" },
    { label: "Salary", value: "salary" },
    { label: "Hourly Rate", value: "hourlyRate" },
    { label: "Breakfast All.", value: "breakfastAllowance" },
    { label: "Food Allowance", value: "foodAllowance" },
    { label: "Mobile Allowance", value: "mobileAllowance" },
    { label: "Other Allowance", value: "otherAllowance" },
    { label: "Contract Start", value: "contractStartDate" },
    { label: "Contract End", value: "contractEndDate" },
    { label: "Contract Rem. Days", value: "contractRemainingDays" },
    { label: "Joining Date", value: "joiningDate" },
    { label: "End Reason", value: "contractEndReason" },
    { label: "Contract Doc", value: "contractDocument" },
    { label: "ID Card No.", value: "idCardNo" },
    { label: "ID Card Expiry", value: "idCardExpiryDate" },
    { label: "Profession", value: "profession" },
    { label: "ID Card Doc", value: "idCardDocument" },
    { label: "Nationality", value: "nationalityName" },
    { label: "Passport No.", value: "passportNo" },
    { label: "Passport Expiry", value: "passportExpiryDate" },
    { label: "Passport Doc", value: "passportDocument" },
    { label: "Bank Name", value: "bankName" },
    { label: "Bank Code", value: "bankCode" },
    { label: "GOSI Salary", value: "gosiSalary" },
    { label: "GOSI City", value: "gosiCityName" },
    { label: "IBAN", value: "iban" },
    { label: "Card Delivered?", value: "isCardDelivered" },
    { label: "Card Doc", value: "cardDocument" },
  ];

  const handlePrint = async () => {
    const allData = await fetchAllEmployees();
    if (allData && allData.length > 0) {
      const exportCols = [
        { header: "Code", field: "employeeCode", style: { minWidth: "70px" } },
        {
          header: "Name",
          field: "nameEn",
          style: { minWidth: "280px" },
          body: (rowData: any) => (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-normal!">{rowData.nameEn}</div>
              <div className="text-sm font-arabic! text-right">
                {rowData.nameAr}
              </div>
            </div>
          ),
        },
        ...selectedColumns
          .filter(
            (col) =>
              col !== "employeeCode" && col !== "nameEn" && col !== "nameAr"
          )
          .map((colKey) => ({
            header:
              availableColumns.find((c) => c.value === colKey)?.label || colKey,
            field: colKey,
          })),
      ];

      const isLandscape = exportCols.length > 5;
      if (!hasActiveFilter) {
        printGroupedTable({
          data: allData,
          columns: exportCols,
          groupBy: "sectionName",
          printTitle: "EMPLOYEES REPORT",
          printSubTitle: `${allData?.length} Employee(s)`,
          landscape: isLandscape,
        });
      } else {
        printTable({
          data: allData,
          columns: exportCols,
          printTitle: "EMPLOYEES REPORT",
          printSubTitle: `${allData?.length} Employee(s)`,
          landscape: isLandscape,
        });
      }
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="print:hidden">
        <TitleHeader
          title="EMPLOYEES REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-users-rectangle text-xl!" />}
          renderInput={() => (
            <div className="flex items-center gap-5">
              <ExportOptions
                disabled={isExporting}
                loading={isExporting}
                exportCSV={async () => {
                  const data = await fetchAllEmployees();
                  if (data && data.length > 0) {
                    const exportCols = [
                      { header: "#", key: "groupSerial" },
                      { header: "Code", key: "employeeCode" },
                      { header: "Name (EN)", key: "nameEn" },
                      { header: "Name (AR)", key: "nameAr" },
                      ...selectedColumns
                        .filter(
                          (col) =>
                            col !== "employeeCode" &&
                            col !== "nameEn" &&
                            col !== "nameAr"
                        )
                        .map((colKey) => ({
                          header:
                            availableColumns.find((c) => c.value === colKey)
                              ?.label || colKey,
                          key: colKey,
                        })),
                    ];
                    exportEmployeesCSV(data, exportCols);
                  }
                }}
                exportExcel={async () => {
                  const data = await fetchAllEmployees();
                  if (data && data.length > 0) {
                    const exportCols = [
                      { header: "#", key: "groupSerial" },
                      { header: "Code", key: "employeeCode" },
                      { header: "Name (EN)", key: "nameEn" },
                      { header: "Name (AR)", key: "nameAr" },
                      ...selectedColumns
                        .filter(
                          (col) =>
                            col !== "employeeCode" &&
                            col !== "nameEn" &&
                            col !== "nameAr"
                        )
                        .map((colKey) => ({
                          header:
                            availableColumns.find((c) => c.value === colKey)
                              ?.label || colKey,
                          key: colKey,
                        })),
                    ];
                    exportEmployeesExcel(data, exportCols);
                  }
                }}
                buttonClassName="w-full lg:w-28 h-10! border-2 border-white! text-white!"
              />
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                loading={isExporting}
                disabled={isExporting}
                onClick={handlePrint}
                className="w-full lg:w-28 h-10! bg-white!"
              />
            </div>
          )}
        />
        <div className="bg-theme-primary-light">
          <FilterSection
            onSearch={handleSearch}
            selectedColumns={selectedColumns}
            columnOptions={availableColumns}
            onColumnChange={setSelectedColumns}
            zeroRate={zeroRate}
            onZeroRateChange={setZeroRate}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 print:p-0">
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
          <Paginator
            first={first}
            rows={rows}
            totalRecords={employeesResponse?.pagination?.total ?? 0}
            rowsPerPageOptions={[50, 100, 200]}
            onPageChange={(e) => {
              setFirst(e.first);
              setRows(e.rows);
            }}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className="paginator-sm border-none! p-0! bg-transparent!"
          />
          <div className="text-sm text-gray-500 font-medium">
            Total Employees:{" "}
            <span className="text-primary font-bold">
              {employeesResponse?.pagination?.total ?? 0}
            </span>
          </div>
        </div>

        <ReportTable
          data={employees}
          isLoading={isLoading}
          hasActiveFilter={hasActiveFilter}
          selectedColumns={selectedColumns}
        />
      </div>
    </div>
  );
};

export default EmployeesReportPage;
