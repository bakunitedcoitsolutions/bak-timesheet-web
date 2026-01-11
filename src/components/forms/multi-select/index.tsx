"use client";
import {
  MultiSelect,
  MultiSelectProps,
  MultiSelectChangeEvent,
} from "primereact/multiselect";
import { classNames } from "primereact/utils";

interface MultiSelectOption {
  label: string;
  value: any;
  [key: string]: any;
}

interface ModifiedMultiSelectProps extends Omit<MultiSelectProps, "onChange"> {
  label?: string;
  error?: string;
  options: MultiSelectOption[];
  small?: boolean;
  placeholder: string;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}

export default function ModifiedMultiSelect({
  label,
  error,
  options,
  small = false,
  placeholder,
  selectedItem,
  setSelectedItem,
  className = "",
  ...rest
}: ModifiedMultiSelectProps) {
  const isSmall = small || className?.includes("multi-select-small") || false;
  const textSizeClass = isSmall ? "text-sm" : "";
  const cn = classNames(
    {
      "multi-select-small": isSmall,
    },
    className
  );

  const valueTemplate = (option: MultiSelectOption | null, props: any) => {
    if (option) {
      return (
        <div className={`flex align-items-center ${textSizeClass}`}>
          <span className="truncate">{option.label}</span>
        </div>
      );
    }

    return <span className={textSizeClass}>{props.placeholder}</span>;
  };

  const itemTemplate = (option: MultiSelectOption) => {
    return (
      <div className={`flex align-items-center ${textSizeClass}`}>
        <span className="truncate">{option.label}</span>
      </div>
    );
  };

  const handleChange = (e: MultiSelectChangeEvent) => {
    setSelectedItem(e.value);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={rest.id} className={`block text-sm ml-1 mb-1`}>
          {label}
        </label>
      )}
      <MultiSelect
        options={options}
        filterDelay={400}
        value={selectedItem}
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        onChange={handleChange}
        className={cn}
        panelClassName={isSmall ? "multi-select-small-panel" : undefined}
        {...rest}
      />
      {error && (
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      )}
    </div>
  );
}
