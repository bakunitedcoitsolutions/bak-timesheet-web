"use client";
import React, {
  useState,
  ReactNode,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  DataTable,
  DataTableProps,
  DataTableFilterMeta,
} from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode } from "primereact/api";
import { Column, ColumnProps } from "primereact/column";
import { smallTextFilterTemplate } from "./filter-templates";

export interface CustomHeaderProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  exportCSV?: () => void;
  exportExcel?: () => void;
  exportPdf?: () => void;
}

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
  filterPlaceholder?: string;
  filterIcon?: string;
  smallFilter?: boolean;
  body?: (rowData: T) => ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export interface TableRef {
  exportCSV: (selectionOnly?: boolean) => void;
  exportExcel: () => void;
  exportPdf: () => void;
  getData: () => any[];
  getFilters: () => DataTableFilterMeta;
  getGlobalFilterValue: () => string;
  onGlobalFilterChange: (value: string) => void;
  resetFilters: () => void;
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
  customHeader?: (props: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    exportCSV: (selectionOnly?: boolean) => void;
    exportExcel: () => void;
    exportPdf?: () => void;
  }) => ReactNode;
  exportable?: boolean;
  extraSmall?: boolean;
  exportColumns?: Array<{ title: string; dataKey: string }>;
}

const CustomTable = forwardRef<TableRef, CustomTableProps<any>>(
  function CustomTable<T extends Record<string, any> = Record<string, any>>(
    {
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
      customHeader,
      exportable = false,
      exportColumns,
      extraSmall = false,
      ...rest
    }: CustomTableProps<T>,
    ref: React.ForwardedRef<TableRef>
  ) {
    const [filters, setFilters] = useState<DataTableFilterMeta>({});
    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
    const dt = useRef<DataTable<any>>(null);

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

    // Export functions
    const exportCSV = (selectionOnly?: boolean) => {
      if (dt.current) {
        dt.current.exportCSV({ selectionOnly: selectionOnly || false });
      }
    };

    const exportPdf = async () => {
      try {
        // IMPORTANT: Import jspdf-autotable FIRST to extend jsPDF prototype
        await import("jspdf-autotable");

        // Then import jsPDF
        const jsPDFModule = await import("jspdf");
        const jsPDF = jsPDFModule.default;
        const doc = new jsPDF("p", "mm");
        const cols =
          exportColumns ||
          columns.map((col) => ({
            title: col.header,
            dataKey: col.field as string,
          }));

        // Map data to match column structure
        const bodyData = data.map((row: any) => {
          return cols.map((col) => {
            const value = row[col.dataKey];
            // Handle nested values, objects, and format them
            if (value === null || value === undefined) {
              return "";
            }
            if (typeof value === "object") {
              return JSON.stringify(value);
            }
            return String(value);
          });
        });

        // Use autoTable with proper format
        if (typeof (doc as any).autoTable === "function") {
          (doc as any).autoTable({
            head: [cols.map((col) => col.title)],
            body: bodyData,
          });
          doc.save("export.pdf");
        } else {
          console.error(
            "autoTable is not available. Make sure jspdf-autotable is installed."
          );
        }
      } catch (error) {
        console.error("Error exporting PDF:", error);
      }
    };

    const exportExcel = () => {
      import("xlsx").then((xlsx) => {
        // Get column mappings
        const cols =
          exportColumns ||
          columns.map((col) => ({
            title: col.header,
            dataKey: col.field as string,
          }));

        // Map data to use column headers
        const mappedData = data.map((row: any) => {
          const mappedRow: any = {};
          cols.forEach((col) => {
            mappedRow[col.title] = row[col.dataKey];
          });
          return mappedRow;
        });

        const worksheet = xlsx.utils.json_to_sheet(mappedData);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
        const excelBuffer = xlsx.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        saveAsExcelFile(excelBuffer, "export");
      });
    };

    const saveAsExcelFile = (buffer: any, fileName: string) => {
      import("file-saver").then((module) => {
        if (module && module.default) {
          const EXCEL_TYPE =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
          const EXCEL_EXTENSION = ".xlsx";
          const data = new Blob([buffer], {
            type: EXCEL_TYPE,
          });

          module.default.saveAs(
            data,
            fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION
          );
        }
      });
    };

    const renderHeader = () => {
      if (customHeader) {
        return customHeader({
          value: globalFilterValue,
          onChange: onGlobalFilterChange,
          exportCSV,
          exportExcel,
          exportPdf,
        });
      }

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

    const hasFilterableColumns = columns.some(
      (col) => col.filterable !== false
    );
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

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      exportCSV,
      exportExcel,
      exportPdf,
      getData: () => data,
      getFilters: () => filters,
      getGlobalFilterValue: () => globalFilterValue,
      onGlobalFilterChange: (value: string) => {
        const _filters = { ...filters };
        (_filters["global"] as any).value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
      },
      resetFilters: () => {
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
        setGlobalFilterValue("");
      },
    }));

    return (
      <div className="card">
        <DataTable
          ref={dt}
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
              filterPlaceholder,
              filterIcon,
              smallFilter,
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

            // Use small filter template if smallFilter is true and no custom filterElement
            const finalFilterElement =
              filterElement ||
              (smallFilter &&
              filterType !== "dropdown" &&
              filterType !== "multiselect" &&
              filterType !== "boolean"
                ? (options: any) =>
                    smallTextFilterTemplate(
                      options,
                      filterPlaceholder || "Search",
                      extraSmall ?? false,
                      filterIcon
                    )
                : undefined);

            return (
              <Column
                key={index}
                field={field as string}
                header={header}
                sortable={isSortable}
                filter={isFilterable}
                filterElement={finalFilterElement}
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
);

export default CustomTable;
