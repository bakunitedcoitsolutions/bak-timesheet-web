"use client";

import dayjs from "@/lib/dayjs";
import { useMemo } from "react";
import { Table, TableColumn } from "@/components";
import { GlobalDataGeneral } from "@/context/GlobalDataContext";
import { calculateSectionTotals } from "../utils/daily-timesheet.utils";
import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";

interface ReportTableProps {
  data: TimesheetPageRow[];
  isLoading: boolean;
  selectedDate: Date;
  selectedProject?: GlobalDataGeneral | null;
}

export const ReportTable = ({
  data,
  isLoading,
  selectedDate,
  selectedProject,
}: ReportTableProps) => {
  const tableCommonProps = { sortable: false, filterable: false };

  const columns: TableColumn<TimesheetPageRow>[] = useMemo(
    () => [
      {
        field: "rowNumber",
        header: "#",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 50, minWidth: 50 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-gray-500">
            {(row as any).displayIndex}
          </span>
        ),
      },
      {
        field: "employeeCode",
        header: "Code",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 80, minWidth: 80 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.employeeCode}</span>
        ),
      },
      {
        field: "nameEn",
        header: "Employee Name",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (row: TimesheetPageRow) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.nameEn}</span>
            {row.designationNameEn && (
              <span className="text-xs text-gray-500">
                {row.designationNameEn}
              </span>
            )}
          </div>
        ),
      },
      {
        field: "project1Name",
        header: "Project 1",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">
            {(row as any).project1Name || "-"}
          </span>
        ),
      },
      {
        field: "project1Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.project1Hours || 0}</span>
        ),
      },
      {
        field: "project1Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project1Overtime || 0}
          </span>
        ),
      },
      {
        field: "project2Name",
        header: "Project 2",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm">{(row as any).project2Name || "-"}</span>
        ),
      },
      {
        field: "project2Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium">{row.project2Hours || 0}</span>
        ),
      },
      {
        field: "project2Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project2Overtime || 0}
          </span>
        ),
      },
      {
        field: "totalHours",
        header: "Total",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 70, minWidth: 70 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm font-semibold text-primary">
            {row.totalHours || 0}
          </span>
        ),
      },
      {
        field: "description",
        header: "Remarks",
        ...tableCommonProps,
        style: { minWidth: 100 },
        body: (row: TimesheetPageRow) => (
          <span className="text-sm text-gray-600">{row.description || ""}</span>
        ),
      },
    ],
    []
  );

  const rowGroupHeaderTemplate = (rowData: any) => {
    return (
      <div className="border border-primary/50 py-2 px-4 bg-gray-50 flex justify-between items-center print:break-inside-avoid">
        <span className="font-bold text-primary text-sm uppercase">
          {rowData.sectionName || "Unassigned"}
        </span>
        <div className="flex items-center gap-5">
          {selectedProject && (
            <span className="text-sm font-bold text-primary bg-primary-light px-3 py-1 rounded-sm uppercase">
              {selectedProject?.nameEn}
            </span>
          )}
          <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
            {dayjs(selectedDate).format("DD MMM YYYY")}
          </span>
        </div>
      </div>
    );
  };

  const rowGroupFooterTemplate = (rowData: any) => {
    const sectionRows = data.filter(
      (r) => (r as any).sectionName === rowData.sectionName
    );
    const totals = calculateSectionTotals(sectionRows);

    return (
      <>
        <td
          className="text-center bg-table-header-footer font-bold"
          colSpan={4}
        >
          Section Total
        </td>
        <td className="text-center! bg-table-header-footer font-bold">
          {totals.p1Hrs}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-blue-600">
          {totals.p1OT}
        </td>
        <td className="text-center! bg-table-header-footer" />
        <td className="text-center! bg-table-header-footer font-bold">
          {totals.p2Hrs}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-blue-600">
          {totals.p2OT}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-primary">
          {totals.total}
        </td>
        <td className="text-center bg-table-header-footer" />
      </>
    );
  };

  return (
    <Table
      dataKey="id"
      showGridlines
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      globalSearch={false}
      rowGroupMode="subheader"
      groupRowsBy="sectionName"
      rowGroupHeaderTemplate={rowGroupHeaderTemplate}
      rowGroupFooterTemplate={rowGroupFooterTemplate}
      tableClassName="report-table"
      emptyMessage="No records found for the selected date."
      scrollable
      scrollHeight="72vh"
    />
  );
};
