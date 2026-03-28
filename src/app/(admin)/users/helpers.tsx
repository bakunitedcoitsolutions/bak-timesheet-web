import { TableColumn, TypeBadge, TableActions } from "@/components";
import { ListedUser } from "@/lib";

// Constants
export const SORTABLE_FIELDS = {
  nameEn: "nameEn",
  nameAr: "nameAr",
  isActive: "isActive",
  email: "email",
  userRoleId: "userRoleId",
  branchId: "branchId",
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

export const createColumns = (
  handleEdit: (user: ListedUser) => void,
  handleDelete: (user: ListedUser) => void
): TableColumn<ListedUser>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    align: "center",
    filterable: false,
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedUser) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "email",
    header: "Email",
    ...commonColumnProps,
    style: { minWidth: 250 },
    body: (rowData: ListedUser) => (
      <span className="text-sm">{rowData.email}</span>
    ),
  },
  {
    field: "userRoleId",
    header: "Role",
    sortable: true,
    filterable: false,
    style: { minWidth: 200 },
    body: (rowData: ListedUser) => {
      return <span className="text-sm">{rowData?.userRole?.nameEn || ""}</span>;
    },
  },
  {
    field: "branchId",
    header: "Branch",
    sortable: false,
    filterable: false,
    style: { minWidth: "200px" },
    body: (rowData: ListedUser) => {
      const branch = rowData?.branch?.nameEn || "-";

      return (
        <div className="flex flex-col">
          <span className="text-sm font-bold">{branch}</span>
        </div>
      );
    },
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 130 },
    align: "center",
    body: (rowData: ListedUser) => (
      <TypeBadge
        text={rowData.isActive ? "Active" : "In-Active"}
        variant={rowData.isActive ? "success" : "danger"}
      />
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: ListedUser) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];
