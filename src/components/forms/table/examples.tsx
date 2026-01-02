"use client";
/**
 * Example usage of the CustomTable component
 * 
 * This file demonstrates various ways to use the CustomTable component
 * with different filter types, sorting, and custom templates.
 */

import React, { useState } from "react";
import { Table, TableColumn } from "@/components";
import {
  dropdownFilterTemplate,
  multiSelectFilterTemplate,
  booleanFilterTemplate,
  textFilterTemplate,
  statusFilterTemplate,
} from "./filter-templates";
import { Tag } from "primereact/tag";

// Example data types
interface ExampleData {
  id: number;
  name: string;
  status: string;
  country: string;
  verified: boolean;
  amount: number;
}

// Example 1: Basic table with text filters
export const BasicTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
      filterable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      filterable: true,
    },
    {
      field: "country",
      header: "Country",
      sortable: true,
      filterable: true,
    },
  ];

  return <Table data={data} columns={columns} />;
};

// Example 2: Table with custom body templates and status filter
export const StatusTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);

  const getSeverity = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData: ExampleData) => {
    return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
  };

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterType: "custom",
      filterElement: (options) =>
        statusFilterTemplate(options, ["active", "inactive"], getSeverity),
      body: statusBodyTemplate,
    },
  ];

  return <Table data={data} columns={columns} />;
};

// Example 3: Table with boolean filter
export const BooleanFilterTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);

  const verifiedBodyTemplate = (rowData: ExampleData) => {
    return (
      <i
        className={`pi ${
          rowData.verified ? "pi-check-circle text-green-500" : "pi-times-circle text-red-500"
        }`}
      />
    );
  };

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "verified",
      header: "Verified",
      dataType: "boolean",
      filterable: true,
      filterType: "boolean",
      filterElement: booleanFilterTemplate,
      body: verifiedBodyTemplate,
    },
  ];

  return <Table data={data} columns={columns} />;
};

// Example 4: Table with dropdown filter
export const DropdownFilterTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      filterable: true,
      filterType: "dropdown",
      filterElement: (options) => dropdownFilterTemplate(options, statusOptions),
    },
  ];

  return <Table data={data} columns={columns} />;
};

// Example 5: Table with multiple sorting
export const MultipleSortTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
    },
    {
      field: "amount",
      header: "Amount",
      sortable: true,
    },
  ];

  return <Table data={data} columns={columns} sortMode="multiple" />;
};

// Example 6: Table with row selection
export const SelectionTableExample = () => {
  const [data] = useState<ExampleData[]>([
    { id: 1, name: "John Doe", status: "active", country: "USA", verified: true, amount: 1000 },
    { id: 2, name: "Jane Smith", status: "inactive", country: "UK", verified: false, amount: 2000 },
  ]);
  const [selectedRows, setSelectedRows] = useState<ExampleData[]>([]);

  const columns: TableColumn<ExampleData>[] = [
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
    },
  ];

  return (
    <Table
      data={data}
      columns={columns}
      selectionMode="multiple"
      selection={selectedRows}
      onSelectionChange={(selection) => setSelectedRows(selection as ExampleData[])}
    />
  );
};

