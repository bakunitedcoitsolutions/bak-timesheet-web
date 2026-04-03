import dayjs from "dayjs";
import { TableColumn, TypeBadge, TableActions } from "@/components";
import { ListedTrafficChallan } from "@/lib/db/services/traffic-challan/traffic-challan.dto";

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
 * Checks if a violation record is locked for editing based on payroll status and user permissions.
 */
export const checkIsLocked = (
  isPayrollPosted: boolean,
  role: number | string | undefined,
  hasFull: boolean,
  canEdit: boolean
) => {
  if (isPayrollPosted) return true;
  if (Number(role) === 4 && hasFull) return false;
  if (Number(role) === 4 && !canEdit) return true;
  return false;
};

export const createColumns = (
  handleEdit: (challan: ListedTrafficChallan) => void,
  handleDelete: (challan: ListedTrafficChallan) => void,
  isLocked: boolean,
  canEdit: boolean,
  role: number | string | undefined
): TableColumn<ListedTrafficChallan>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (_: ListedTrafficChallan, options: any) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">
          {Number(options?.rowIndex) + 1}
        </span>
      </div>
    ),
  },
  {
    field: "date",
    header: "Date",
    ...commonColumnProps,
    style: { minWidth: "100px" },
    body: (rowData: ListedTrafficChallan) => {
      return (
        <span className="text-sm">
          {dayjs(rowData.date).format("DD/MM/YYYY")}
        </span>
      );
    },
  },
  {
    field: "employee",
    header: "Employee",
    ...commonColumnProps,
    sortable: false,
    style: { minWidth: "250px" },
    body: (rowData: ListedTrafficChallan) => (
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
    body: (rowData: ListedTrafficChallan) => (
      <TypeBadge
        text={rowData.type}
        variant={rowData.type === "CHALLAN" ? "warning" : "success"}
      />
    ),
  },
  {
    field: "amount",
    header: "Amount",
    ...commonColumnProps,
    style: { minWidth: "150px" },
    align: "right",
    body: (rowData: ListedTrafficChallan) => (
      <span className="text-sm font-semibold">
        {rowData.amount?.toLocaleString() || "0"}
      </span>
    ),
  },
  {
    field: "description",
    header: "Description",
    ...commonColumnProps,
    sortable: false,
    style: { minWidth: "300px" },
    body: (rowData: ListedTrafficChallan) => (
      <span className="text-sm line-clamp-2">{rowData.description || "-"}</span>
    ),
  },
  ...(canEdit && !isLocked
    ? [
        {
          field: "actions",
          header: "Actions",
          sortable: false,
          filterable: false,
          align: "center",
          style: { minWidth: 150 },
          body: (rowData: ListedTrafficChallan) => (
            <TableActions
              rowData={rowData}
              onEdit={handleEdit}
              onDelete={Number(role) !== 4 ? handleDelete : undefined}
            />
          ),
        } as TableColumn<ListedTrafficChallan>,
      ]
    : []),
];
