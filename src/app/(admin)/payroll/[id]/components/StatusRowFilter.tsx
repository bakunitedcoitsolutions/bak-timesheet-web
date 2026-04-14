"use client";

import { Dropdown } from "@/components";

interface StatusRowFilterProps {
  dataSource: { label: string; value: any }[];
  options: any;
  placeholder?: string;
  width?: string;
}

export const StatusRowFilter = ({
  options,
  dataSource,
  width = "180px",
  placeholder = "Select",
}: StatusRowFilterProps) => {
  return (
    <div style={{ width, maxWidth: width }}>
      <Dropdown
        small
        filter
        showClear
        placeholder={placeholder}
        options={dataSource}
        optionValue="value"
        value={options.value}
        className="p-column-filter"
        style={{
          height: 35,
          fontSize: 12,
          borderRadius: 12,
        }}
        pt={{
          input: {
            style: {
              padding: "6px 30px 6px 10px",
            },
          },
          clearIcon: {
            style: {
              right: 30,
            },
          },
          trigger: {
            style: {
              padding: "0 6px 0 0",
              width: "auto",
            },
          },
        }}
        onChange={(e) => options.filterApplyCallback(e.value)}
      />
    </div>
  );
};
