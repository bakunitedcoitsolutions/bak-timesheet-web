"use client";
import React, { useState, ReactNode } from "react";
import {
  DataTable,
  DataTableFilterMeta,
  DataTableProps,
} from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";

export interface TableColumn<T = any> extends Omit<
  ColumnProps,
  "field" | "header"
> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: "text" | "dropdown" | "multiselect" | "boolean" | "custom";
  filterOptions?: any[];
  filterElement?: (options: any) => ReactNode;
  body?: (rowData: T) => ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface CustomTableProps<
  T extends Record<string, any> = Record<string, any>,
> extends Omit<
  DataTableProps<T[]>,
  | "value"
  | "children"
  | "filterDisplay"
  | "sortMode"
  | "selection"
  | "onSelectionChange"
  | "onRowClick"
  | "cellSelection"
> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  globalSearch?: boolean;
  globalSearchPlaceholder?: string;
  pagination?: boolean;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  sortMode?: "single" | "multiple";
  filterDisplay?: "row" | "menu";
  emptyMessage?: string;
  dataKey?: string;
  onRowClick?: (rowData: T) => void;
  onSelectionChange?: (selection: T | T[]) => void;
  selectionMode?: "single" | "multiple" | "checkbox" | "radiobutton";
  selection?: T | T[];
  tableClassName?: string;
}

export default function CustomTable<
  T extends Record<string, any> = Record<string, any>,
>({
  data,
  columns,
  loading = false,
  globalSearch = true,
  globalSearchPlaceholder = "Keyword Search",
  pagination = true,
  rowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50, 100],
  sortMode = "multiple",
  filterDisplay = "row",
  emptyMessage = "No records found.",
  dataKey = "id",
  onRowClick,
  onSelectionChange,
  selectionMode,
  selection,
  tableClassName,
  ...rest
}: CustomTableProps<T>) {
  const [filters, setFilters] = useState<DataTableFilterMeta>({});
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  // Initialize filters based on columns
  React.useEffect(() => {
    const initialFilters: DataTableFilterMeta = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    };

    columns.forEach((column) => {
      if (column.filterable !== false && column.field) {
        const field = column.field as string;
        if (column.filterType === "boolean") {
          initialFilters[field] = {
            value: null,
            matchMode: FilterMatchMode.EQUALS,
          };
        } else if (
          column.filterType === "dropdown" ||
          column.filterType === "multiselect"
        ) {
          initialFilters[field] = {
            value: null,
            matchMode: FilterMatchMode.IN,
          };
        } else {
          initialFilters[field] = {
            value: null,
            matchMode: FilterMatchMode.STARTS_WITH,
          };
        }
      }
    });

    setFilters(initialFilters);
  }, [columns]);

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const _filters = { ...filters };
    (_filters["global"] as any).value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    if (!globalSearch) return null;

    return (
      <div className="flex justify-content-end">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder={globalSearchPlaceholder}
          />
        </IconField>
      </div>
    );
  };

  const getGlobalFilterFields = (): string[] => {
    return columns
      .filter((col) => col.filterable !== false && col.field)
      .map((col) => col.field as string);
  };

  const hasFilterableColumns = columns.some((col) => col.filterable !== false);
  const hasSortableColumns = columns.some((col) => col.sortable !== false);

  const handleRowClick = (e: any) => {
    if (onRowClick && e.data) {
      onRowClick(e.data);
    }
  };

  const handleSelectionChange = (e: any) => {
    if (onSelectionChange) {
      onSelectionChange(e.value);
    }
  };

  return (
    <div className="card">
      <DataTable
        value={data as any}
        paginator={pagination}
        rows={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        dataKey={dataKey}
        filters={hasFilterableColumns ? filters : undefined}
        filterDisplay={
          hasFilterableColumns
            ? (filterDisplay as "row" | "menu" | undefined)
            : undefined
        }
        loading={loading}
        sortMode={hasSortableColumns ? sortMode : undefined}
        globalFilterFields={getGlobalFilterFields()}
        header={renderHeader()}
        emptyMessage={emptyMessage}
        onRowClick={handleRowClick as any}
        selection={selection as any}
        selectionMode={selectionMode as any}
        onSelectionChange={handleSelectionChange as any}
        className={tableClassName}
        {...(rest as any)}
      >
        {columns.map((column, index) => {
          const {
            filterType,
            filterOptions,
            filterElement,
            filterable,
            sortable,
            body,
            field,
            header,
            style,
            className,
            ...columnProps
          } = column;

          const isFilterable = filterable !== false;
          const isSortable = sortable !== false;

          return (
            <Column
              key={index}
              field={field as string}
              header={header}
              sortable={isSortable}
              filter={isFilterable}
              filterElement={filterElement}
              body={body}
              style={style}
              className={className}
              {...columnProps}
            />
          );
        })}
      </DataTable>
    </div>
  );
}
