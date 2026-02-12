"use client";

import Link from "next/link";
import { useState } from "react";
import { classNames } from "primereact/utils";
import { usePathname } from "next/navigation";

interface MenuItem {
  icon: string;
  href?: string;
  label: string;
  divider?: boolean;
  items?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}
const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: "fa-regular fa-layer-group text-xl!", href: "/" },
  {
    label: "Employees",
    icon: "fa-light fa-address-card text-xl!",
    href: "/employees",
  },
  {
    label: "Timesheet",
    icon: "fa-light fa-calendar text-xl!",
    href: "/timesheet",
  },
  {
    label: "Projects",
    icon: "fa-light fa-building text-xl!",
    href: "/projects",
  },
  {
    label: "Reports",
    icon: "fa-sharp fa-light fa-file-chart-column text-xl!",
    href: "/reports",
  },
  {
    divider: true,
    label: "",
    icon: "",
  },
  { label: "Loans", icon: "fa-light fa-newspaper text-xl!", href: "/loans" },
  {
    label: "Traffic Voilations",
    icon: "fa-light fa-ticket text-xl!",
    href: "/voilations",
  },
  {
    label: "Payroll",
    icon: "fa-sharp fa-light fa-book-open-reader text-xl!",
    href: "/payroll",
  },
  {
    label: "Ledger",
    icon: "fa-light fa-book-open-lines text-xl!",
    href: "/ledger",
  },
  {
    label: "Exit Re-entry",
    icon: "fa-light fa-diamond-turn-right text-xl!",
    href: "/exit-reentry",
  },
  { label: "Users Mgmt.", icon: "pi pi-users text-2xl!", href: "/users" },
  {
    label: "Setup",
    icon: "fa-light fa-gear text-xl!",
    href: "/setup",
  },
];

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Auto-expand submenu if active on mount
  useState(() => {
    menuItems.forEach((item) => {
      if (item.items && item.items.some((sub) => sub.href === pathname)) {
        setExpandedMenus((prev) => [...prev, item.label]);
      }
    });
  });

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isExpanded = (label: string) => expandedMenus.includes(label);

  const onClickMenuItem = () => {
    const mobileView = window && window?.innerWidth < 768;
    if (mobileView) {
      setCollapsed(!collapsed);
    }
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return (
        <li
          key={item.label}
          className="mt-2 mb-4 px-4 border-b w-[90%] mx-auto border-theme-border"
        ></li>
      );
    }
    const isActive =
      (item.href &&
        (item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href))) ||
      (item.items &&
        item.items.some(
          (sub) =>
            sub.href &&
            (sub.href === "/"
              ? pathname === "/"
              : pathname.startsWith(sub.href))
        ));
    const hasSubmenu = item.items && item.items.length > 0;
    const expanded = isExpanded(item.label);

    return (
      <li key={item.label} title={item.label}>
        <div
          className={classNames(
            "flex items-center h-[44px] px-4 rounded-xl mx-auto cursor-pointer transition-colors duration-200 justify-between text-[15px] group",
            {
              "bg-primary text-white shadow-[0px_8px_20px_-8px_#4D5BEC3B]!":
                isActive,
              "bg-transparent text-black": !isActive,
              "w-[90%]": !collapsed,
              "w-[65%]": collapsed,
            }
          )}
          onClick={() => {
            if (hasSubmenu) {
              if (collapsed) {
                setCollapsed(false);
                if (!expanded) {
                  toggleSubmenu(item.label);
                }
              } else {
                toggleSubmenu(item.label);
              }
            }
          }}
        >
          {item.href && !hasSubmenu ? (
            <Link
              href={item.href}
              className={classNames(
                "flex text-center items-center w-full gap-x-3"
              )}
              onClick={() => onClickMenuItem()}
            >
              <i
                className={classNames(item.icon, {
                  "text-white!": isActive,
                  "text-[#98A4AE] group-hover:text-primary!": !isActive,
                })}
              />
              {!collapsed && (
                <span
                  className={classNames({
                    "font-semibold": isActive,
                    "font-normal group-hover:text-primary!": !isActive,
                  })}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ) : (
            <div className="flex items-center w-full gap-x-3">
              <i
                className={classNames(item.icon, {
                  "text-white!": isActive,
                  "text-[#98A4AE] group-hover:text-primary!": !isActive,
                })}
              />
              {!collapsed && (
                <>
                  <span
                    className={classNames("font-normal flex-1", {
                      "text-white! font-semibold": isActive,
                      "text-black font-normal group-hover:text-primary!":
                        !isActive,
                    })}
                  >
                    {item.label}
                  </span>
                  {hasSubmenu && (
                    <i
                      className={classNames(
                        "pi pi-chevron-down text-sm! duration-200",
                        {
                          "rotate-0": !expanded,
                          "rotate-180": expanded,
                          "text-white!": isActive,
                          "text-[#98A4AE] group-hover:text-primary!": !isActive,
                        }
                      )}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Submenu */}
        <div
          className={classNames(
            "overflow-hidden transition-all duration-300 ease-in-out",
            {
              "max-h-0": !expanded || collapsed,
              "max-h-[1000px]": expanded && !collapsed && hasSubmenu,
            }
          )}
        >
          <ul className="list-none p-0 m-0">
            {item.items?.map((subItem) => {
              const isSubActive =
                subItem.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(subItem.href || "");
              return (
                <li key={subItem.label}>
                  <Link
                    href={subItem.href || "#"}
                    className={classNames(
                      "flex items-center pl-15 pr-1 h-[40px] cursor-pointer transition-colors duration-200 group gap-x-2",
                      {
                        "text-primary font-semibold": isSubActive,
                        "text-black": !isSubActive,
                      }
                    )}
                    onClick={() => onClickMenuItem()}
                  >
                    <i
                      className={classNames(subItem.icon, {
                        "text-primary": isSubActive,
                        "text-[#98A4AE] group-hover:text-primary!":
                          !isSubActive,
                      })}
                    />
                    <span
                      className={classNames("text-xs font-normal", {
                        "group-hover:text-primary!": !isSubActive,
                      })}
                    >
                      {subItem.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/20 z-21 md:hidden" />
      )}
      <div
        className={classNames(
          "fixed left-0 top-0 h-screen bg-white transition-all duration-300 ease-in-out z-21 flex flex-col print:hidden",
          {
            "w-64 translate-x-0": !collapsed,
            "-translate-x-full md:translate-x-0 w-0 md:w-20": collapsed,
          }
        )}
      >
        {/* Logo Area */}
        <div
          className={classNames(
            "flex items-center justify-between transition-all duration-300 h-20 px-4"
          )}
        >
          <div className="flex items-center justify-center">
            <img
              alt="BAK Logo"
              src="/assets/images/bak_transparent_logo.png"
              className={classNames(
                "transition-all h-14 duration-300 object-contain",
                {}
              )}
            />
            {!collapsed && (
              <p className="text-xl ml-2 text-primary font-semibold">
                HR Module
              </p>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="left-50! top-5! absolute w-8 h-8 flex md:hidden items-center justify-center rounded-full bg-primary-light transition-all duration-1000 cursor-pointer z-40"
              aria-label="Close sidebar"
            >
              <i className="pi pi-times text-xl text-primary"></i>
            </button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 w-full overflow-y-auto py-4 custom-scrollbar">
          <ul className="list-none p-0 m-0 space-y-0.75">
            {menuItems.map((item) => renderMenuItem(item))}
          </ul>
        </div>
      </div>
    </>
  );
}
