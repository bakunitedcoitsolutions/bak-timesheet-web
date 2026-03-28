import { TableColumn, TypeBadge, TableActions } from "@/components";
import { ListedProject } from "@/lib/db/services/project/project.dto";

export const SORTABLE_FIELDS = {
  nameEn: "nameEn",
  nameAr: "nameAr",
  isActive: "isActive",
  createdAt: "createdAt",
} as const;

export type SortableField = keyof typeof SORTABLE_FIELDS;

export const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

export const getProjectTableColumns = (
  handleEdit: (project: ListedProject) => void,
  handleDelete: (project: ListedProject) => void,
  isAccessEnabledUser: boolean
): TableColumn<ListedProject>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedProject) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Project Name",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: ListedProject) => (
      <span className="text-sm uppercase font-medium whitespace-nowrap">
        {rowData.nameEn}
      </span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: ListedProject) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-xl! text-right font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "description",
    header: "Description",
    sortable: false,
    filterable: true,
    smallFilter: true,
    showFilterMenu: false,
    showClearButton: false,
    style: { minWidth: 250 },
    body: (rowData: ListedProject) => (
      <span className="text-sm line-clamp-2">{rowData.description || "-"}</span>
    ),
  },
  {
    field: "isActive",
    header: "Status",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ListedProject) => (
      <TypeBadge
        text={rowData.isActive ? "Active" : "Inactive"}
        variant={rowData.isActive ? "success" : "danger"}
      />
    ),
  },
  ...(!isAccessEnabledUser
    ? [
        {
          field: "actions",
          header: "Actions",
          sortable: false,
          filterable: false,
          align: "center" as const,
          style: { minWidth: 150 },
          body: (rowData: ListedProject) => (
            <TableActions
              rowData={rowData}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ),
        },
      ]
    : []),
];
