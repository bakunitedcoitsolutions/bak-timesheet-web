"use client";
import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableColumn, TableRef } from "@/components";
import { ListedTrafficChallan } from "@/lib/db/services/traffic-challan/traffic-challan.dto";
import { toPrimeReactSortOrder } from "@/utils/helpers";
import { SortableField } from "../helpers";

interface ViolationsTableProps {
  tableRef: React.RefObject<TableRef | null>;
  challans: ListedTrafficChallan[];
  isLoading: boolean;
  columns: TableColumn<ListedTrafficChallan>[];
  renderHeader: () => React.ReactNode;
  page: number;
  limit: number;
  total: number;
  sortBy: SortableField | string;
  sortOrder: "asc" | "desc";
  onPageChange: (e: any) => void;
  onSort: (e: any) => void;
}

export const ViolationsTable = ({
  tableRef,
  challans,
  isLoading,
  columns,
  renderHeader,
  page,
  limit,
  total,
  sortBy,
  sortOrder,
  onPageChange,
  onSort,
}: ViolationsTableProps) => {
  return (
    <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
      <Table
        dataKey="id"
        removableSort
        data={challans}
        ref={tableRef}
        loading={isLoading}
        loadingIcon={
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        }
        customHeader={renderHeader}
        columns={columns}
        sortMode="single"
        onPage={onPageChange}
        onSort={onSort}
        sortField={sortBy}
        lazy
        sortOrder={toPrimeReactSortOrder(sortOrder) as any}
        pagination={true}
        rowsPerPageOptions={[10, 25, 50]}
        rows={limit}
        first={(page - 1) * limit}
        totalRecords={total}
        globalSearch={true}
        scrollable
        scrollHeight="65vh"
      />
    </div>
  );
};
