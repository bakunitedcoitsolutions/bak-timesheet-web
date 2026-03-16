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
    fontSize: "12px",
    textAlign: "center",
  },
  align: "center",
  field: "",
  header: "",
};

interface DetailedTableProps {
  data: SiteWiseReportRow[];
  isLoading: boolean;
}

export const DetailedTable = ({ data, isLoading }: DetailedTableProps) => {
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
        style: { minWidth: "100px" },
      },
      {
        ...tableCommonProps,
        field: "projectName",
        header: "Project Name",
        style: { minWidth: "200px", textAlign: "left" },
        align: "left",
      },
      {
        ...tableCommonProps,
        field: "empCode",
        header: "Emp. Code",
        style: { minWidth: "90px" },
      },
      {
        ...tableCommonProps,
        field: "employeeName",
        header: "Employee Name",
        style: { minWidth: "200px", textAlign: "left" },
        align: "left",
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
        field: "hourlyRate",
        header: "Hourly Rate",
        body: (r) => (
          <span className="text-center block">
            {r.hourlyRate?.toFixed(2) || "0.00"}
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
        salary: acc.salary + (curr.totalSalary || 0),
      }),
      { hours: 0, ot: 0, salary: 0 }
    );
  }, [data]);

  const sumProject = (projectName: string, key: keyof SiteWiseReportRow) =>
    data
      .filter((r) => r.projectName === projectName)
      .reduce((s, r) => s + ((r[key] as number) || 0), 0);

  const footerColumnGroup = (
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
        <Column
          footer={fmt(totals.hours)}
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
        <Column
          footer={fmt(totals.ot)}
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
        <Column
          footerStyle={{
            background: "var(--primary-color) !important",
            borderTop: "2px solid var(--primary-color)",
          }}
        />
        <Column
          footer={fmt(totals.salary)}
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
      </Row>
    </ColumnGroup>
  );

  const rowGroupHeaderTemplate = (rowData: SiteWiseReportRow) => (
    <div className="border border-primary/50 py-2 px-4 bg-gray-50 flex justify-between items-center">
      <span className="font-bold text-primary text-sm uppercase">
        {rowData.projectName || "Unassigned Project"}
      </span>
    </div>
  );

  const rowGroupFooterTemplate = (rowData: SiteWiseReportRow) => {
    const pn = rowData.projectName;
    const projectCount = data.filter((r) => r.projectName === pn).length;
    if (projectCount <= 1) return null;

    const s = (k: keyof SiteWiseReportRow) => fmt(sumProject(pn, k));

    return (
      <>
        <td
          colSpan={5}
          className="bg-primary-light! text-primary! font-bold! text-right! px-3! text-sm! uppercase!"
        >
          {pn} - Total :
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("projectHours")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("projectOT")}
        </td>
        <td className="bg-primary-light!" />
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("totalSalary")}
        </td>
      </>
    );
  };

  return (
    <Table
      dataKey="id"
      data={data}
      columns={columns}
      loading={isLoading}
      pagination={false}
      showGridlines
      stripedRows
      extraSmall
      scrollable
      scrollHeight="calc(100vh - 310px)"
      tableClassName="report-table"
      footerColumnGroup={footerColumnGroup}
      rowGroupMode="subheader"
      groupRowsBy="projectName"
      rowGroupHeaderTemplate={rowGroupHeaderTemplate}
      rowGroupFooterTemplate={rowGroupFooterTemplate}
    />
  );
};
