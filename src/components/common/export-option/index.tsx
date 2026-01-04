import { Button } from "@/components/forms";
import { Menu } from "primereact/menu";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import { useRef } from "react";

const ExportOptions = ({
  exportCSV,
  exportExcel,
  // exportPdf,
}: {
  exportCSV: () => void;
  exportExcel: () => void;
  // exportPdf: () => void;
}) => {
  const menuRight = useRef<Menu | null>(null);

  const exportOptions = [
    {
      label: "CSV",
      icon: "fa-regular fa-file-csv text-xl!",
      command: () => {
        exportCSV();
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
            <p className="font-medium text-base">{item.label}</p>
          </div>
        );
      },
    },
    {
      label: "Excel",
      icon: "fa-regular fa-file-xls text-xl!",
      command: () => {
        exportExcel();
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
            <p className="font-medium text-base">{item.label}</p>
          </div>
        );
      },
    },
    // {
    //   label: "PDF",
    //   icon: "fa-regular fa-file-pdf text-xl!",
    //   command: () => {
    //     exportPdf();
    //   },
    //   template: (item: MenuItem, options: MenuItemOptions) => {
    //     return (
    //       <div
    //         onClick={(e) => options.onClick(e)}
    //         className={classNames(
    //           options.className,
    //           "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-xl"
    //         )}
    //       >
    //         <span
    //           className={classNames(item.icon, "mr-2 text-theme-red")}
    //         ></span>
    //         <p className="font-medium text-base">{item.label}</p>
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <>
      <Button
        size="small"
        label="Export"
        variant="outlined"
        icon="pi pi-download lg:text-lg!"
        className="w-26! lg:w-28! h-10! rounded-lg!"
        onClick={(event) => menuRight?.current?.toggle?.(event)}
      />
      <Menu
        popup
        ref={menuRight}
        model={exportOptions}
        id="popup_menu_right"
        popupAlignment="right"
        className="mt-2 shadow-lg rounded-xl! p-0!"
      />
    </>
  );
};

export default ExportOptions;
