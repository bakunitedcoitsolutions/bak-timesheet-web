"use client";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { classNames } from "primereact/utils";

interface FilePickerProps {
  label?: string;
  className?: string;
  error?: string;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: File[]) => void;
  value?: File[];
  disabled?: boolean;
}

export default function FilePicker({
  label,
  error,
  className = "",
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  value,
  disabled = false,
}: FilePickerProps) {
  const [files, setFiles] = useState<File[]>(value || []);

  // Sync internal state with value prop
  useEffect(() => {
    if (value !== undefined) {
      setFiles(value);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      setFiles(newFiles);
      onFileSelect?.(newFiles);
    },
    [files, multiple, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFileSelect?.(newFiles);
  };

  const renderFilePicker = () => {
    return (
      <div className="flex flex-col gap-3">
        <div
          {...getRootProps()}
          className={classNames(
            "border border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3",
            {
              "border-primary bg-primary-light": isDragActive,
              "border-primary bg-primary-light/40": !isDragActive,
              "opacity-50 cursor-not-allowed": disabled,
            },
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-row items-center gap-3">
            <i className="pi pi-cloud-upload text-2xl! text-primary"></i>
            <div className="text-center">
              <span className="text-[15px] text-gray-700">
                Drop your files here or{" "}
              </span>
              <span className="text-[15px] text-primary font-semibold cursor-pointer hover:underline">
                browse files
              </span>
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <i className="fa-light fa-file text-lg text-gray-600 shrink-0"></i>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                    type="button"
                  >
                    <i className="pi pi-times text-red-500"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (label) {
    return (
      <div className="space-y-1">
        <label className="block text-[15px] ml-1 mb-1">{label}</label>
        {renderFilePicker()}
        {error && (
          <small className="text-red-500 text-xs block mt-1 ml-1">
            {error}
          </small>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {renderFilePicker()}
        <small className="text-red-500 text-xs block mt-1 ml-1">{error}</small>
      </div>
    );
  }

  return renderFilePicker();
}
