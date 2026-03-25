"use client";

import { useMemo, useState, useEffect } from "react";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { ColumnGroup } from "primereact/columngroup";

import { formatNum } from "@/utils/helpers";
import { Table, TableColumn } from "@/components";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise";

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

interface DetailedTableProps {
  data: SiteWiseReportRow[];
  isLoading: boolean;
  filterSummary: string;
}

export const DetailedTable = ({
  data,
  isLoading,
  filterSummary,
}: DetailedTableProps) => {
  const [firstProject, setFirstProject] = useState(0);
  const [projectsPerPage, setProjectsPerPage] = useState(3);

  // Reset pagination when data changes
  useEffect(() => {
    setFirstProject(0);
  }, [data]);

  const projectGroups = useMemo(() => {
    const groups: Record<string, SiteWiseReportRow[]> = {};
    data.forEach((r) => {
      const pn = r.projectName || "Unassigned Project";
      if (!groups[pn]) groups[pn] = [];
      groups[pn].push(r);
    });

    return Object.keys(groups)
      .sort()
      .map((name) => {
        const rawRows = groups[name];

        // Aggregate by empCode within the project
        const employeeMap = new Map<number | string, SiteWiseReportRow>();

        rawRows.forEach((r) => {
          const key = r.empCode || "NoCode";
          if (!employeeMap.has(key)) {
            employeeMap.set(key, { ...r });
          } else {
            const existing = employeeMap.get(key)!;
            existing.projectHours =
              (existing.projectHours || 0) + (r.projectHours || 0);
            existing.projectOT = (existing.projectOT || 0) + (r.projectOT || 0);
            existing.breakfastAllowance =
              (existing.breakfastAllowance || 0) + (r.breakfastAllowance || 0);
            existing.totalSalary =
              (existing.totalSalary || 0) + (r.totalSalary || 0);
          }
        });

        return {
          name,
          rows: Array.from(employeeMap.values()),
        };
      });
  }, [data]);

  const visibleProjectGroups = useMemo(() => {
    return projectGroups.slice(firstProject, firstProject + projectsPerPage);
  }, [projectGroups, firstProject, projectsPerPage]);

  const visibleData = useMemo(() => {
    return visibleProjectGroups.flatMap((g) => g.rows);
  }, [visibleProjectGroups]);

  const transformedData = useMemo(() => {
    return visibleData.map((r, idx) => ({
      ...r,
      displayIndex: idx + 1,
    }));
  }, [visibleData]);

  const columns = useMemo(
    (): TableColumn<any>[] => [
      {
        ...tableCommonProps,
        header: "#",
        style: { width: "50px" },
        body: (r) => (
          <span className="text-sm font-medium">{r.displayIndex}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "empCode",
        header: "Emp. Code",
        style: { width: "120px" },
        body: (r) => (
          <span className="text-sm text-center block font-semibold">
            {r.empCode}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "employeeName",
        header: "Employee Name",
        style: { minWidth: "200px", textAlign: "left" },
        align: "left",
        body: (r) => (
          <span className="text-sm text-left block">{r.employeeName}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "projectHours",
        header: "Project Hours",
        style: { width: "150px" },
        body: (r) => (
          <span className="text-sm text-center block font-semibold">
            {fmt(r.projectHours)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "projectOT",
        header: "Project OT",
        style: { width: "100px" },
        body: (r) => (
          <span className="text-sm text-center block font-semibold">
            {fmt(r.projectOT)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "hourlyRate",
        header: "Hourly Rate",
        style: { width: "100px" },
        body: (r) => (
          <span className="text-sm text-center block">
            {r.hourlyRate?.toFixed(2) || "0.00"}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "breakfastAllowance",
        header: "Brf. Alw.",
        style: { width: "100px" },
        body: (r) => (
          <span className="text-sm text-center block font-semibold text-blue-600">
            {fmt(r.breakfastAllowance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalSalary",
        header: "Total Salary",
        style: { width: "120px" },
        body: (r) => (
          <span className="text-sm text-center block font-bold text-primary">
            {fmt(r.totalSalary)}
          </span>
        ),
      },
    ],
    []
  );

  const grandTotals = useMemo(() => {
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

  const commonStyle: any = {
    background: "var(--primary-color) !important",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 14,
    padding: "10px 6px",
    borderTop: "2px solid var(--primary-color)",
  };

  const rowGroupHeaderTemplate = (r: SiteWiseReportRow) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-y border-gray-100">
      <span className="font-bold text-primary uppercase text-sm">
        {r.projectName || "Unassigned Project"}
      </span>
      {r.month && (
        <span className="text-xs font-bold bg-primary-light! text-primary! px-2 py-0.5 rounded">
          {r.month}
        </span>
      )}
    </div>
  );

  const rowGroupFooterTemplate = (r: SiteWiseReportRow) => {
    const pn = r.projectName;
    const groupRows = transformedData.filter((row) => row.projectName === pn);

    const pHours = groupRows.reduce((s, row) => s + (row.projectHours || 0), 0);
    const pOT = groupRows.reduce((s, row) => s + (row.projectOT || 0), 0);
    const pBreakfast = groupRows.reduce(
      (s, row) => s + (row.breakfastAllowance || 0),
      0
    );
    const pSalary = groupRows.reduce((s, row) => s + (row.totalSalary || 0), 0);

    return (
      <>
        <td
          colSpan={3}
          className="bg-primary-light! text-primary! font-bold! text-right! px-4! text-sm! uppercase!"
        >
          {pn} - TOTAL :
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {fmt(pHours)}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {fmt(pOT)}
        </td>
        <td colSpan={1} className="bg-primary-light!" />
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {fmt(pBreakfast)}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {fmt(pSalary)}
        </td>
      </>
    );
  };

  const footerColumnGroup = (
    <ColumnGroup>
      <Row>
        <Column
          colSpan={3}
          footer="GRAND TOTAL:"
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
        <Column footer={fmt(grandTotals.hours)} footerStyle={commonStyle} />
        <Column footer={fmt(grandTotals.ot)} footerStyle={commonStyle} />
        <Column
          colSpan={1}
          footerStyle={{
            background: "var(--primary-color) !important",
            borderTop: "2px solid var(--primary-color)",
          }}
        />
        <Column
          footer={fmt(grandTotals.breakfastAllowance)}
          footerStyle={commonStyle}
        />
        <Column footer={fmt(grandTotals.salary)} footerStyle={commonStyle} />
      </Row>
    </ColumnGroup>
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <span className="text-sm text-gray-500 font-medium">
          Showing{" "}
          <span className="text-primary font-bold">
            {Math.min(firstProject + 1, projectGroups.length)}
          </span>{" "}
          –{" "}
          <span className="text-primary font-bold">
            {Math.min(firstProject + projectsPerPage, projectGroups.length)}
          </span>{" "}
          of{" "}
          <span className="text-primary font-bold">{projectGroups.length}</span>{" "}
          projects
        </span>
        <div className="flex items-center gap-4">
          <Paginator
            rows={projectsPerPage}
            first={firstProject}
            totalRecords={projectGroups.length}
            rowsPerPageOptions={[1, 3, 5, 10]}
            onPageChange={(e) => {
              setFirstProject(e.first);
              setProjectsPerPage(e.rows);
            }}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className="paginator-sm border-none! p-0! bg-transparent!"
          />
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <Table
          dataKey="id"
          data={transformedData}
          columns={columns}
          loading={isLoading}
          pagination={false}
          globalSearch={false}
          showGridlines
          stripedRows
          extraSmall
          scrollable
          scrollHeight="calc(100vh - 320px)"
          tableClassName="report-table w-full"
          tableStyle={{ minWidth: "100%" }}
          footerColumnGroup={footerColumnGroup}
          rowGroupMode="subheader"
          groupRowsBy="projectName"
          rowGroupHeaderTemplate={rowGroupHeaderTemplate}
          rowGroupFooterTemplate={rowGroupFooterTemplate}
        />
      </div>
    </div>
  );
};
