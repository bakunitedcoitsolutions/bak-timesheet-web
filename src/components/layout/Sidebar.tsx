"use client";

import { useState } from "react";
import { classNames } from "primereact/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  items?: MenuItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: "pi pi-objects-column", href: "/" },
  {
    label: "Timesheet",
    icon: "pi pi-calendar",
    href: "/timesheet",
  },
  { label: "Employees", icon: "pi pi-id-card", href: "/employees" },
  { label: "Projects", icon: "pi pi-briefcase", href: "/projects" },
  { label: "Loans", icon: "pi pi-money-bill", href: "/loans" },
  {
    label: "Traffic Challans",
    icon: "pi pi-exclamation-triangle",
    href: "/challans",
  },
  { label: "Exit Re-entry", icon: "pi pi-directions", href: "/exit-reentry" },
  { label: "Payroll", icon: "pi pi-wallet", href: "/payroll" },
  { label: "User Management", icon: "pi pi-users", href: "/users" },
  {
    label: "Reports",
    icon: "pi pi-chart-bar",
    items: [
      { label: "Employee", icon: "pi pi-user", href: "/reports/employee" },
      {
        label: "Salary Slip",
        icon: "pi pi-file",
        href: "/reports/salary-slip",
      },
      {
        label: "Payroll Report",
        icon: "pi pi-table",
        href: "/reports/payroll",
      },
      {
        label: "Site Wise Report",
        icon: "pi pi-map",
        href: "/reports/site-wise",
      },
      {
        label: "Master Payroll Report",
        icon: "pi pi-list",
        href: "/reports/master-payroll",
      },
      {
        label: "Employee Leave Statement",
        icon: "pi pi-file-o",
        href: "/reports/leave-statement",
      },
      {
        label: "Monthly Timesheet",
        icon: "pi pi-calendar-plus",
        href: "/reports/monthly-timesheet",
      },
      {
        label: "Daily Timesheet",
        icon: "pi pi-clock",
        href: "/reports/daily-timesheet",
      },
      {
        label: "Employee Cards",
        icon: "pi pi-id-card",
        href: "/reports/employee-cards",
      },
    ],
  },
  {
    label: "Setup",
    icon: "pi pi-cog",
    items: [
      { label: "Countries", icon: "pi pi-globe", href: "/setup/countries" },
      { label: "Cities", icon: "pi pi-building", href: "/setup/cities" },
      {
        label: "Designation",
        icon: "pi pi-briefcase",
        href: "/setup/designation",
      },
      {
        label: "Payroll Sections",
        icon: "pi pi-wallet",
        href: "/setup/payroll-sections",
      },
      {
        label: "Employee Statuses",
        icon: "pi pi-info-circle",
        href: "/setup/employee-statuses",
      },
    ],
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

  const renderMenuItem = (item: MenuItem) => {
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
      <li key={item.label} className="mb-1.5" title={item.label}>
        <div
          className={classNames(
            "flex items-center py-2.5 px-4 rounded-xl mx-auto cursor-pointer transition-colors duration-200 justify-between text-[15px]",
            {
              "bg-primary/10 text-primary shadow-lg": isActive,
              "bg-transparent text-gray-800 hover:text-primary": !isActive,
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
              className="flex text-center items-center w-full"
            >
              <i className={classNames(item.icon, "text-xl!")}></i>
              {!collapsed && (
                <span className="ml-4 font-semibold">{item.label}</span>
              )}
            </Link>
          ) : (
            <div className="flex items-center w-full">
              <i className={classNames(item.icon, "text-xl!")}></i>
              {!collapsed && (
                <>
                  <span className="ml-4 font-semibold flex-1">
                    {item.label}
                  </span>
                  {hasSubmenu && (
                    <i
                      className={classNames(
                        "pi pi-chevron-down text-sm! duration-200",
                        {
                          "rotate-0": !expanded,
                          "rotate-180": expanded,
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
            "overflow-hidden mt-2 transition-all duration-300 ease-in-out",
            {
              "max-h-0": !expanded || collapsed,
              "max-h-[1000px]": expanded && !collapsed && hasSubmenu,
            }
          )}
        >
          <ul className="list-none p-0 m-0 bg-secondary-white">
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
                      "flex items-center pl-15 pr-6 py-3 cursor-pointer transition-colors duration-200",
                      {
                        "text-primary font-semibold": isSubActive,
                        "text-gray-500 hover:text-gray-900": !isSubActive,
                      }
                    )}
                  >
                    <i className={classNames(subItem.icon, "text-lg mr-3")}></i>
                    <span className="text-sm">{subItem.label}</span>
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
    <div
      className={classNames(
        "fixed left-0 top-0 h-screen bg-white transition-all duration-300 ease-in-out z-20 flex flex-col",
        {
          "w-64": !collapsed,
          "w-20": collapsed,
        }
      )}
    >
      {/* Logo Area */}
      <div
        className={classNames(
          "flex items-center justify-center transition-all duration-300 h-20"
        )}
      >
        <img
          src="/assets/images/bak_transparent_logo.png"
          alt="BAK Logo"
          className={classNames("transition-all h-16 duration-300", {})}
        />
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>
    </div>
  );
}
