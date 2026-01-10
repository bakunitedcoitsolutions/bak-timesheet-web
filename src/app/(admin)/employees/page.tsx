"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Input,
  Table,
  Button,
  Dropdown,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { designationOptions, employees } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

type Employee = {
  empCode: string;
  empIdNo: string;
  empNameEn: string;
  empNameAr: string;
  empGender: string;
  empPicture?: string;
  empContactNo: string;
  empIsFixed?: boolean;
  empProfession: string;
  empHourlyRate: string;
  empDesignation: string;
  empNationality: string;
  empCardDocLink?: string;
  empPayrollSection: string;
  empOpeningBalance: string;
  empIsCardDelivered?: boolean;
};

const columns = (
  handlePrint: (employee: Employee) => void,
  handleEdit: (employee: Employee) => void,
  handleDelete: (employee: Employee) => void
): TableColumn<Employee>[] => [
  {
    field: "empCode",
    header: "Emp. Code",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <div className="flex items-center gap-5">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
          {rowData?.empPicture ? (
            <Image
              width={48}
              height={48}
              src={rowData.empPicture}
              alt={rowData.empNameEn || "Employee"}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <i className="pi pi-user text-gray-400 text-xl"></i>
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-primary underline cursor-pointer">
          {rowData.empCode}
        </span>
      </div>
    ),
  },
  {
    field: "empNameEn",
    header: "Name (En)",
    ...commonColumnProps,
    style: { minWidth: "25rem" },
    body: (rowData) => (
      <span className="text-sm uppercase font-medium whitespace-nowrap">
        {rowData.empNameEn}
      </span>
    ),
  },
  {
    field: "empNameAr",
    header: "Name (Ar)",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-sm text-right font-medium">
          {rowData.empNameAr}
        </span>
      </div>
    ),
  },
  {
    field: "empGender",
    header: "Gender",
    style: { minWidth: 100 },
    filterable: false,
    sortable: true,
    body: (rowData: Employee) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm">
          {rowData.empGender === "Male" ? "M" : "F"}
        </span>
      </div>
    ),
  },
  {
    field: "empIdNo",
    header: "ID No.",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empIdNo}</span>
    ),
  },
  {
    field: "empDesignation",
    header: "Designation",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empDesignation}</span>
    ),
  },
  {
    field: "empPayrollSection",
    header: "Payroll Sect.",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empPayrollSection}</span>
    ),
  },
  {
    field: "empProfession",
    header: "Profession",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empProfession}</span>
    ),
  },
  {
    field: "empHourlyRate",
    header: "Hourly Rate",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empHourlyRate}</span>
    ),
  },
  {
    field: "empOpeningBalance",
    header: "Opening Balance",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empOpeningBalance}</span>
    ),
  },
  {
    field: "empNationality",
    header: "Nationality",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empNationality}</span>
    ),
  },
  {
    field: "empContactNo",
    header: "Contact No.",
    ...commonColumnProps,
    body: (rowData: Employee) => (
      <span className="text-sm">{rowData.empContactNo}</span>
    ),
  },
  {
    field: "empIsFixedEmp",
    header: "Fixed?",
    sortable: false,
    filterable: false,
    style: { minWidth: 100 },
    body: (rowData: Employee) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.empIsFixed ? "Yes" : "No"}
        </span>
      </div>
    ),
  },
  {
    field: "empIsCardDelivered",
    header: "Card Delivered?",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: Employee) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.empIsCardDelivered ? "Yes" : "No"}
        </span>
      </div>
    ),
  },
  {
    field: "empCardDocLink",
    header: "ID Card",
    sortable: false,
    filterable: false,
    style: { minWidth: 100 },
    body: (rowData: Employee) => (
      <div className="w-full flex flex-1 justify-center">
        {rowData.empCardDocLink ? (
          <span className="text-sm text-center text-primary underline cursor-pointer">
            View
          </span>
        ) : (
          <span className="text-sm text-center text-text-gray">N/A</span>
        )}
      </div>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: Employee) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        beforeActions={[
          {
            icon: "pi pi-print text-lg!",
            label: "Print",
            severity: "secondary",
            onClick: handlePrint,
            tooltip: "Print",
          },
        ]}
      />
    ),
  },
];

const EmployeesPage = () => {
  const router = useRouter();
  const [selectedDesignation, setSelectedDesignation] = useState<any>("0");

  const handlePrint = (employee: Employee) => {
    console.log("Print employee:", employee);
    // TODO: Implement print functionality
    // You can open a print dialog or generate a PDF
  };

  const handleEdit = (employee: Employee) => {
    console.log("Edit employee:", employee);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/employees/${employee.empCode}/edit`);
  };

  const handleDelete = (employee: Employee) => {
    console.log("Delete employee:", employee);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${employee.empNameEn}?`)) {
      // Delete logic here
      // Example: deleteEmployee(employee.id);
    }
  };

  const renderHeader = ({
    value,
    onChange,
    exportCSV,
    exportExcel,
  }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="w-full md:w-auto">
          <Dropdown
            small
            filter
            className="w-full"
            options={designationOptions}
            placeholder="Select Designation"
            selectedItem={selectedDesignation}
            setSelectedItem={setSelectedDesignation}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
          </div>
          <div className="w-full md:w-auto">
            <Input
              small
              className="w-full"
              value={value}
              icon="pi pi-search"
              iconPosition="left"
              onChange={onChange}
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Employee Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage employee records, personal information, and employment
            details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="New Employee"
            onClick={() => router.push("/employees/new")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <Table
          dataKey="id"
          data={employees}
          columns={columns(handlePrint, handleEdit, handleDelete)}
          customHeader={renderHeader}
        />
      </div>
    </div>
  );
};

export default EmployeesPage;
