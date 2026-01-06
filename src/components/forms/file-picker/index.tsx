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
  dropText?: string;
  browseText?: string;
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
  dropText = "Drop your files here or",
  browseText = "browse files",
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

  const openFileInNewTab = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
    // Clean up the URL after a delay to allow the browser to load it
    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 100);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Check for PDF
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return "pi-file-pdf text-xl!";
    }

    // Check for images
    if (
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|svg|webp|ico)$/i.test(fileName)
    ) {
      return "pi-image";
    }

    // Check for Word documents
    if (fileType.includes("word") || /\.(doc|docx)$/i.test(fileName)) {
      return "pi-file-word text-xl!";
    }

    // Check for Excel files
    if (
      fileType.includes("excel") ||
      fileType.includes("spreadsheet") ||
      /\.(xls|xlsx|csv)$/i.test(fileName)
    ) {
      return "pi-file-excel text-xl!";
    }

    // Default file icon
    return "pi-file text-xl!";
  };

  const renderPicker = () => {
    return (
      <div
        {...getRootProps()}
        className={classNames(
          "border border-dashed w-full rounded-xl h-[44px] px-1 md:px-5 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3",
          {
            "border-primary bg-primary-light": isDragActive,
            "border-primary bg-primary-light/40": !isDragActive,
            "opacity-50 cursor-not-allowed": disabled,
          },
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex cursor-pointer flex-row items-center gap-1.5">
          <img alt="upload" src="/assets/icons/upload-icon.svg" />
          <div className="text-center">
            <span className="text-xs">{dropText} </span>
            <span className="text-xs text-primary font-semibold">
              {browseText}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderFiles = () => {
    return (
      <div className="flex w-full flex-col gap-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}`}
            className="flex w-full items-center justify-between rounded-xl h-[44px] pl-2 pr-3 border border-primary/30  gap-x-2"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-lg">
              <i className={`pi ${getFileIcon(file)} text-primary`} />
            </div>
            <div className="flex w-full py-1 flex-col justify-center mr-1">
              <span className="text-xs font-semibold truncate">
                {file.name}
              </span>
            </div>
            <div className="flex justify-center items-center gap-x-2">
              <div
                className="cursor-pointer flex justify-center items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileInNewTab(file);
                }}
              >
                <i className="pi pi-external-link text-sm! text-[#14B8A6]" />
              </div>
              <div
                className="cursor-pointer flex justify-center items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <i className="pi pi-trash text-sm! text-error" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (label) {
    return (
      <div className="space-y-1 w-full">
        <label className="block text-sm ml-1 mb-1">{label}</label>
        {files.length === 0 && renderPicker()}
        {files.length > 0 && renderFiles()}
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
      <div className="w-full">
        {files.length === 0 && renderPicker()}
        {files.length > 0 && renderFiles()}
        <small className="text-error text-xs block mt-1.5 ml-1">{error}</small>
      </div>
    );
  }

  return (
    <div className="w-full">
      {files.length === 0 && renderPicker()}
      {files.length > 0 && renderFiles()}
    </div>
  );
}
