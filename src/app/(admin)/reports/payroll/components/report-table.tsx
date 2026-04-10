"use client";

import { useMemo } from "react";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";

import {
  fmt,
  fmtHR,
  NUMERIC_KEYS,
  PayrollReportRow,
  calculateGrandTotals,
  calculateSectionTotals,
} from "../utils/payroll-report.utils";
import { Table, TableColumn, Badge } from "@/components";
import { formatNum, formatPayrollPeriod } from "@/utils/helpers";

interface ReportTableProps {
  year: number;
  month: number;
  isLoading: boolean;
  data: PayrollReportRow[];
  allSectionsCount: number;
  payrollSectionIds: number[] | null;
}

const tableCommonProps: TableColumn<PayrollReportRow> = {
  sortable: false,
  filterable: false,
  headerStyle: {
    fontSize: "12px",
    textAlign: "center",
  },
  field: "",
  header: "",
  align: "center",
  style: { minWidth: 75 },
};

export const ReportTable = ({
  data,
  year,
  month,
  isLoading,
  allSectionsCount,
  payrollSectionIds,
}: ReportTableProps) => {
  const isForTruckHouse =
    payrollSectionIds && payrollSectionIds?.length > 0
      ? payrollSectionIds?.length === 1
        ? payrollSectionIds[0] === 6 || payrollSectionIds[0] === 15
        : payrollSectionIds?.includes?.(6) && payrollSectionIds?.includes?.(15)
      : false;
  console;

  const columns = useMemo(
    (): TableColumn<PayrollReportRow>[] => [
      {
        ...tableCommonProps,
        field: "displayIndex",
        header: "#",
        style: { width: 48, minWidth: 48 },
        body: (r) => (
          <span className="text-sm font-semibold">{r.displayIndex}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "empCode",
        header: "Code",
        style: { width: 70, minWidth: 70 },
        body: (r) => <span className="text-sm font-semibold">{r.empCode}</span>,
      },
      {
        ...tableCommonProps,
        field: "name",
        header: "Full Name",
        style: { minWidth: 300 },
        body: (r) => (
          <div className="flex items-center justify-between gap-1.5">
            <p className="text-xs font-semibold text-left flex flex-1">
              {r.name}
            </p>
            {r.isFixed && <Badge text="F" />}
          </div>
        ),
      },
      {
        ...tableCommonProps,
        field: "idNumber",
        header: "ID No",
        style: { minWidth: 120 },
        body: (r) => (
          <span className="text-xs font-semibold">{r.idNumber || "-"}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "designation",
        header: "Designation",
        style: { minWidth: 150 },
        body: (r) => (
          <span className="text-xs font-semibold">{r.designation || "-"}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "workDays",
        header: "Work Days",
        body: (r) => (
          <span className="text-sm font-semibold text-center block">
            {fmt(r.workDays)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "overTime",
        header: "Over Time",
        body: (r) => (
          <span className="text-sm font-semibold text-center block">
            {fmt(r.overTime)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalHours",
        header: "Total Hours",
        body: (r) => (
          <span className="text-sm font-semibold text-center block">
            {fmt(r.totalHours)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "hourlyRate",
        header: "Hourly Rate",
        body: (r) => (
          <span className="text-sm text-center font-semibold bold">
            {fmtHR(r.hourlyRate)}
          </span>
        ),
      },
      ...(isForTruckHouse
        ? [
            {
              ...tableCommonProps,
              field: "tripAllowance",
              header: "Trip Alw.",
              body: (r: PayrollReportRow) => (
                <span className="text-sm text-center font-semibold block">
                  {fmt(r.tripAllowance)}
                </span>
              ),
            },
            {
              ...tableCommonProps,
              field: "overtimeAllowance",
              header: "OT Alw.",
              body: (r: PayrollReportRow) => (
                <span className="text-sm text-center font-semibold block">
                  {fmt(
                    Number(r.overtimeAllowance || 0) +
                      Number(r.otherAllowances || 0)
                  )}
                </span>
              ),
            },
          ]
        : [
            {
              ...tableCommonProps,
              field: "breakfastAllowance",
              header: "Brf. Alw.",
              body: (r: PayrollReportRow) => (
                <span className="text-sm text-center font-semibold block">
                  {fmt(r.breakfastAllowance)}
                </span>
              ),
            },
            {
              ...tableCommonProps,
              field: "otherAllowances",
              header: "Alw.",
              body: (r: PayrollReportRow) => (
                <span className="text-sm text-center font-semibold block">
                  {fmt(r.otherAllowances)}
                </span>
              ),
            },
          ]),

      {
        ...tableCommonProps,
        field: "totalAllowances",
        header: "Total Alw.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.totalAllowances)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalSalary",
        header: "Total Salary",
        body: (r) => (
          <span className="text-sm font-semibold text-center block">
            {fmt(r.totalSalary)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "previousAdvance",
        header: "Prev. Adv.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.previousAdvance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "currentAdvance",
        header: "Curr. Adv.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.currentAdvance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "loanDeduction",
        header: "Loan Ded.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.loanDeduction)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "netLoan",
        header: "Net Loan",
        body: (r) => (
          <span className="text-sm font-semibold text-primary text-center block">
            {fmt(r.netLoan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "previousChallan",
        header: "Prev. Traff.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.previousChallan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "currentChallan",
        header: "Curr. Traff.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.currentChallan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "challanDeduction",
        header: "Traff. Ded.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.challanDeduction)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "netChallan",
        header: "Net Traff.",
        body: (r) => (
          <span className="text-sm font-semibold text-primary text-center block">
            {fmt(r.netChallan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "netSalaryPayable",
        header: "Net Salary",
        body: (r) => (
          <span className="text-sm font-bold text-primary text-center block">
            {fmt(r.netSalaryPayable)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "cardSalary",
        header: "Card Salary",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.cardSalary)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "cashSalary",
        header: "Cash Salary",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.cashSalary)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "remarks",
        header: "Remarks",
        style: { minWidth: 150 },
        body: (r) => (
          <span className="text-sm text-gray-500 text-left!">
            {!!r.remarks
              ? `${r.remarks}\n(${r.paymentMethodName})`
              : r.paymentMethodName}
          </span>
        ),
      },
    ],
    [isForTruckHouse]
  );

  const grandTotals = useMemo(() => calculateGrandTotals(data), [data]);

  const footerColumnGroup =
    allSectionsCount > 1 && data.length > 0 ? (
      <ColumnGroup>
        <Row>
          <Column
            colSpan={5}
            footer="GRAND TOTAL :"
            footerStyle={{
              background: "var(--primary-color) !important",
              color: "#ffffff",
              textAlign: "right",
              fontWeight: "900",
              fontSize: 14,
              letterSpacing: "0.06em",
              padding: "10px 20px 10px 8px",
              borderTop: "2px solid var(--primary-color)",
            }}
          />
          {NUMERIC_KEYS.map((k) => (
            <Column
              key={String(k)}
              footer={k === "hourlyRate" ? "-" : fmt(grandTotals[k as string])}
              footerStyle={{
                background: "var(--primary-color) !important",
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "900",
                fontSize: 14,
                padding: "10px 6px",
                borderTop: "2px solid var(--primary-color)",
              }}
            />
          ))}
          <Column
            footer=""
            footerStyle={{
              background: "var(--primary-color) !important",
              borderTop: "2px solid var(--primary-color)",
            }}
          />
        </Row>
      </ColumnGroup>
    ) : undefined;

  const rowGroupHeaderTemplate = (rowData: PayrollReportRow) => (
    <div className="border border-primary/50 py-2 px-4 bg-gray-50 flex justify-between items-center print:break-inside-avoid">
      <span className="font-bold text-primary text-sm uppercase">
        {rowData.sectionName || "Unassigned"}
      </span>
      <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
        {formatPayrollPeriod(month, year)}
      </span>
    </div>
  );

  const rowGroupFooterTemplate = (rowData: PayrollReportRow) => {
    const sn = rowData.sectionName;
    const sectionRows = data.filter((r) => r.sectionName === sn);
    // Don't show a total row if there's only one record in the section
    if (sectionRows.length <= 1) return null;

    const totals = calculateSectionTotals(data, sn);
    const colSpan = 5;

    return (
      <>
        <td
          colSpan={colSpan}
          className="bg-primary-light! text-primary! font-bold! text-right! px-3! text-sm! uppercase!"
        >
          {sn} - Total :
        </td>
        {NUMERIC_KEYS.map((k) => (
          <td
            key={String(k)}
            className="bg-primary-light! text-primary! font-bold! text-center! text-sm!"
          >
            {k === "hourlyRate" ? "-" : fmt(totals[k as string])}
          </td>
        ))}
        <td className="bg-primary-light!" />
      </>
    );
  };

  return (
    <Table
      dataKey="id"
      showGridlines
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      globalSearch={false}
      rowGroupMode="subheader"
      groupRowsBy="sectionName"
      rowGroupHeaderTemplate={rowGroupHeaderTemplate}
      rowGroupFooterTemplate={rowGroupFooterTemplate}
      footerColumnGroup={footerColumnGroup}
      tableClassName="report-table"
      emptyMessage="No records found for the selected criteria."
      scrollable
      scrollHeight="72vh"
    />
  );
};
