"use client";
import { InputTextarea, InputTextareaProps } from "primereact/inputtextarea";

interface ModifiedTextareaProps extends Omit<InputTextareaProps, "className"> {
  label?: string;
  className?: string;
  error?: string;
}

export default function ModifiedTextarea({
  label,
  className = "",
  error,
  ...rest
}: ModifiedTextareaProps) {
  const finalClassName = `${className} ${error ? "p-invalid" : ""}`.trim();

  const textareaElement = (
    <InputTextarea className={finalClassName} {...rest} />
  );

  if (label) {
    return (
      <div className="space-y-1">
        <label htmlFor={rest.id} className={`block text-sm ml-1 mb-1`}>
          {label}
        </label>
        {textareaElement}
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
        {textareaElement}
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      </div>
    );
  }

  return textareaElement;
}
