"use client";

import { useRef } from "react";
import { Menu } from "primereact/menu";
import { useRouter, usePathname } from "next/navigation";
import { classNames } from "primereact/utils";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRight = useRef<Menu | null>(null);

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard";

    // Remove leading slash and split
    const segments = path.substring(1).split("/");

    // Get the first segment (e.g., "employees" from "/employees/123")
    const mainSection = segments[0];

    // Format: "employee-cards" -> "Employee Cards"
    return mainSection
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const pageTitle = getPageTitle(pathname);

  const menuItem = [
    {
      label: "Sign Out",
      icon: "pi pi-sign-out",
      command: () => {
        router.replace("/login");
      },
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full flex p-2 pl-4 text-primary hover:bg-primary/10 cursor-pointer"
            )}
          >
            <span className={classNames(item.icon, "mr-2")}></span>
            <span className="font-medium text-sm lg:text-base">
              {item.label}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full bg-primary-50 text-primary focus:outline-none transition-colors shadow-sm hover:bg-primary-100"
        >
          <i
            className={classNames("pi duration-200", {
              "rotate-0 pi-chevron-left": !collapsed,
              "rotate-180 pi-bars": collapsed,
            })}
          />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <h1 className="text-lg font-semibold tracking-wide">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={classNames("flex items-center cursor-pointer", {
            "justify-center": collapsed,
          })}
          onClick={(event) => menuRight?.current?.toggle?.(event)}
        >
          <img
            src="/assets/images/profile.png"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3 max-w-[150px] hidden lg:block">
            <p className="text-sm truncate font-semibold text-gray-800">
              Shariq Ahmed
            </p>
            <p className="text-xs text-primary">Admin</p>
          </div>
          <div className="ml-3">
            <i className={classNames("pi text-xs! pi-chevron-down")} />
          </div>
        </div>
        <Menu
          popup
          ref={menuRight}
          model={menuItem}
          id="popup_menu_right"
          popupAlignment="right"
          className="mt-2 shadow-lg"
        />
      </div>
    </header>
  );
}
