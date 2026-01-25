"use client";

import React from "react";
import { Checkbox as PrimeCheckbox } from "primereact/checkbox";
import { classNames } from "primereact/utils";

export interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: ((checked: boolean) => void) | ((e: any) => void);
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
  const handleChange = (e: any) => {
    // Handle both PrimeReact checkbox event and direct boolean
    if (typeof onChange === "function") {
      // Check if it's a PrimeReact checkbox event (has checked property)
      if (e && typeof e === "object" && "checked" in e) {
        onChange(e.checked ?? false);
      }
      // Check if it's a ChangeEvent (has target.checked)
      else if (e?.target && "checked" in e.target) {
        onChange(e.target.checked);
      }
      // Otherwise, assume it's already a boolean
      else {
        onChange(e ?? false);
      }
    }
  };

  return (
    <div className={classNames("flex items-center gap-2", className)}>
      <PrimeCheckbox
        inputId={name}
        checked={checked ?? false}
        onChange={handleChange}
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
