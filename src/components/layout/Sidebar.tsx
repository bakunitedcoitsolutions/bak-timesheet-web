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
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: "pi pi-microsoft", href: "/" },
  { label: "User Management", icon: "pi pi-users", href: "/users" },
  { label: "Projects", icon: "pi pi-briefcase", href: "/projects" },
  { label: "Loans", icon: "pi pi-money-bill", href: "/loans" },
  {
    label: "Traffic Challans",
    icon: "pi pi-exclamation-triangle",
    href: "/challans",
  },
  { label: "Exit Re-entry", icon: "pi pi-directions", href: "/exit-reentry" },
  {
    label: "Timesheet",
    icon: "pi pi-calendar",
    href: "/timesheet",
  },
  { label: "Payroll", icon: "pi pi-wallet", href: "/payroll" },
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

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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
      item.href === pathname ||
      (item.items && item.items.some((sub) => sub.href === pathname));
    const hasSubmenu = item.items && item.items.length > 0;
    const expanded = isExpanded(item.label);

    return (
      <li key={item.label} className="mb-1" title={item.label}>
        <div
          className={classNames(
            "flex items-center px-6 py-3 cursor-pointer transition-colors duration-200 justify-between",
            {
              "bg-primary/10 text-primary border-r-4 border-primary":
                isActive && !hasSubmenu,
              "text-gray-600 hover:text-primary": !isActive,
              "justify-center": collapsed,
            }
          )}
          onClick={() => {
            if (hasSubmenu && !collapsed) {
              toggleSubmenu(item.label);
            }
          }}
        >
          {item.href && !hasSubmenu ? (
            <Link href={item.href} className="flex items-center w-full">
              <i className={classNames(item.icon, "text-xl!")}></i>
              {!collapsed && (
                <span className="ml-4 font-medium">{item.label}</span>
              )}
            </Link>
          ) : (
            <div className="flex items-center w-full">
              <i className={classNames(item.icon, "text-xl!")}></i>
              {!collapsed && (
                <>
                  <span className="ml-4 font-medium flex-1">{item.label}</span>
                  {hasSubmenu && (
                    <i
                      className={classNames(
                        "pi transition-all duration-300 ease-in-out",
                        {
                          "pi-chevron-up": expanded,
                          "pi-chevron-down": !expanded,
                        }
                      )}
                    ></i>
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
              "max-h-[1000px]": expanded && !collapsed && hasSubmenu, // Increased max-height for large submenus
            }
          )}
        >
          <ul className="list-none p-0 m-0 bg-gray-50">
            {item.items?.map((subItem) => {
              const isSubActive = pathname === subItem.href;
              return (
                <li key={subItem.label}>
                  <Link
                    href={subItem.href || "#"}
                    className={classNames(
                      "flex items-center pl-12 pr-6 py-2 cursor-pointer transition-colors duration-200",
                      {
                        "text-primary font-medium": isSubActive,
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
          "flex items-center justify-center border-b border-gray-100 transition-all duration-300 h-20"
        )}
      >
        <img
          src="/assets/images/bak_transparent_logo.png"
          alt="BAK Logo"
          className={classNames("transition-all duration-300", {
            "h-18": !collapsed,
            "h-14": collapsed,
          })}
        />
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>

      {/* User Profile (Optional Footer) */}
      <div className="p-4 border-t border-gray-100">
        <div
          className={classNames("flex items-center", {
            "justify-center": collapsed,
          })}
        >
          <img
            src="/assets/images/profile.png"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-semibold text-gray-800">
                Shariq Ahmed
              </p>
              <p className="text-xs text-primary">Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
