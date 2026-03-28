"use client";
import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableRef } from "@/components";
import { LedgerEntry } from "../helpers";

interface LedgerTableProps {
  tableRef: any;
  ledgerData: LedgerEntry[];
  columns: any;
  isLoading: boolean;
  searchEmployeeCode: number | null;
  renderEmployeeInfo: (isPrinting: boolean) => React.ReactNode;
}

export const LedgerTable = ({
  tableRef,
  ledgerData,
  columns,
  isLoading,
  searchEmployeeCode,
  renderEmployeeInfo,
}: LedgerTableProps) => {
  return (
    <div className="bg-white h-full rounded-xl overflow-hidden min-h-0">
      {isLoading ? (
        <div className="flex justify-center items-center h-full min-h-[400px]">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        </div>
      ) : (
        <>
          <Table
            ref={tableRef}
            dataKey="id"
            data={ledgerData}
            columns={columns}
            pagination={false}
            globalSearch={false}
            emptyMessage={
              searchEmployeeCode
                ? "No ledger data found for this employee."
                : "Enter employee code and click Search to view ledger."
            }
            scrollable
            scrollHeight="80vh"
            showGridlines
            printTitle="EMPLOYEE LEDGER"
            tableClassName="report-table"
            printHeaderContent={renderEmployeeInfo(true)}
          />

          <style jsx global>{`
            @media print {
              tr.p-datatable-row,
              tr.p-rowgroup-footer,
              tr.p-rowgroup-header {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};
