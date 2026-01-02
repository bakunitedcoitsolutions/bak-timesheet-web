"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { classNames } from "primereact/utils";
import Image from "next/image";

import {
  projects,
  stats,
  expensesByProject,
  branches,
  months,
  ProjectExpense,
} from "@/utils/dummy";
import {
  BarChart,
  Dropdown,
  PieChart,
  Button,
  Table,
  TableColumn,
} from "@/components";

const HomePage = () => {
  const [selectedProject, setSelectedProject] = useState<string>("0");
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
  const columns: TableColumn<ProjectExpense>[] = [
    {
      field: "name",
      header: "Projects",
      sortable: false,
      filterable: false,
      body: (rowData) => (
        <div className="flex items-center gap-3">
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
        <span
          className={classNames("text-sm font-semibold px-2 py-1 rounded-md", {
            "text-theme-green bg-theme-light-green":
              rowData.status === "active",
            "text-theme-red bg-theme-light-red": rowData.status === "inactive",
          })}
        >
          {rowData.status === "active" ? "Active" : "Inactive"}
        </span>
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
  ];
  return (
    <div className="flex flex-col gap-6 overflow-hidden!">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 bg-white w-full rounded-xl md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{ background: stat.bg }}
            className={classNames(
              "flex flex-1 flex-col p-4 rounded-xl h-60 justify-center items-center gap-3"
            )}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center`}
              style={{ background: stat.iconBg }}
            >
              <i className={classNames(stat.icon, "text-xl text-white")}></i>
            </div>
            <p className="text-gray-500 text-sm">{stat.title}</p>
            <h3 className="text-2xl font-semibold text-gray-800">
              {stat.value}
            </h3>
            <Link
              href={stat.link}
              className="px-3 py-2.5 text-xs rounded-md shadow-[0px_6px_24.2px_-10px_#29343D38] bg-white cursor-pointer font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl w-full p-6 col-span-1 xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Financial Overview
              </h3>
              <p className="text-gray-500 text-sm font-normal">
                Track your income and expenses over time
              </p>
            </div>
            <Dropdown
              small
              filter
              options={projects}
              placeholder="Select Project"
              selectedItem={selectedProject}
              setSelectedItem={setSelectedProject}
            />
          </div>
          <div className="h-[500px] w-full min-w-0 mt-6 relative">
            <BarChart />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div
              className={`w-12 h-12 rounded-xl bg-[#F6F7F9] flex items-center justify-center`}
            >
              <i className="fa-light fa-wave-pulse text-xl text-primary"></i>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-normal">
                Total Expenses
              </p>
              <p className="text-base font-semibold">SAR 96,640</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl w-full p-6 col-span-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Employees Breakdown
              </h3>
              <p className="text-gray-500 text-sm font-normal">Total 1824</p>
            </div>
          </div>
          <div className="h-[500px] w-full min-w-0 mt-6 relative flex items-center justify-center">
            <PieChart />
          </div>
        </div>
      </div>

      {/* Expenses by Project Table */}
      <div className="bg-white w-full rounded-xl p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Expenses by Project
            </h3>
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-3">
              <Button
                icon="pi pi-th-large"
                iconPosition="left"
                variant={statusFilter === "all" ? "solid" : "outlined"}
                onClick={() => setStatusFilter("all")}
                className="focus:shadow-none!"
              >
                All
              </Button>
              <Button
                variant={statusFilter === "active" ? "solid" : "outlined"}
                icon="pi pi-check-circle"
                iconPosition="left"
                onClick={() => setStatusFilter("active")}
                className={classNames(
                  "border-theme-green! focus:shadow-none!",
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
                className={classNames("border-theme-red! focus:shadow-none!", {
                  "bg-theme-red! hover:text-white!":
                    statusFilter === "inactive",
                  "bg-theme-light-red! text-theme-red! hover:text-theme-red!":
                    statusFilter !== "inactive",
                })}
              >
                Inactive
              </Button>
            </div>
          </div>
          {/* Right Side Dropdowns */}
          <div className="flex items-center gap-3">
            <Dropdown
              small
              options={branches}
              placeholder="All Branches"
              selectedItem={selectedBranch}
              setSelectedItem={setSelectedBranch}
            />
            <Dropdown
              small
              options={months}
              placeholder="Dec 2025"
              selectedItem={selectedMonth}
              setSelectedItem={setSelectedMonth}
            />
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
    </div>
  );
};

export default HomePage;
