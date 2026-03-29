"use client";

import { useMemo } from "react";
import { Table, TableColumn } from "@/components";
import {
  FlattenedTimesheetRow,
  calculateEmployeeTotals,
} from "../utils/monthly-timesheet.utils";

interface ReportTableProps {
  data: FlattenedTimesheetRow[];
  isLoading: boolean;
  monthName: string;
  year: number;
}

export const ReportTable = ({
  data,
  isLoading,
  monthName,
  year,
}: ReportTableProps) => {
  const tableCommonProps = { sortable: false, filterable: false };

  const columns: TableColumn<FlattenedTimesheetRow>[] = useMemo(
    () => [
      {
        field: "day",
        header: "#",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 50, minWidth: 50 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium text-gray-500">{row.day}</span>
        ),
      },
      {
        field: "date",
        header: "Date",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 120, minWidth: 120 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.date}</span>
        ),
      },
      {
        field: "project1Name",
        header: "Project 1",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project1Name || "-"}</span>
        ),
      },
      {
        field: "project1Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project1Hours || 0}</span>
        ),
      },
      {
        field: "project1Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
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
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm">{row.project2Name || "-"}</span>
        ),
      },
      {
        field: "project2Hours",
        header: "Hrs",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium">{row.project2Hours || 0}</span>
        ),
      },
      {
        field: "project2Overtime",
        header: "OT",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 60, minWidth: 60 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-medium text-blue-600">
            {row.project2Overtime || 0}
          </span>
        ),
      },
      {
        field: "dayTotal",
        header: "Total",
        ...tableCommonProps,
        align: "center" as const,
        style: { width: 70, minWidth: 70 },
        body: (row: FlattenedTimesheetRow) => (
          <span className="text-sm font-semibold text-primary">
            {row.dayTotal}
          </span>
        ),
      },
      {
        field: "remarks",
        header: "Remarks",
        ...tableCommonProps,
        style: { minWidth: 100 },
        body: (row: FlattenedTimesheetRow) => (
          <span
            className={`text-sm ${row.isFriday ? `text-primary` : "text-gray-600"}`}
          >
            {row.remarks || ""}
          </span>
        ),
      },
    ],
    []
  );

  const rowGroupHeaderTemplate = (rowData: FlattenedTimesheetRow) => (
    <div className="border border-primary/50 py-3 px-4 bg-gray-50 flex justify-between items-center">
      <span className="font-semibold text-primary text-sm uppercase">
        {rowData.employeeCode} - {rowData.nameEn} (
        {rowData.designationName || ""}
        {rowData.isFixed ? " - Fixed" : ""})
      </span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700 font-semibold whitespace-nowrap">
          ID# {rowData.idCardNo || "N/A"}
        </span>
        <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
          {monthName.toUpperCase()} {year}
        </span>
      </div>
    </div>
  );

  const rowGroupFooterTemplate = (rowData: FlattenedTimesheetRow) => {
    const empRows = data.filter((r) => r.employeeKey === rowData.employeeKey);
    const totals = calculateEmployeeTotals(empRows);

    return (
      <>
        <td className="text-center bg-table-header-footer font-bold text-base" />
        <td className="text-center! bg-table-header-footer font-bold text-base">
          Total
        </td>
        <td className="text-center! bg-table-header-footer" />
        <td className="text-center! bg-table-header-footer font-bold text-base">
          {totals.p1Hrs}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-base text-blue-600">
          {totals.p1OT}
        </td>
        <td className="text-center! bg-table-header-footer" />
        <td className="text-center! bg-table-header-footer font-bold text-base">
          {totals.p2Hrs}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-base text-blue-600">
          {totals.p2OT}
        </td>
        <td className="text-center! bg-table-header-footer font-bold text-base text-primary">
          {totals.total}
        </td>
        <td className="text-center bg-table-header-footer" />
      </>
    );
  };

  return (
    <Table
      dataKey="_rowKey"
      showGridlines
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      globalSearch={false}
      rowGroupMode="subheader"
      groupRowsBy="employeeKey"
      rowGroupHeaderTemplate={rowGroupHeaderTemplate}
      rowGroupFooterTemplate={rowGroupFooterTemplate}
      tableClassName="report-table"
      emptyMessage="No records found for the selected criteria."
      scrollable
      scrollHeight="72vh"
    />
  );
};
