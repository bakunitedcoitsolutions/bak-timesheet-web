"use client";
import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableColumn, TableRef } from "@/components";
import { ListedUser } from "@/lib";
import { toPrimeReactSortOrder } from "@/utils/helpers";
import { SortableField } from "../helpers";

interface UsersTableProps {
  tableRef: React.RefObject<TableRef | null>;
  users: ListedUser[];
  isLoading: boolean;
  columns: TableColumn<ListedUser>[];
  renderHeader: () => React.ReactNode;
  page: number;
  limit: number;
  total: number;
  sortBy?: SortableField;
  sortOrder?: "asc" | "desc";
  onPageChange: (e: any) => void;
  onSort: (e: any) => void;
}

export const UsersTable = ({
  tableRef,
  users,
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
}: UsersTableProps) => {
  return (
    <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
      <Table
        dataKey="id"
        removableSort
        data={users}
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
        sortOrder={toPrimeReactSortOrder(sortOrder) as any}
        pagination={true}
        lazy={true}
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
