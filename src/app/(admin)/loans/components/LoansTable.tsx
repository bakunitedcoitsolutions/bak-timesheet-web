import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableRef, TableColumn } from "@/components";
import { ListedLoan } from "@/lib/db/services/loan/loan.dto";
import { toPrimeReactSortOrder } from "@/utils/helpers";

interface LoansTableProps {
  tableRef: React.RefObject<TableRef | null>;
  loans: ListedLoan[];
  isLoading: boolean;
  renderHeader: () => React.ReactNode;
  tableColumns: TableColumn<ListedLoan>[];
  handlePageChange: (e: { page?: number; rows?: number }) => void;
  sortHandler: (e: any) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  currentLimit: number;
  currentPage: number;
  total: number;
}

export const LoansTable = ({
  tableRef,
  loans,
  isLoading,
  renderHeader,
  tableColumns,
  handlePageChange,
  sortHandler,
  sortBy,
  sortOrder,
  currentLimit,
  currentPage,
  total,
}: LoansTableProps) => {
  return (
    <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
      <Table
        dataKey="id"
        removableSort
        data={loans}
        ref={tableRef}
        loading={isLoading}
        loadingIcon={
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        }
        customHeader={renderHeader}
        columns={tableColumns}
        sortMode="single"
        onPage={handlePageChange}
        lazy
        onSort={sortHandler}
        sortField={sortBy}
        sortOrder={toPrimeReactSortOrder(sortOrder) as any}
        pagination={true}
        rowsPerPageOptions={[10, 25, 50]}
        rows={currentLimit}
        first={(currentPage - 1) * currentLimit}
        totalRecords={total}
        globalSearch={true}
        scrollable
        scrollHeight="65vh"
      />
    </div>
  );
};
