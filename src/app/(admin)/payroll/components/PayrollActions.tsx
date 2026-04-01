import { useRef } from "react";
import { Menu } from "primereact/menu";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { classNames } from "primereact/utils";
import { Button } from "@/components";
import { PayrollEntry } from "@/utils/types";
import { isBeforeCutoff } from "../helpers";

interface PayrollActionsProps {
  payroll: PayrollEntry;
  onView: (payroll: PayrollEntry) => void;
  onRecalculate: (payroll: PayrollEntry) => void;
  onPost: (payroll: PayrollEntry) => void;
  onRepost: (payroll: PayrollEntry, isRefresh: boolean) => void;
  showExtraActions?: boolean;
}

export const PayrollActions = ({
  payroll,
  onView,
  onPost,
  onRepost,
  onRecalculate,
  showExtraActions = true,
}: PayrollActionsProps) => {
  const menuRef = useRef<Menu | null>(null);
  const payrollStatus = payroll.status;

  const menuItems: MenuItem[] =
    payrollStatus === "Pending" || payrollStatus === "Revision"
      ? [
          {
            label: "Recalculate",
            icon: "pi pi-calculator text-xl!",
            command: () => onRecalculate(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-2xl border-b border-gray-200"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#1A8CDE]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
          {
            label: "Post",
            icon: "pi pi-check-circle",
            command: () => onPost(payroll),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer border-b border-gray-200"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-theme-green!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
          {
            label: "Refresh",
            icon: "pi pi-replay",
            command: () => onRepost(payroll, true),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-2xl"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#FFA617]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
        ]
      : [
          {
            label: "Unpost",
            icon: "pi pi-replay",
            command: () => onRepost(payroll, false),
            template: (item: MenuItem, options: MenuItemOptions) => (
              <div
                onClick={(e) => options.onClick(e)}
                className={classNames(
                  options.className,
                  "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-t-2xl rounded-b-2xl"
                )}
              >
                <span
                  className={classNames(item.icon, "mr-2 text-[#FFA617]!")}
                ></span>
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ),
          },
        ];

  const hideActions = isBeforeCutoff(payroll.year, payroll.month);

  return (
    <div className="flex relative items-center justify-center gap-2">
      <Button
        label="View"
        size="small"
        onClick={() => onView(payroll)}
        className="w-14 border-none! shadow-none! h-8 justify-center items-center bg-primary-light! text-primary!"
      />
      {showExtraActions && !hideActions && (
        <>
          <div
            className="absolute w-7 h-7 cursor-pointer -right-[5px] top-[60%] -translate-y-[50%] z-1 justify-center items-center"
            onClick={(e) => menuRef.current?.toggle(e)}
          >
            <i className="pi pi-ellipsis-v text-primary"></i>
          </div>
          <Menu
            popup
            ref={menuRef}
            model={menuItems}
            popupAlignment="right"
            className="mt-2 shadow-lg rounded-lg p-1 min-w-[150px]"
          />
        </>
      )}
    </div>
  );
};
