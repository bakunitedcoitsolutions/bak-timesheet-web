import dayjs from "dayjs";
import { TableColumn, TypeBadge, TableActions } from "@/components";
import { ListedLoan } from "@/lib/db/services/loan/loan.dto";

// Constants
export const SORTABLE_FIELDS = {
  date: "date",
  type: "type",
  amount: "amount",
  createdAt: "createdAt",
} as const;

export type SortableField = keyof typeof SORTABLE_FIELDS;

export const commonColumnProps = {
  sortable: true,
  filterable: false,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

/**
 * Defines the columns for the loans data table
 */
export const getLoansTableColumns = (
  handleEdit: (loan: ListedLoan) => void,
  handleDelete: (loan: ListedLoan) => void,
  isLocked: (loan: ListedLoan) => boolean,
  canEdit: boolean,
  isPayrollPosted: boolean,
  role: number | string | undefined
): TableColumn<ListedLoan>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedLoan) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { minWidth: "100px" },
    body: (rowData: ListedLoan) => {
      return (
        <span className="text-sm">
          {dayjs(rowData.date).format("DD/MM/YYYY")}
        </span>
      );
    },
  },
  {
    field: "employeeId",
    header: "Employee",
    ...commonColumnProps,
    sortable: false,
    style: { minWidth: "250px" },
    body: (rowData: ListedLoan) => (
      <span className="text-sm line-clamp-2">
        {!!rowData.employee?.employeeCode && (
          <span className="font-semibold text-primary">
            {rowData.employee?.employeeCode}
            {!!rowData.employee?.nameEn ? " - " : ""}
          </span>
        )}
        {!!rowData.employee?.nameEn && <span>{rowData.employee?.nameEn}</span>}
      </span>
    ),
  },
  {
    field: "type",
    header: "Type",
    ...commonColumnProps,
    filterable: false,
    style: { minWidth: "120px" },
    align: "center",
    body: (rowData: ListedLoan) => (
      <TypeBadge
        text={rowData.type}
        variant={rowData.type === "LOAN" ? "warning" : "success"}
      />
    ),
  },
  {
    field: "amount",
    header: "Amount",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    align: "right",
    body: (rowData: ListedLoan) => (
      <span className="text-sm font-semibold">
        {rowData.amount?.toLocaleString() || "0"}
      </span>
    ),
  },
  {
    field: "remarks",
    header: "Remarks",
    ...commonColumnProps,
    sortable: false,
    style: { minWidth: "300px" },
    body: (rowData: ListedLoan) => (
      <span className="text-sm line-clamp-2">{rowData.remarks || "-"}</span>
    ),
  },
  ...(canEdit && !isPayrollPosted
    ? [
        {
          field: "actions",
          header: "Actions",
          sortable: false,
          filterable: false,
          align: "center",
          style: { minWidth: 150 },
          body: (rowData: ListedLoan) => (
            <TableActions
              rowData={rowData}
              onEdit={!isLocked(rowData) ? handleEdit : undefined}
              onDelete={
                Number(role) !== 4 && !isLocked(rowData)
                  ? handleDelete
                  : undefined
              }
            />
          ),
        } as TableColumn<ListedLoan>,
      ]
    : []),
];
