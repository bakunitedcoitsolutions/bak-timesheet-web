import { ProgressSpinner } from "primereact/progressspinner";
import { Table, TableRef, TableColumn, CustomHeaderProps } from "@/components";
import { PayrollEntry } from "@/utils/types";

interface PayrollTableProps {
  tableRef: React.RefObject<TableRef | null>;
  payrollData: PayrollEntry[];
  columns: TableColumn<PayrollEntry>[];
  renderHeader: (props: CustomHeaderProps) => React.ReactNode;
  isLoading: boolean;
}


export const PayrollTable = ({
  tableRef,
  payrollData,
  columns,
  renderHeader,
  isLoading,
}: PayrollTableProps) => {
  return (
    <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
      <Table
        ref={tableRef}
        dataKey="id"
        data={payrollData}
        columns={columns}
        customHeader={renderHeader}
        pagination={false}
        rows={10}
        scrollable
        scrollHeight="72vh"
        loading={isLoading}
        loadingIcon={
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        }
      />
    </div>
  );
};
