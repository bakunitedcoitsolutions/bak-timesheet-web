"use client";
import {
  Dropdown,
  DropdownProps,
  DropdownChangeEvent,
} from "primereact/dropdown";

interface DropdownOption {
  label: string;
  value: any;
  [key: string]: any;
}

interface ModifiedDropdownProps extends Omit<DropdownProps, "onChange"> {
  label?: string;
  error?: string;
  options: DropdownOption[];
  small?: boolean;
  placeholder: string;
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}

export default function ModifiedDropdown({
  label,
  error,
  options,
  small = false,
  placeholder,
  selectedItem,
  setSelectedItem,
  className = "",
  ...rest
}: ModifiedDropdownProps) {
  const isSmall = small || className?.includes("dropdown-small") || false;
  const textSizeClass = isSmall ? "text-sm" : "";

  const valueTemplate = (option: DropdownOption | null, props: any) => {
    if (option) {
      return (
        <div className={`flex align-items-center ${textSizeClass}`}>
          <span>{option.label}</span>
        </div>
      );
    }

    return <span className={textSizeClass}>{props.placeholder}</span>;
  };

  const itemTemplate = (option: DropdownOption) => {
    return (
      <div className={`flex align-items-center ${textSizeClass}`}>
        <span>{option.label}</span>
      </div>
    );
  };

  const handleChange = (e: DropdownChangeEvent) => {
    setSelectedItem(e.value);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={rest.id} className={`block text-[15px] ml-1 mb-1`}>
          {label}
        </label>
      )}
      <Dropdown
        options={options}
        filterDelay={400}
        value={selectedItem}
        optionLabel="label"
        className={className}
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        valueTemplate={valueTemplate}
        panelClassName={isSmall ? "dropdown-small-panel" : undefined}
        onChange={handleChange}
        {...rest}
      />
      {error && (
        <small className="text-red-500 text-xs block mt-1 ml-1">{error}</small>
      )}
    </div>
  );
}
