"use client";

import React from "react";
import { classNames } from "primereact/utils";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";

export interface RadioOption {
  label: string;
  value: any;
}

export interface RadioGroupProps {
  label?: string;
  value?: any;
  onChange?: (value: any) => void;
  options: RadioOption[];
  disabled?: boolean;
  className?: string;
  error?: string;
  name?: string;
  inline?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = "",
  error,
  name,
  inline = true,
}) => {
  const handleChange = (e: RadioButtonChangeEvent) => {
    if (onChange) {
      onChange(e.value);
    }
  };

  return (
    <div className={classNames("space-y-1", className)}>
      {label && <label className={`block text-sm ml-1 mb-2`}>{label}</label>}
      <div
        className={classNames("flex gap-4", {
          "flex-row items-center": inline,
          "flex-col items-start": !inline,
        })}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioButton
              inputId={`${name}-${option.value}`}
              name={name}
              value={option.value}
              onChange={handleChange}
              checked={value === option.value}
              disabled={disabled}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={classNames("text-sm cursor-pointer select-none", {
                "text-gray-400 cursor-not-allowed": disabled,
              })}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      )}
    </div>
  );
};

export default RadioGroup;
