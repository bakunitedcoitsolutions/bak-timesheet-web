"use client";
import React from "react";
import { Table, TableRef, TableColumn } from "@/components";
import { ProgressSpinner } from "primereact/progressspinner";
import { TimesheetPageRow } from "@/lib/db/services/timesheet/timesheet.dto";

interface TimesheetTableProps {
  tableRef: React.RefObject<TableRef | null>;
  data: TimesheetPageRow[];
  columns: TableColumn<TimesheetPageRow>[];
  isLoading: boolean;
  onPage: (event: any) => void;
  totalRecords: number;
  rows: number;
  currentPage: number;
  isLocked: (rowData: TimesheetPageRow) => boolean;
}

export const TimesheetTable = ({
  tableRef,
  data,
  columns,
  isLoading,
  onPage,
  totalRecords,
  rows,
  currentPage,
  isLocked,
}: TimesheetTableProps) => {
  return (
    <div className="bg-white h-full rounded-xl overflow-hidden min-h-0 relative">
      {isLoading ? (
        <div className="flex items-center justify-center h-[72vh]">
          <ProgressSpinner style={{ width: "40px", height: "40px" }} />
        </div>
      ) : (
        <Table
          lazy
          dataKey="id"
          ref={tableRef}
          columns={columns}
          pagination={true}
          data={data}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          first={(currentPage - 1) * rows}
          globalSearch={false}
          emptyMessage="No timesheet data found. Select a date and payroll section."
          rowClassName={(rowData: TimesheetPageRow) =>
            isLocked(rowData) ? "locked-row" : ""
          }
          scrollable
          scrollHeight="65vh"
        />
      )}
    </div>
  );
};
