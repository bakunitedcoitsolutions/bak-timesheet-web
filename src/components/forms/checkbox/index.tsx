"use client";

import React from "react";
import { Checkbox as PrimeCheckbox } from "primereact/checkbox";
import { classNames } from "primereact/utils";

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  small?: boolean;
  name?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  labelClassName = "",
  small = false,
  name,
}) => {
  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <PrimeCheckbox
        inputId={name}
        checked={checked}
        onChange={(e) => onChange(e.checked ?? false)}
        disabled={disabled}
        className={small ? "scale-90" : ""}
      />
      {label && (
        <label
          htmlFor={name}
          className={classNames(
            "text-sm cursor-pointer select-none",
            small && "text-xs",
            disabled && "text-gray-400 cursor-not-allowed",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
