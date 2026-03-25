"use client";

import { Table, TableColumn } from "@/components";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise";
import { formatNum } from "@/utils/helpers";
import { useMemo } from "react";

const fmt = (v: number) => formatNum(v || 0);

const tableCommonProps: TableColumn<SiteWiseReportRow> = {
  sortable: false,
  filterable: false,
  headerStyle: {
    fontSize: "13px",
    textAlign: "center",
  },
  align: "center",
  field: "",
  header: "",
};

interface SummarizedTableProps {
  data: SiteWiseReportRow[];
  isLoading: boolean;
}

export const SummarizedTable = ({ data, isLoading }: SummarizedTableProps) => {
  const columns = useMemo(
    (): TableColumn<SiteWiseReportRow>[] => [
      {
        ...tableCommonProps,
        header: "#",
        style: { width: "50px" },
        body: (_, options) => <span>{(options?.rowIndex ?? 0) + 1}</span>,
      },
      {
        ...tableCommonProps,
        field: "month",
        header: "Month",
        style: { minWidth: "50px" },
        body: (r) => (
          <span className="text-sm text-center block">{r.month}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "projectName",
        header: "Project Name",
        style: { minWidth: "250px", textAlign: "left" },
        align: "left",
        body: (r) => (
          <span className="font-semibold text-sm text-left block">
            {r.projectName}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "projectHours",
        header: "Project Hours",
        body: (r) => (
          <span className="font-semibold text-center block">
            {fmt(r.projectHours)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "projectOT",
        header: "Project OT",
        body: (r) => (
          <span className="font-semibold text-center block">
            {fmt(r.projectOT)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalHours",
        header: "Total Hours",
        body: (r) => (
          <span className="font-semibold text-center block">
            {fmt(r.projectHours + r.projectOT)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "breakfastAllowance",
        header: "Brf. Alw.",
        body: (r) => (
          <span className="font-semibold text-center block text-blue-600">
            {fmt(r.breakfastAllowance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalSalary",
        header: "Total Salary",
        body: (r) => (
          <span className="font-bold text-primary text-center block">
            {fmt(r.totalSalary)}
          </span>
        ),
      },
    ],
    []
  );

  const totals = useMemo(() => {
    return data.reduce(
      (acc, curr) => ({
        hours: acc.hours + (curr.projectHours || 0),
        ot: acc.ot + (curr.projectOT || 0),
        breakfastAllowance:
          acc.breakfastAllowance + (curr.breakfastAllowance || 0),
        salary: acc.salary + (curr.totalSalary || 0),
      }),
      { hours: 0, ot: 0, breakfastAllowance: 0, salary: 0 }
    );
  }, [data]);

  const similarStyle: any = {
    background: "var(--primary-color) !important",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 14,
    padding: "10px 6px",
    borderTop: "2px solid var(--primary-color)",
  };

  const footerColumnGroup = (
    <ColumnGroup>
      <Row>
        <Column
          colSpan={3}
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
        <Column footer={fmt(totals.hours)} footerStyle={similarStyle} />
        <Column footer={fmt(totals.ot)} footerStyle={similarStyle} />
        <Column
          footer={fmt(totals.hours + totals.ot)}
          footerStyle={similarStyle}
        />
        <Column
          footer={fmt(totals.breakfastAllowance)}
          footerStyle={similarStyle}
        />
        <Column footer={fmt(totals.salary)} footerStyle={similarStyle} />
      </Row>
    </ColumnGroup>
  );

  return (
    <Table
      dataKey="id"
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      globalSearch={false}
      showGridlines
      stripedRows
      extraSmall
      scrollable
      emptyMessage="No data found for the selected filters."
      scrollHeight="calc(100vh - 250px)"
      tableClassName="report-table"
      footerColumnGroup={footerColumnGroup}
    />
  );
};
