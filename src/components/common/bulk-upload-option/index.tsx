"use client";
import { useRef } from "react";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";

import { Button } from "@/components";

const BulkUploadOptions = ({
  uploadCSV,
  uploadExcel,
  downloadTemplate,
  buttonClassName,
}: {
  uploadCSV?: () => void;
  uploadExcel?: () => void;
  downloadTemplate?: () => void;
  buttonClassName?: string;
}) => {
  const menuRight = useRef<Menu | null>(null);

  const uploadOptions = [
    {
      label: "CSV",
      icon: "fa-regular fa-file-csv text-xl!",
      command: () => {
        uploadCSV?.();
      },
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-xl border-b border-gray-200"
            )}
          >
            <span
              className={classNames(item.icon, "mr-2 text-theme-green")}
            ></span>
            <p className="font-medium text-sm">{item.label}</p>
          </div>
        );
      },
    },
    {
      label: "Excel",
      icon: "fa-regular fa-file-xls text-xl!",
      command: () => {
        uploadExcel?.();
      },
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-xl border-b border-gray-200"
            )}
          >
            <span
              className={classNames(item.icon, "mr-2 text-theme-green")}
            ></span>
            <p className="font-medium text-sm">{item.label}</p>
          </div>
        );
      },
    },
    {
      label: "Download Sample",
      icon: "fa-regular fa-file-download text-xl!",
      command: () => {
        downloadTemplate?.();
      },
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-xl"
            )}
          >
            <span
              className={classNames(item.icon, "mr-2 text-theme-green")}
            ></span>
            <p className="font-medium text-sm">{item.label}</p>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        severity="success"
        className={classNames("h-10! rounded-lg!", buttonClassName)}
        icon="pi pi-cloud-upload text-lg!"
        onClick={(event) => menuRight?.current?.toggle?.(event)}
      >
        <span className="hidden text-center font-semibold min-[600px]:flex flex-1 items-center justify-center px-2">
          Bulk Upload
        </span>
        <span className="flex flex-1 justify-center items-center text-center font-semibold min-[600px]:hidden">
          Upload
        </span>
      </Button>
      <Menu
        popup
        ref={menuRight}
        model={uploadOptions}
        id="popup_menu_right"
        popupAlignment="right"
        className="mt-2 shadow-lg rounded-xl! p-0!"
      />
    </>
  );
};

export default BulkUploadOptions;
