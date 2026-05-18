"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { classNames } from "primereact/utils";
import { Table, Button, Dropdown, TableColumn, TypeBadge } from "@/components";
import {
  months,
  branches,
  ProjectExpense,
  expensesByProject,
} from "@/utils/dummy";

const ExpensesTable = () => {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-12");

  // Filter expenses by status
  const filteredExpenses = useMemo(() => {
    if (statusFilter === "all") return expensesByProject;
    return expensesByProject.filter(
      (expense) => expense.status === statusFilter
    );
  }, [statusFilter]);

  // Format expenses to SAR format
  const formatExpenses = (amount: number) => {
    if (amount >= 1000) {
      return `SAR ${(amount / 1000).toFixed(1)}k`;
    }
    return `SAR ${amount.toLocaleString()}`;
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
          <div className="flex min-w-64 items-center gap-3">
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
          <div className="flex flex-1 lg:flex-none w-full lg:w-auto items-center gap-3">
            <Button
              iconPosition="left"
              icon="pi pi-th-large"
              onClick={() => setStatusFilter("all")}
              variant={statusFilter === "all" ? "solid" : "outlined"}
              className="focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!"
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "solid" : "outlined"}
              icon="pi pi-check-circle"
              iconPosition="left"
              onClick={() => setStatusFilter("active")}
              className={classNames(
                "border-theme-green! focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!",
                {
                  "bg-theme-green! hover:text-white!":
                    statusFilter === "active",
                  "bg-theme-light-green! text-theme-green! hover:text-theme-green!":
                    statusFilter !== "active",
                }
              )}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "solid" : "outlined"}
              icon="pi pi-times-circle"
              iconPosition="left"
              onClick={() => setStatusFilter("inactive")}
              className={classNames(
                "border-theme-red! focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!",
                {
                  "bg-theme-red! hover:text-white!":
                    statusFilter === "inactive",
                  "bg-theme-light-red! text-theme-red! hover:text-theme-red!":
                    statusFilter !== "inactive",
                }
              )}
            >
              Inactive
            </Button>
          </div>
          <div className="flex flex-1 lg:flex-none w-full lg:w-auto items-center gap-3">
            <div className="flex flex-1 lg:flex-none">
              <Dropdown
                small
                className="w-full"
                options={branches}
                placeholder="All Branches"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.value)}
              />
            </div>
            <div className="flex flex-1 lg:flex-none">
              <Dropdown
                small
                options={months}
                className="w-full"
                placeholder="Dec 2025"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={filteredExpenses}
        columns={columns}
        globalSearch={false}
        pagination={false}
        dataKey="id"
        emptyMessage="No projects found."
        tableClassName="custom-header"
      />
    </div>
  );
};

export default ExpensesTable;
