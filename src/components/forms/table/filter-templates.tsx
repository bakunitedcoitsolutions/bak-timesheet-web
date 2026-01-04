"use client";
import React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import {
  TriStateCheckbox,
  TriStateCheckboxChangeEvent,
} from "primereact/tristatecheckbox";
import { InputText } from "primereact/inputtext";
import { ColumnFilterElementTemplateOptions } from "primereact/column";
import { Tag } from "primereact/tag";
import Input from "../input";

interface FilterOption {
  label: string;
  value: any;
  severity?: "success" | "info" | "warning" | "danger" | null;
}

/**
 * Dropdown filter template for single selection
 */
export const dropdownFilterTemplate = (
  options: ColumnFilterElementTemplateOptions,
  filterOptions: FilterOption[],
  itemTemplate?: (option: FilterOption) => React.ReactNode
) => {
  return (
    <Dropdown
      value={options.value}
      options={filterOptions}
      onChange={(e: DropdownChangeEvent) =>
        options.filterApplyCallback(e.value)
      }
      itemTemplate={itemTemplate}
      placeholder="Select One"
      className="p-column-filter"
      showClear
      style={{ minWidth: "12rem" }}
    />
  );
};

/**
 * Multi-select filter template for multiple selection
 */
export const multiSelectFilterTemplate = (
  options: ColumnFilterElementTemplateOptions,
  filterOptions: any[],
  itemTemplate?: (option: any) => React.ReactNode,
  optionLabel: string = "name"
) => {
  return (
    <MultiSelect
      value={options.value}
      options={filterOptions}
      itemTemplate={itemTemplate}
      onChange={(e: MultiSelectChangeEvent) =>
        options.filterApplyCallback(e.value)
      }
      optionLabel={optionLabel}
      placeholder="Any"
      className="p-column-filter"
      maxSelectedLabels={1}
      style={{ minWidth: "14rem" }}
    />
  );
};

/**
 * Boolean filter template using TriStateCheckbox
 */
export const booleanFilterTemplate = (
  options: ColumnFilterElementTemplateOptions
) => {
  return (
    <TriStateCheckbox
      value={options.value}
      onChange={(e: TriStateCheckboxChangeEvent) =>
        options.filterApplyCallback(e.value)
      }
    />
  );
};

/**
 * Text filter template
 */
export const textFilterTemplate = (
  options: ColumnFilterElementTemplateOptions,
  placeholder: string = "Search"
) => {
  return (
    <InputText
      value={options.value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        options.filterApplyCallback(e.target.value)
      }
      placeholder={placeholder}
      className="p-column-filter"
    />
  );
};

/**
 * Small text filter template using custom Input component
 */
export const smallTextFilterTemplate = (
  options: ColumnFilterElementTemplateOptions,
  placeholder: string = "Search",
  icon?: string
) => {
  return (
    <Input
      small
      icon={icon ?? "pi pi-search text-text-gray!"}
      iconPosition="left"
      value={options.value || ""}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        options.filterApplyCallback(e.target.value)
      }
      placeholder={placeholder}
      className="p-column-filter placeholder:text-text-gray!"
      style={{ width: "100%", maxWidth: "100%" }}
    />
  );
};

/**
 * Status filter template with tags
 */
export const statusFilterTemplate = (
  options: ColumnFilterElementTemplateOptions,
  statuses: string[],
  getSeverity?: (
    status: string
  ) => "success" | "info" | "warning" | "danger" | null
) => {
  const statusItemTemplate = (option: string) => {
    return <Tag value={option} severity={getSeverity?.(option)} />;
  };

  return dropdownFilterTemplate(
    options,
    statuses.map((s) => ({ label: s, value: s })),
    (option) => statusItemTemplate(option.value)
  );
};
