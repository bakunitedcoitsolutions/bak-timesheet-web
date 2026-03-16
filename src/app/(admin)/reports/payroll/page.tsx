"use client";

import { useState, useRef, useMemo } from "react";
import { Row } from "primereact/row";
import { Column } from "primereact/column";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";
import { ColumnGroup } from "primereact/columngroup";

import {
  Input,
  Table,
  Badge,
  Button,
  Dropdown,
  TitleHeader,
  TableColumn,
  AutoScrollChips,
  ExportOptions,
} from "@/components";
import { formatNum, formatPayrollPeriod } from "@/utils/helpers";
import { useGlobalData } from "@/context/GlobalDataContext";
import ModifiedMultiSelect from "@/components/forms/multi-select";
import { printPayrollReport } from "@/utils/helpers/print-payroll-report";
import {
  exportPayrollExcel,
  exportPayrollCSV,
  PayrollReportRow as ExportPayrollReportRow,
} from "@/utils/helpers/export-payroll-report";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";
import { useGetPayrollReport } from "@/lib/db/services/payroll-summary/requests";

// ─── types ───────────────────────────────────────────────────────────────────

type PayrollReportRow = PayrollDetailEntry & {
  sectionName: string;
  sectionOrder: number;
  displayIndex: number;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const getMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

const fmt = (v: number) => formatNum(v || 0);
const fmtHR = (v: number) => Number(v || 0).toFixed(2);

const tableCommonProps: TableColumn<PayrollReportRow> = {
  sortable: false,
  filterable: false,
  headerStyle: {
    fontSize: "12px",
    textAlign: "center",
  },
  align: "center",
  field: "",
  header: "",
  style: { minWidth: 75 },
};

// ─── PayrollReportPage ────────────────────────────────────────────────────────

const PayrollReportPage = () => {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: globalData } = useGlobalData();

  // ── local filter controls ──────────────────────────────────────────────────
  const [monthYear, setMonthYear] = useState(getMonthYear);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [employeeCodeChips, setEmployeeCodeChips] = useState<string[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // ── applied query (only updated on Refresh) ────────────────────────────────
  const [appliedQuery, setAppliedQuery] = useState<{
    month: number;
    year: number;
    payrollSectionIds?: number[] | null;
    designationId?: number | null;
    employeeCodes?: number[] | null;
    paymentMethodId?: number | null;
  }>(getMonthYear);

  // ── section pagination ────────────────────────────────────────────────────
  const [firstSection, setFirstSection] = useState(0);
  const [sectionsPerPage, setSectionsPerPage] = useState(3);

  // ── options ───────────────────────────────────────────────────────────────
  const paymentMethodOptions = useMemo(
    () => [
      { label: "All Methods", value: 0 },
      ...globalData.paymentMethods.map((p) => ({
        label: p.nameEn,
        value: p.id,
      })),
    ],
    [globalData.paymentMethods]
  );

  const sectionOptions = useMemo(
    () =>
      globalData.payrollSections.map((s) => ({
        label: s.nameEn,
        value: s.id,
      })),
    [globalData.payrollSections]
  );

  // ── fetch ─────────────────────────────────────────────────────────────────
  const { data: reportResponse, isLoading } = useGetPayrollReport(
    appliedQuery,
    !isFirstLoad
  );

  const allRows = useMemo(
    () => (reportResponse?.details ?? []) as PayrollReportRow[],
    [reportResponse]
  );

  // ── group by section (skip empty sections) ──────────────────────────────
  const sections = useMemo(() => {
    const map = new Map<string, { rows: PayrollReportRow[]; order: number }>();
    allRows.forEach((r) => {
      const sn = r.sectionName ?? "Unassigned";
      const so = r.sectionOrder ?? 9999;
      if (!map.has(sn)) map.set(sn, { rows: [], order: so });
      map.get(sn)!.rows.push(r);
    });
    return [...map.entries()]
      .sort((a, b) => a[1].order - b[1].order)
      .map(([name, { rows }]) => ({
        name,
        rows: rows.map((r, i) => ({
          ...r,
          displayIndex: i + 1,
          sectionName: name,
        })),
      }));
  }, [allRows]);

  // ── visible sections (paginated) ──────────────────────────────────────────
  const visibleSections = useMemo(
    () => sections.slice(firstSection, firstSection + sectionsPerPage),
    [sections, firstSection, sectionsPerPage]
  );

  const visibleData = useMemo(
    () => visibleSections.flatMap((s) => s.rows),
    [visibleSections]
  );

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = (paramMonthYear?: { month: number; year: number }) => {
    const M = paramMonthYear?.month ?? monthYear.month;
    const Y = paramMonthYear?.year ?? monthYear.year;
    setAppliedQuery({
      month: M,
      year: Y,
      payrollSectionIds: selectedSections.length > 0 ? selectedSections : null,
      designationId: null,
      employeeCodes:
        employeeCodeChips.length > 0
          ? employeeCodeChips.map(Number).filter(Boolean)
          : null,
      paymentMethodId: paymentMethodId === 0 ? null : (paymentMethodId ?? null),
    });
    setFirstSection(0);
    setIsFirstLoad(false);
  };

  // ── columns ───────────────────────────────────────────────────────────────
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
      {
        ...tableCommonProps,
        field: "breakfastAllowance",
        header: "Brf. Alw.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.breakfastAllowance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "otherAllowances",
        header: "Alw.",
        body: (r) => (
          <span className="text-sm text-center font-semibold block">
            {fmt(r.otherAllowances)}
          </span>
        ),
      },
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
    []
  );

  // ── section totals helper ─────────────────────────────────────────────────
  const sumSection = (sectionName: string, key: keyof PayrollDetailEntry) =>
    visibleData
      .filter((r) => r.sectionName === sectionName)
      .reduce((s, r) => s + (((r as any)[key] as number) || 0), 0);

  // ── grand total (all visible rows) ────────────────────────────────────────
  const NUMERIC_KEYS: (keyof PayrollDetailEntry)[] = [
    "workDays",
    "overTime",
    "totalHours",
    "hourlyRate",
    "breakfastAllowance",
    "otherAllowances",
    "totalAllowances",
    "totalSalary",
    "previousAdvance",
    "currentAdvance",
    "loanDeduction",
    "netLoan",
    "previousChallan",
    "currentChallan",
    "challanDeduction",
    "netChallan",
    "netSalaryPayable",
    "cardSalary",
    "cashSalary",
  ];
  const grandTotals = useMemo(
    () =>
      NUMERIC_KEYS.reduce(
        (acc, k) => ({
          ...acc,
          [k]: visibleData.reduce(
            (s, r) => s + (((r as any)[k] as number) || 0),
            0
          ),
        }),
        {} as Record<string, number>
      ),
    [visibleData]
  );
  const gt = (k: keyof PayrollDetailEntry) =>
    fmt((grandTotals[k as string] as number) || 0);

  // ── grand total footer column group ──────────────────────────────────────
  const footerColumnGroup =
    visibleSections.length > 1 && visibleData.length > 0 ? (
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
              footer={k === "hourlyRate" ? "-" : gt(k)}
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
          {/* remarks column */}
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

  // ── section header template ───────────────────────────────────────────────
  const rowGroupHeaderTemplate = (rowData: PayrollReportRow) => (
    <div className="border border-primary/50 py-2 px-4 bg-gray-50 flex justify-between items-center">
      <span className="font-bold text-primary text-sm uppercase">
        {rowData.sectionName || "Unassigned"}
      </span>
      <span className="text-[11px] font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase">
        {formatPayrollPeriod(appliedQuery.month, appliedQuery.year)}
      </span>
    </div>
  );

  // ── section footer template ───────────────────────────────────────────────
  const rowGroupFooterTemplate = (rowData: PayrollReportRow) => {
    const sn = rowData.sectionName;
    const sectionCount = visibleData.filter((r) => r.sectionName === sn).length;
    // Don't show a total row if there's only one record in the section
    if (sectionCount <= 1) return null;
    const s = (k: keyof PayrollDetailEntry) => fmt(sumSection(sn, k));
    const colSpan = 5; // #, Code, Full Name, ID No, Designation
    return (
      <>
        <td
          colSpan={colSpan}
          className="bg-primary-light! text-primary! font-bold! text-right! px-3! text-sm! uppercase!"
        >
          {sn} - Total :
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("workDays")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("overTime")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("totalHours")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          -
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("breakfastAllowance")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("otherAllowances")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("totalAllowances")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("totalSalary")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("previousAdvance")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("currentAdvance")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("loanDeduction")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("netLoan")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("previousChallan")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("currentChallan")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("challanDeduction")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("netChallan")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("netSalaryPayable")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("cardSalary")}
        </td>
        <td className="bg-primary-light! text-primary! font-bold! text-center! text-sm!">
          {s("cashSalary")}
        </td>
        <td className="bg-primary-light!" />
      </>
    );
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* ── header ─────────────────────────────────────────────────────────── */}
      <div className="print:hidden">
        <TitleHeader
          title="PAYROLL REPORT"
          onBack={() => router.replace("/reports")}
          icon={<i className="fa-light fa-money-check-dollar-pen text-xl!" />}
          renderInput={() => (
            <div className="flex items-center gap-5">
              <ExportOptions
                exportCSV={() => {
                  if (allRows.length === 0) return;
                  exportPayrollCSV(
                    allRows as ExportPayrollReportRow[],
                    appliedQuery.month,
                    appliedQuery.year
                  );
                }}
                exportExcel={() => {
                  if (allRows.length === 0) return;
                  exportPayrollExcel(
                    allRows as ExportPayrollReportRow[],
                    appliedQuery.month,
                    appliedQuery.year
                  );
                }}
                buttonClassName="w-full lg:w-28 h-10! border-2 border-white! text-white!"
              />
              <Button
                size="small"
                label="Print"
                icon="pi pi-print"
                variant="outlined"
                onClick={() => {
                  if (allRows.length === 0) return;

                  const appliedPaymentMethodName = appliedQuery.paymentMethodId
                    ? paymentMethodOptions.find(
                        (p) => p.value === appliedQuery.paymentMethodId
                      )?.label || null
                    : null;

                  let sectionOrDesignationName = null;
                  if (
                    appliedQuery.payrollSectionIds &&
                    appliedQuery.payrollSectionIds.length > 0
                  ) {
                    const sectionNames = globalData.payrollSections
                      .filter((s: any) =>
                        appliedQuery.payrollSectionIds!.includes(s.id)
                      )
                      .map((s: any) => s.nameEn)
                      .join(", ");
                    sectionOrDesignationName = sectionNames || null;
                  } else if (appliedQuery.designationId) {
                    sectionOrDesignationName = globalData.designations.find(
                      (d: any) => d.id === appliedQuery.designationId
                    )?.nameEn;
                  }

                  printPayrollReport(
                    allRows,
                    appliedQuery.month,
                    appliedQuery.year,
                    {
                      paymentMethodName: appliedPaymentMethodName,
                      sectionOrDesignationName,
                      employeeCodes:
                        appliedQuery.employeeCodes?.map(String) || null,
                    }
                  );
                }}
                className="w-full lg:w-28 h-10! bg-white!"
              />
            </div>
          )}
        />

        {/* ── filters ──────────────────────────────────────────────────────── */}
        <div className="bg-theme-primary-light px-6 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-center">
          <Input
            type="month"
            className="w-full h-10!"
            placeholder="Select Month"
            disabled={isLoading}
            value={`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}`}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split("-").map(Number);
              setMonthYear({ month: m, year: y });
            }}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                if (!e?.target) return;
                if (!e?.target?.value) return;
                const [y, m] = e?.target?.value?.split?.("-")?.map?.(Number);
                handleRefresh({ month: m, year: y });
              }
            }}
          />
          <AutoScrollChips
            keyfilter="int"
            value={employeeCodeChips}
            allowDuplicate={false}
            placeholder="Employee Codes"
            className="w-full h-10!"
            onChange={(e) => setEmployeeCodeChips(e.value ?? [])}
          />
          <ModifiedMultiSelect
            options={sectionOptions}
            selectedItem={selectedSections}
            setSelectedItem={setSelectedSections}
            placeholder="Select Payroll Sections"
            className="w-full h-10.5!"
            filter
            small
            showClear
          />
          <Dropdown
            filter
            options={paymentMethodOptions}
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.value ?? null)}
            className="w-full h-10!"
            placeholder="Payment Method"
          />
          <Button
            size="small"
            label="Refresh"
            loading={isLoading}
            className="w-full h-10!"
            onClick={() => handleRefresh()}
            icon={isLoading ? undefined : "pi pi-refresh"}
          />
        </div>
      </div>

      {/* ── section paginator ─────────────────────────────────────────────── */}
      <div className="px-6 py-3 print:hidden flex flex-col md:flex-row justify-between items-center gap-3 bg-white border-b border-gray-100">
        <span className="text-sm text-gray-500 font-medium order-2 md:order-1">
          Showing{" "}
          <span className="text-primary font-bold">
            {Math.min(firstSection + 1, sections.length)}
          </span>{" "}
          –{" "}
          <span className="text-primary font-bold">
            {Math.min(firstSection + sectionsPerPage, sections.length)}
          </span>{" "}
          of <span className="text-primary font-bold">{sections.length}</span>{" "}
          sections
          {allRows.length > 0 && (
            <>
              {" "}
              &nbsp;·&nbsp;{" "}
              <span className="text-primary font-bold">
                {allRows.length}
              </span>{" "}
              employees
            </>
          )}
        </span>
        <Paginator
          rows={sectionsPerPage}
          first={firstSection}
          totalRecords={sections.length}
          rowsPerPageOptions={[1, 3, 5, 10]}
          onPageChange={(e) => {
            setFirstSection(e.first);
            setSectionsPerPage(e.rows);
            contentRef.current
              ?.querySelector(".p-datatable-wrapper")
              ?.scrollTo({ top: 0, behavior: "smooth" });
          }}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          className="paginator-sm border-none! p-0! order-1 md:order-2 bg-transparent!"
        />
      </div>

      {/* ── table ────────────────────────────────────────────────────────── */}
      <div ref={contentRef} className="flex-1 min-h-0 bg-white">
        <Table
          dataKey="id"
          extraSmall
          showGridlines
          stripedRows
          data={visibleData}
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
          emptyMessage={
            isFirstLoad
              ? "Select a month and click Refresh to load data."
              : reportResponse?.message ||
                "No payroll data found for the selected filters."
          }
          scrollable
          scrollHeight="calc(100vh - 310px)"
        />
      </div>
    </div>
  );
};

export default PayrollReportPage;
