"use client";
import { InputText, InputTextProps } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ReactNode } from "react";

interface ModifiedInputProps extends Omit<InputTextProps, "className"> {
  label?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  small?: boolean;
  className?: string;
  error?: string;
}

export default function ModifiedInput({
  label,
  icon,
  iconPosition = "left",
  small = false,
  className = "",
  error,
  ...rest
}: ModifiedInputProps) {
  const isSmall = small;
  const smallClass = isSmall ? "input-small" : "";
  const finalClassName =
    `${smallClass} ${className} ${error ? "p-invalid" : ""}`.trim();

  const inputElement = <InputText className={finalClassName} {...rest} />;

  const inputWithIcon =
    iconPosition === "left" && icon ? (
      <IconField iconPosition={iconPosition}>
        <InputIcon className={icon} />
        {inputElement}
      </IconField>
    ) : iconPosition === "right" && icon ? (
      <IconField iconPosition={iconPosition}>
        {inputElement}
        <InputIcon className={icon} />
      </IconField>
    ) : (
      inputElement
    );

  if (label) {
    return (
      <div className="space-y-1">
        <label htmlFor={rest.id} className={`block text-sm ml-1 mb-1`}>
          {label}
        </label>
        {inputWithIcon}
        {error && (
          <small className="text-error text-xs block mt-1.5 ml-1">
            {error}
          </small>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {inputWithIcon}
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      </div>
    );
  }

  return inputWithIcon;
}
