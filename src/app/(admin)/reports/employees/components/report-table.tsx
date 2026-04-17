"use client";

import { useMemo } from "react";
import dayjs from "@/lib/dayjs";
import { Table, TableColumn } from "@/components";

interface ReportTableProps {
  data: any[];
  isLoading: boolean;
  hasActiveFilter: boolean;
  selectedColumns: string[];
}

const tableCommonProps = {
  sortable: false,
  filterable: false,
};

const documentBodyTemplate = (rowData: any, field: string) => {
  const url = rowData[field];
  if (!url) return <span className="text-sm text-gray-400">-</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary text-sm hover:underline break-all line-clamp-2"
    >
      View
    </a>
  );
};

export const ReportTable = ({
  data,
  isLoading,
  hasActiveFilter,
  selectedColumns,
}: ReportTableProps) => {
  const allColumns = useMemo(
    (): TableColumn<any>[] => [
      // Frozen Columns
      {
        field: "id",
        header: "#",
        ...tableCommonProps,
        frozen: true,
        align: "center",
        style: { minWidth: 50, width: 50 },
        body: (rowData, options) => (
          <span className="text-sm">
            {!hasActiveFilter
              ? rowData.groupSerial
              : (options?.rowIndex ?? 0) + 1}
          </span>
        ),
      },
      {
        field: "employeeCode",
        header: "Code",
        ...tableCommonProps,
        frozen: true,
        style: { minWidth: 100, width: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.employeeCode}</span>
        ),
      },
      {
        field: "nameEn",
        header: "Name",
        ...tableCommonProps,
        frozen: true,
        style: { minWidth: 250, width: 300 },
        body: (rowData) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{rowData.nameEn}</span>
            <span className="text-sm text-gray-600 font-arabic! text-right!">
              {rowData.nameAr}
            </span>
          </div>
        ),
      },
      // Regular Columns
      {
        field: "dob",
        header: "Birth Date",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.dob ? dayjs(rowData.dob).format("DD/MM/YYYY") : "-"}
          </span>
        ),
      },
      {
        field: "phone",
        header: "Mobile No.",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">{rowData.phone || "-"}</span>
        ),
      },
      {
        field: "gender",
        header: "Gender",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm capitalize">{rowData.gender || "-"}</span>
        ),
      },
      {
        field: "countryName",
        header: "Country",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.countryName}</span>
        ),
      },
      {
        field: "cityName",
        header: "City",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => <span className="text-sm">{rowData.cityName}</span>,
      },
      {
        field: "statusName",
        header: "Status",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.statusName}</span>
        ),
      },
      {
        field: "branchName",
        header: "Branch",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.branchName}</span>
        ),
      },
      {
        field: "designationName",
        header: "Designation",
        ...tableCommonProps,
        style: { minWidth: 180 },
        body: (rowData) => (
          <span className="text-sm">{rowData.designationName}</span>
        ),
      },
      {
        field: "sectionName",
        header: "Payroll Section",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.sectionName}</span>
        ),
      },
      {
        field: "isFixed",
        header: "Is Fixed?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 100 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isFixed ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "isDeductable",
        header: "Is Deductable?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.isDeductable ? "Yes" : "No"}</span>
        ),
      },
      {
        field: "workingDays",
        header: "Working Days",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.workingDays || "-"}</span>
        ),
      },
      {
        field: "salary",
        header: "Salary",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.salary ? Number(rowData.salary).toLocaleString() : "-"}
          </span>
        ),
      },
      {
        field: "hourlyRate",
        header: "Hourly Rate",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.hourlyRate ? Number(rowData.hourlyRate).toFixed(2) : "-"}
          </span>
        ),
      },
      {
        field: "breakfastAllowance",
        header: "Breakfast All.",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.breakfastAllowance ? "Yes" : "No"}
          </span>
        ),
      },
      {
        field: "foodAllowance",
        header: "Food Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.foodAllowance
              ? Number(rowData.foodAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "mobileAllowance",
        header: "Mobile Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.mobileAllowance
              ? Number(rowData.mobileAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "otherAllowance",
        header: "Other Allowance",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.otherAllowance
              ? Number(rowData.otherAllowance).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "contractStartDate",
        header: "Contract Start",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.contractStartDate
              ? dayjs(rowData.contractStartDate).format("DD/MM/YYYY")
              : "-"}
          </span>
        ),
      },
      {
        field: "contractEndDate",
        header: "Contract End",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.contractEndDate
              ? dayjs(rowData.contractEndDate).format("DD/MM/YYYY")
              : "-"}
          </span>
        ),
      },
      {
        field: "contractRemainingDays",
        header: "Contract Rem. Days",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 150 },
        body: (rowData) => {
          const days = rowData.contractRemainingDays;
          if (days === null)
            return <span className="text-sm text-gray-400">-</span>;
          const isExpired = days < 0;
          return (
            <span
              className={`text-sm font-semibold ${isExpired ? "text-red-600" : "text-green-600"}`}
            >
              {days} days {isExpired ? "(Exp)" : ""}
            </span>
          );
        },
      },
      {
        field: "joiningDate",
        header: "Joining Date",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.joiningDate
              ? dayjs(rowData.joiningDate).format("DD/MM/YYYY")
              : "-"}
          </span>
        ),
      },
      {
        field: "contractEndReason",
        header: "End Reason",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (rowData) => (
          <span className="text-sm line-clamp-2">
            {rowData.contractEndReason || "-"}
          </span>
        ),
      },
      {
        field: "contractDocument",
        header: "Contract Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "contractDocument"),
      },
      {
        field: "idCardNo",
        header: "ID Card No.",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.idCardNo || "-"}</span>
        ),
      },
      {
        field: "idCardExpiryDate",
        header: "ID Card Expiry",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.idCardExpiryDate
              ? dayjs(rowData.idCardExpiryDate).format("DD/MM/YYYY")
              : "-"}
          </span>
        ),
      },
      {
        field: "profession",
        header: "Profession",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.profession || "-"}</span>
        ),
      },
      {
        field: "idCardDocument",
        header: "ID Card Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "idCardDocument"),
      },
      {
        field: "nationalityName",
        header: "Nationality",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.nationalityName}</span>
        ),
      },
      {
        field: "passportNo",
        header: "Passport No.",
        ...tableCommonProps,
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">{rowData.passportNo || "-"}</span>
        ),
      },
      {
        field: "passportExpiryDate",
        header: "Passport Expiry",
        ...tableCommonProps,
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.passportExpiryDate
              ? dayjs(rowData.passportExpiryDate).format("DD/MM/YYYY")
              : "-"}
          </span>
        ),
      },
      {
        field: "passportDocument",
        header: "Passport Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "passportDocument"),
      },
      {
        field: "bankName",
        header: "Bank Name",
        ...tableCommonProps,
        style: { minWidth: 150 },
        body: (rowData) => (
          <span className="text-sm">{rowData.bankName || "-"}</span>
        ),
      },
      {
        field: "bankCode",
        header: "Bank Code",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.bankCode || "-"}</span>
        ),
      },
      {
        field: "iban",
        header: "IBAN",
        ...tableCommonProps,
        style: { minWidth: 200 },
        body: (rowData) => (
          <span className="text-sm">{rowData.iban || "-"}</span>
        ),
      },
      {
        field: "gosiSalary",
        header: "GOSI Salary",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 130 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.gosiSalary
              ? Number(rowData.gosiSalary).toLocaleString()
              : "-"}
          </span>
        ),
      },
      {
        field: "gosiCityName",
        header: "GOSI City",
        ...tableCommonProps,
        style: { minWidth: 120 },
        body: (rowData) => (
          <span className="text-sm">{rowData.gosiCityName}</span>
        ),
      },
      {
        field: "isCardDelivered",
        header: "Card Delivered?",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 140 },
        body: (rowData) => (
          <span className="text-sm">
            {rowData.isCardDelivered ? "Yes" : "No"}
          </span>
        ),
      },
      {
        field: "cardDocument",
        header: "Card Doc",
        ...tableCommonProps,
        align: "center",
        style: { minWidth: 120 },
        body: (rowData) => documentBodyTemplate(rowData, "cardDocument"),
      },
    ],
    [hasActiveFilter]
  );

  const columns = useMemo(() => {
    return allColumns.filter(
      (col) => col.frozen || selectedColumns.includes(col.field as string)
    );
  }, [allColumns, selectedColumns]);

  const rowGroupHeaderTemplate = (rowData: any) => (
    <div className="bg-gray-50 px-4 py-2 border-y border-gray-200 font-bold text-primary flex justify-between items-center group-header print:bg-white text-sm">
      <span>{rowData.sectionName || "Unassigned"}</span>
    </div>
  );

  return (
    <Table
      dataKey="id"
      showGridlines
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      globalSearch={false}
      rowGroupMode={!hasActiveFilter ? "subheader" : undefined}
      groupRowsBy={!hasActiveFilter ? "sectionName" : undefined}
      rowGroupHeaderTemplate={
        !hasActiveFilter ? rowGroupHeaderTemplate : undefined
      }
      tableClassName="report-table"
      emptyMessage="No employees found for the current filters"
      scrollable
      scrollHeight="65vh"
    />
  );
};
