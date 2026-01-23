"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "primereact/checkbox";

import {
  Table,
  Input,
  Button,
  TableRef,
  TitleHeader,
  TableColumn,
  MultiSelect,
  GroupDropdown,
} from "@/components";
import { printGroupedTable } from "@/utils/helpers/print-utils";
import { sortByOriginalOrder } from "@/utils/helpers/array-utils";
import { EmployeeReportEntry, initialEmployeeReportData } from "@/utils/dummy";

const EmployeesReportPage = () => {
  const router = useRouter();
  const tableRef = useRef<TableRef>(null);

  const [employeeReportData] = useState<EmployeeReportEntry[]>(
    initialEmployeeReportData
  );
  const [employeeName, setEmployeeName] = useState<string>("EMPLOYEES REPORT");

  // Sort data by section order as they appear in the original data
  const sortedData = sortByOriginalOrder(employeeReportData, "section");

  // Filter states
  const [employeeCodes, setEmployeeCodes] = useState<string>("");
  const [selectedDesignation, setSelectedDesignation] = useState<any>("all");
  const [selectedColumn, setSelectedColumn] = useState<string[]>([]);
  const [zeroRate, setZeroRate] = useState<boolean>(false);

  const tableCommonProps = {
    sortable: false,
    filterable: false,
  };

  // Create a map to track row numbers per section
  const getRowNumber = (rowData: EmployeeReportEntry) => {
    const sectionData = sortedData.filter((d) => d.section === rowData.section);
    const indexInSection =
      sectionData.findIndex((d) => d.id === rowData.id) + 1;
    return indexInSection;
  };

  // Define all available columns
  const allColumns = (): TableColumn<EmployeeReportEntry>[] => [
    {
      field: "id",
      header: "#",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 50, width: 50 },
      body: (rowData: EmployeeReportEntry) => {
        const rowNumber = getRowNumber(rowData);
        return <span className="text-sm">{rowNumber}</span>;
      },
    },
    {
      field: "code",
      header: "Code",
      ...tableCommonProps,
      style: { minWidth: 100 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.code}</span>
      ),
    },
    {
      field: "name",
      header: "Name",
      ...tableCommonProps,
      style: { minWidth: 250 },
      body: (rowData: EmployeeReportEntry) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{rowData.nameEn}</span>
          <span className="text-sm text-gray-600">{rowData.nameAr}</span>
        </div>
      ),
    },
    {
      field: "idCard",
      header: "ID Card",
      ...tableCommonProps,
      style: { minWidth: 150 },
      body: (rowData: EmployeeReportEntry) => (
        <div className="flex flex-col gap-1">
          <span className="text-sm">{rowData.idCard}</span>
          {rowData.idCardExpiry && (
            <span className="text-sm text-gray-600">
              Exp: {rowData.idCardExpiry}
            </span>
          )}
        </div>
      ),
    },
    {
      field: "passport",
      header: "Passport",
      ...tableCommonProps,
      style: { minWidth: 150 },
      body: (rowData: EmployeeReportEntry) => (
        <div className="flex flex-col gap-1">
          {rowData.passport ? (
            <>
              <span className="text-sm">{rowData.passport}</span>
              {rowData.passportExpiry && (
                <span className="text-sm text-gray-600">
                  Exp: {rowData.passportExpiry}
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
      field: "designation",
      header: "Designation",
      ...tableCommonProps,
      style: { minWidth: 150 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.designation}</span>
      ),
    },
    {
      field: "iban",
      header: "IBAN",
      ...tableCommonProps,
      style: { minWidth: 200 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.iban}</span>
      ),
    },
    {
      field: "goalSalary",
      header: "Goal Salary",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 120 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.goalSalary.toLocaleString()}</span>
      ),
    },
    {
      field: "rate",
      header: "Rate",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 100 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.rate.toFixed(2)}</span>
      ),
    },
    {
      field: "allowance",
      header: "Allowance",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 120 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.allowance.toLocaleString()}</span>
      ),
    },
    {
      field: "deductable",
      header: "Deductable",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 120 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.deductable}</span>
      ),
    },
    {
      field: "status",
      header: "Status",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 100 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.status ? "True" : "False"}</span>
      ),
    },
    {
      field: "joining",
      header: "Joining",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 120 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.joining}</span>
      ),
    },
    {
      field: "opening",
      header: "Opening",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 120 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.opening.toLocaleString()}</span>
      ),
    },
    {
      field: "fixed",
      header: "Fixed",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 100 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.fixed ? "Yes" : "No"}</span>
      ),
    },
    {
      field: "gender",
      header: "Gender",
      ...tableCommonProps,
      align: "center",
      style: { minWidth: 100 },
      body: (rowData: EmployeeReportEntry) => (
        <span className="text-sm">{rowData.gender}</span>
      ),
    },
  ];

  // Generate column options for MultiSelect (excluding the # column as it's always shown)
  const columnOptions = allColumns()
    .filter((col) => col.field !== "id")
    .map((col) => ({
      label: col.header || String(col.field),
      value: col.field as string,
    }));

  // Get columns for display (always show all columns in the table)
  const columns = (): TableColumn<EmployeeReportEntry>[] => allColumns();

  // Print handler - prints multiple tables grouped by section
  const handlePrint = () => {
    // Filter columns based on selected columns
    // Always include the # column, and include selected columns
    // If no columns are selected, include all columns
    const columnsToPrint = allColumns().filter((col) => {
      // Always include the # column
      if (col.field === "id") return true;
      // If no columns selected, include all
      if (selectedColumn.length === 0) return true;
      // Otherwise, only include selected columns
      return selectedColumn.includes(col.field as string);
    });

    printGroupedTable({
      data: sortedData,
      columns: columnsToPrint.map((col) => ({
        field: col.field,
        header: col.header || "",
        align: (col.align || "left") as "left" | "center" | "right",
        style: col.style,
        body: col.body,
        footer: col.footer,
      })),
      groupBy: "section",
      printTitle: "EMPLOYEES REPORT",
      printHeaderContent: employeeName,
    });
  };

  const renderHeader = () => {
    return (
      <div className="bg-[#F5E6E8] w-full flex flex-col xl:flex-row justify-between gap-x-10 gap-y-4 px-6 py-6">
        <div className="grid flex-1 grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="w-full">
            <Input
              small
              placeholder="Employee Codes"
              value={employeeCodes}
              onChange={(e) => setEmployeeCodes(e.target.value)}
              className="w-full h-10!"
            />
          </div>
          <div className="w-full lg:col-span-2">
            <GroupDropdown
              placeholder="Select Section"
              className="w-full h-10.5!"
              value={selectedDesignation}
              onChange={setSelectedDesignation}
            />
          </div>
          <div className="w-full lg:col-span-2">
            <MultiSelect
              small
              options={columnOptions}
              className="w-full h-10!"
              placeholder="Select Columns"
              selectedItem={selectedColumn}
              setSelectedItem={setSelectedColumn}
            />
          </div>
        </div>
        <div className="flex items-center gap-5 justify-between xl:justify-end">
          <div className="w-[100px]">
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="zeroRate"
                checked={zeroRate}
                onChange={(e) => setZeroRate(e.checked ?? false)}
              />
              <label htmlFor="zeroRate" className="text-sm cursor-pointer">
                Zero Rate
              </label>
            </div>
          </div>
          <Button size="small" className="w-32 h-10!" label="Search" />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white">
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
      <div className="bg-theme-primary-light">{renderHeader()}</div>
      <div className="bg-white mt-4 overflow-hidden">
        <Table
          dataKey="id"
          showGridlines
          ref={tableRef}
          data={sortedData}
          columns={columns()}
          pagination={false}
          globalSearch={false}
          rowGroupMode="subheader"
          groupRowsBy="section"
          rowGroupHeaderTemplate={(rowData: EmployeeReportEntry) => (
            <div className="border border-primary/50 py-3 px-4">
              <span className="font-semibold text-primary text-sm uppercase">
                {rowData.section}
              </span>
            </div>
          )}
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
