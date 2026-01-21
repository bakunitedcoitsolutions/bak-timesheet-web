"use client";
import { Dropdown, DropdownProps } from "primereact/dropdown";

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
}

export default function ModifiedDropdown({
  label,
  error,
  options,
  small = false,
  placeholder,
  className = "",
  ...rest
}: ModifiedDropdownProps) {
  const isSmall = small || className?.includes("dropdown-small") || false;
  const textSizeClass = isSmall ? "text-sm" : "";

  const valueTemplate = (option: DropdownOption | null, props: any) => {
    if (option) {
      return (
        <div className={`flex align-items-center ${textSizeClass}`}>
          <span className="truncate">{option.label}</span>
        </div>
      );
    }

    return <span className={textSizeClass}>{props.placeholder}</span>;
  };

  const itemTemplate = (option: DropdownOption) => {
    return (
      <div className={`flex align-items-center ${textSizeClass}`}>
        <span className="truncate">{option.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={rest.id} className={`block text-sm ml-1 mb-1`}>
          {label}
        </label>
      )}
      <Dropdown
        options={options}
        filterDelay={400}
        optionLabel="label"
        className={className}
        placeholder={placeholder}
        itemTemplate={itemTemplate}
        valueTemplate={valueTemplate}
        panelClassName={isSmall ? "dropdown-small-panel" : undefined}
        {...rest}
      />
      {error && (
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      )}
    </div>
  );
}
