"use client";
import { TableColumn, TableActions, TypeBadge, Badge } from "@/components";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { EmployeeProfilePicture } from "./EmployeeProfilePicture";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

export interface EmployeeTableColumnsProps {
  role: number | string | undefined;
  canEdit: boolean;
  handlePrint: (employee: ListedEmployee) => void;
  handleEdit: (employee: ListedEmployee) => void;
  handleDelete: (employee: ListedEmployee) => void;
  handleViewCard: (employee: ListedEmployee) => void;
}

export const getEmployeeTableColumns = ({
  role,
  canEdit,
  handlePrint,
  handleEdit,
  handleDelete,
  handleViewCard,
}: EmployeeTableColumnsProps): TableColumn<ListedEmployee>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedEmployee) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "employeeCode",
    header: "Emp. Code",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="flex items-center gap-5">
        <EmployeeProfilePicture
          statusId={rowData.statusId}
          profilePicture={rowData.profilePicture}
          employeeName={rowData.nameEn}
        />
        <span
          className="text-sm font-semibold text-primary underline cursor-pointer"
          onClick={() => handleEdit(rowData)}
        >
          {rowData.employeeCode}
        </span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name (En)",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: ListedEmployee) => (
      <div className="flex items-start gap-2 min-w-0">
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <span className="text-sm font-medium leading-tight wrap-break-word">
            {rowData.nameEn}
          </span>
        </div>
        {(rowData.isFixed || rowData.isDeductable) && (
          <div className="flex items-center justify-center gap-x-1 shrink-0">
            {rowData.isFixed && <Badge text="F" />}
            {rowData.isFixed && rowData.isDeductable && <Badge text="D" />}
          </div>
        )}
      </div>
    ),
  },
  {
    field: "nameAr",
    header: "Name (Ar)",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-right font-medium font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "gender",
    header: "Gender",
    style: { minWidth: 100 },
    filterable: false,
    sortable: true,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm">
          {rowData.gender === "male"
            ? "M"
            : rowData.gender === "female"
              ? "F"
              : "-"}
        </span>
      </div>
    ),
  },
  {
    field: "idCardNo",
    header: "ID No.",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData.idCardNo || "-"}</span>
    ),
  },
  {
    field: "designationId",
    header: "Designation",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: any) => (
      <span className="text-sm">
        {rowData?.designationName ? rowData.designationName : "-"}
      </span>
    ),
  },
  {
    field: "payrollSectionId",
    header: "Payroll Sect.",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: any) => (
      <span className="text-sm">
        {rowData?.payrollSectionName ? rowData.payrollSectionName : "-"}
      </span>
    ),
  },
  {
    field: "profession",
    header: "Profession",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-right font-medium font-arabic">
          {rowData.profession || ""}
        </span>
      </div>
    ),
  },
  {
    field: "hourlyRate",
    header: "Hourly Rate",
    sortable: false,
    filterable: false,
    style: { minWidth: 120 },
    body: (rowData: ListedEmployee) => (
      <div className="flex items-start justify-center gap-2">
        <span className="text-sm font-semibold">
          {rowData.hourlyRate && rowData.hourlyRate > 0 ? (
            rowData.hourlyRate.toString()
          ) : (
            <span className="text-text-gray font-normal">N/A</span>
          )}
        </span>
      </div>
    ),
  },
  {
    field: "salary",
    header: "Salary",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: ListedEmployee) => (
      <span className="text-sm font-semibold">
        {rowData.salary && rowData.salary > 0 ? (
          rowData.salary.toString()
        ) : (
          <span className="text-text-gray font-normal">N/A</span>
        )}
      </span>
    ),
  },
  {
    field: "nationality",
    header: "Nationality",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData?.nationality?.nameEn || "-"}</span>
    ),
  },
  {
    field: "phone",
    header: "Contact No.",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData.phone || "-"}</span>
    ),
  },
  {
    field: "isCardDelivered",
    header: "Card Delivered?",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    align: "center",
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        <TypeBadge
          text={rowData.isCardDelivered ? "Yes" : "No"}
          variant={rowData.isCardDelivered ? "success" : "danger"}
        />
      </div>
    ),
  },
  {
    field: "cardDocument",
    header: "ID Card",
    sortable: false,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        {rowData.cardDocument ? (
          <span
            className="text-sm text-center text-primary underline cursor-pointer"
            onClick={() => handleViewCard(rowData)}
          >
            View
          </span>
        ) : (
          <span className="text-sm text-center text-text-gray">N/A</span>
        )}
      </div>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: ListedEmployee) => (
      <TableActions
        rowData={rowData}
        onDelete={Number(role) !== 4 ? handleDelete : undefined}
        onEdit={canEdit || Number(role) !== 4 ? handleEdit : undefined}
        beforeActions={[
          {
            icon: "pi pi-print text-lg!",
            label: "Print",
            severity: "secondary",
            onClick: handlePrint,
            tooltip: "Print",
          },
        ]}
      />
    ),
  },
];
