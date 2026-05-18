"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import numeral from "numeral";

import { ProjectExpense } from "@/utils/dummy";
import { ExpensesFilter } from "./expenses-filter";
import { StatusFilterGroup } from "./status-filter-group";
import { Table, TableColumn, TypeBadge } from "@/components";
import { useGetSiteWiseReport } from "@/lib/db/services/site-wise/requests";
import { SiteWiseReportRow } from "@/lib/db/services/site-wise/site-wise.schemas";

const ExpensesTable = () => {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedBranch, setSelectedBranch] = useState<any>("all");

  // Set default month to current month
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  // Parse month and year for sitewise report API
  const [year, month] = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split("-");
    return [parseInt(yStr, 10) || 2025, parseInt(mStr, 10) || 12];
  }, [selectedMonth]);

  // Fetch live site-wise report data (summarized by project)
  const { data: reportResponse, isLoading } = useGetSiteWiseReport(
    {
      month,
      year,
      summarize: true,
    },
    true
  );

  const rawData = useMemo(() => reportResponse?.data || [], [reportResponse]);

  // Premium construction/office Unsplash images pool for unique project representations
  const projectImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    ],
    []
  );

  // Map SiteWiseReportRow to ProjectExpense format
  const mappedExpenses = useMemo(() => {
    return rawData.map(
      (row: SiteWiseReportRow): ProjectExpense => ({
        id: row.projectId,
        name: row.projectName,
        image: projectImages[row.projectId % projectImages.length],
        status: row.isActive ? "active" : "inactive",
        expenses: row.totalSalary,
        branchId: row.branchId || null,
      })
    );
  }, [rawData, projectImages]);

  // Filter expenses by selected branch and status
  const filteredExpenses = useMemo(() => {
    let result = mappedExpenses;

    if (selectedBranch !== "all") {
      result = result.filter(
        (expense: ProjectExpense) => expense.branchId === Number(selectedBranch)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (expense: ProjectExpense) => expense.status === statusFilter
      );
    }

    return result;
  }, [mappedExpenses, selectedBranch, statusFilter]);

  // Format expenses to SAR format
  const formatExpenses = (amount: number) => {
    if (amount >= 1000) {
      return `SAR ${numeral(amount).format("0.0a")}`;
    }
    return `SAR ${numeral(amount).format("0,0")}`;
  };

  // Define table columns
  const columns: TableColumn<ProjectExpense>[] = useMemo(
    () => [
      {
        field: "name",
        header: "Projects",
        sortable: false,
        filterable: false,
        body: (rowData) => (
          <div className="flex w-full min-w-64 items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <Image
                src={rowData.image}
                alt={rowData.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-sm font-semibold">{rowData.name}</span>
          </div>
        ),
      },
      {
        field: "status",
        header: "Status",
        sortable: false,
        filterable: false,
        align: "center",
        body: (rowData) => (
          <TypeBadge
            text={rowData.status === "active" ? "Active" : "Inactive"}
            variant={rowData.status === "active" ? "success" : "danger"}
          />
        ),
      },
      {
        field: "expenses",
        header: "Expenses",
        sortable: false,
        filterable: false,
        body: (rowData) => (
          <span className="">{formatExpenses(rowData.expenses)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="bg-white w-full rounded-xl p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="text-xl text-center lg:text-left font-semibold text-gray-800">
          Expenses by Project
        </h3>
        <div className="flex flex-col flex-1 w-full lg:flex-row items-center justify-between gap-4">
          <StatusFilterGroup
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          <ExpensesFilter
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />
        </div>
      </div>

      {/* Table */}
      <div
        className={
          isLoading
            ? "h-[300px] overflow-hidden relative [&_.p-datatable-wrapper]:h-[300px] [&_.p-datatable]:h-full"
            : ""
        }
      >
        <Table
          data={filteredExpenses}
          columns={columns}
          loading={isLoading}
          globalSearch={false}
          pagination={false}
          dataKey="id"
          scrollable
          scrollHeight={isLoading ? "300px" : "500px"}
          emptyMessage="No projects found."
          tableClassName="custom-header"
        />
      </div>
    </div>
  );
};

export default ExpensesTable;
