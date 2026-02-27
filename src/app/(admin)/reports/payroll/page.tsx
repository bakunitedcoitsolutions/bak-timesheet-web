"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Paginator } from "primereact/paginator";

import {
  Input,
  Table,
  Badge,
  Button,
  Dropdown,
  TitleHeader,
  TableColumn,
  GroupDropdown,
  AutoScrollChips,
} from "@/components";
import {
  formatNum,
  formatPayrollPeriod,
  parseGroupDropdownFilter,
} from "@/utils/helpers";
import { useGlobalData } from "@/context/GlobalDataContext";
import { useGetPayrollReport } from "@/lib/db/services/payroll-summary/requests";
import { PayrollDetailEntry } from "@/lib/db/services/payroll-summary/mappers";

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
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [employeeCodeChips, setEmployeeCodeChips] = useState<string[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null);

  // ── applied query (only updated on Refresh) ────────────────────────────────
  const [appliedQuery, setAppliedQuery] = useState<{
    month: number;
    year: number;
    payrollSectionId?: number | null;
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
      { label: "All Methods", value: null },
      ...globalData.paymentMethods.map((p) => ({
        label: p.nameEn,
        value: p.id,
      })),
    ],
    [globalData.paymentMethods]
  );

  // ── fetch ─────────────────────────────────────────────────────────────────
  const { data: reportResponse, isLoading } = useGetPayrollReport(appliedQuery);

  const allRows = useMemo(
    () => (reportResponse?.details ?? []) as PayrollReportRow[],
    [reportResponse]
  );

  // ── group by section ──────────────────────────────────────────────────────
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
  const handleRefresh = () => {
    const fp = parseGroupDropdownFilter(selectedFilter);
    setAppliedQuery({
      month: monthYear.month,
      year: monthYear.year,
      payrollSectionId: fp.payrollSectionId ?? null,
      designationId: fp.designationId ?? null,
      employeeCodes:
        employeeCodeChips.length > 0
          ? employeeCodeChips.map(Number).filter(Boolean)
          : null,
      paymentMethodId: paymentMethodId ?? null,
    });
    setFirstSection(0);
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
            {fmt(r.hourlyRate)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "breakfastAllowance",
        header: "Brf. Alw.",
        body: (r) => (
          <span className="text-sm text-center block">
            {fmt(r.breakfastAllowance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "otherAllowances",
        header: "Alw.",
        body: (r) => (
          <span className="text-sm text-center block">
            {fmt(r.otherAllowances)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "totalAllowances",
        header: "Total Alw.",
        body: (r) => (
          <span className="text-sm text-center block">
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
          <span className="text-sm text-center block">
            {fmt(r.previousAdvance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "currentAdvance",
        header: "Curr. Adv.",
        body: (r) => (
          <span className="text-sm text-center block">
            {fmt(r.currentAdvance)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "loanDeduction",
        header: "Loan Ded.",
        body: (r) => (
          <span className="text-sm text-center block">
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
          <span className="text-sm text-center block">
            {fmt(r.previousChallan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "currentChallan",
        header: "Curr. Traff.",
        body: (r) => (
          <span className="text-sm text-center block">
            {fmt(r.currentChallan)}
          </span>
        ),
      },
      {
        ...tableCommonProps,
        field: "challanDeduction",
        header: "Traff. Ded.",
        body: (r) => (
          <span className="text-sm text-center block">
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
          <span className="text-sm text-center block">{fmt(r.cardSalary)}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "cashSalary",
        header: "Cash Salary",
        body: (r) => (
          <span className="text-sm text-center block">{fmt(r.cashSalary)}</span>
        ),
      },
      {
        ...tableCommonProps,
        field: "remarks",
        header: "Remarks",
        style: { minWidth: 150 },
        body: (r) => (
          <span className="text-sm text-gray-500">{r.remarks || ""}</span>
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
    const s = (k: keyof PayrollDetailEntry) => fmt(sumSection(sn, k));
    const colSpan = 5; // #, Code, Full Name, ID No, Designation
    return (
      <>
        <td
          colSpan={colSpan}
          className="bg-table-header-footer font-bold! text-right! px-3! text-sm! uppercase! text-primary!"
        >
          {sn} - Total :
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("workDays")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("overTime")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("totalHours")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("hourlyRate")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("breakfastAllowance")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("otherAllowances")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("totalAllowances")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("totalSalary")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("previousAdvance")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("currentAdvance")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("loanDeduction")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm! text-primary!">
          {s("netLoan")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("previousChallan")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("currentChallan")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("challanDeduction")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm! text-primary!">
          {s("netChallan")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm! text-primary!">
          {s("netSalaryPayable")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("cardSalary")}
        </td>
        <td className="bg-table-header-footer font-bold! text-center! text-sm!">
          {s("cashSalary")}
        </td>
        <td className="bg-table-header-footer" />
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
            <Button
              size="small"
              label="Print"
              icon="pi pi-print"
              variant="outlined"
              onClick={() => window.print()}
              className="w-full lg:w-28 h-10! bg-white!"
            />
          )}
        />

        {/* ── filters ──────────────────────────────────────────────────────── */}
        <div className="bg-theme-primary-light px-6 py-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-center">
          <Input
            type="month"
            className="w-full h-10!"
            placeholder="Select Month"
            value={`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}`}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m] = e.target.value.split("-").map(Number);
              setMonthYear({ month: m, year: y });
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
          <GroupDropdown
            value={selectedFilter}
            className="w-full h-10.5!"
            onChange={setSelectedFilter}
            placeholder="Section / Designation"
          />
          <Dropdown
            options={paymentMethodOptions}
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.value ?? null)}
            className="w-full h-10!"
            placeholder="Payment Method"
          />
          <Button
            size="small"
            label="Refresh"
            icon={isLoading ? undefined : "pi pi-refresh"}
            loading={isLoading}
            onClick={handleRefresh}
            className="w-full h-10!"
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
          tableClassName="report-table"
          emptyMessage="No payroll data found. Select a month and click Refresh."
          scrollable
          scrollHeight="calc(100vh - 270px)"
        />
      </div>
    </div>
  );
};

export default PayrollReportPage;
