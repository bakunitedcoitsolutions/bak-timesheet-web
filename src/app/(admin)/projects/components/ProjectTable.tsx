import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableRef, TableColumn } from "@/components";
import { ListedProject } from "@/lib/db/services/project/project.dto";
import { toPrimeReactSortOrder } from "@/utils/helpers";

interface ProjectTableProps {
  projects: ListedProject[];
  isLoading: boolean;
  tableRef: React.RefObject<TableRef | null>;
  columns: TableColumn<ListedProject>[];
  renderHeader: () => React.ReactNode;
  onPageChange: (e: any) => void;
  onSort: (e: any) => void;
  onFilter: (e: any) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  currentLimit: number;
  currentPage: number;
  total: number;
}

export const ProjectTable = ({
  projects,
  isLoading,
  tableRef,
  columns,
  renderHeader,
  onPageChange,
  onSort,
  onFilter,
  sortBy,
  sortOrder,
  currentLimit,
  currentPage,
  total,
}: ProjectTableProps) => {
  return (
    <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
      <Table
        dataKey="id"
        removableSort
        data={projects}
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
        onFilter={onFilter}
        sortField={sortBy}
        lazy={true}
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
