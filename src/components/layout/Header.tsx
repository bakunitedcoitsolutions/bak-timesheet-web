"use client";

import Link from "next/link";
import { useRef } from "react";
import { Menu } from "primereact/menu";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { classNames } from "primereact/utils";
import { usePathname } from "next/navigation";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";

import { useAccess } from "../common";
import { queryClient } from "@/lib/react-query";
import { USER_ROLES } from "@/utils/user.utility";
import { useSignOut } from "@/lib/db/services/user/requests";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const { role, isLoading } = useAccess();
  const router = useRouter();
  const pathname = usePathname();
  const menuRight = useRef<Menu | null>(null);
  const { data: session } = useSession();
  const { mutateAsync: signOut, isPending: isSigningOut } = useSignOut();

  const userName = (session?.user as any)?.name || "User";
  const userRole = (session?.user as any)?.role || "-";
  const isAccessEnabled =
    Number(role) === USER_ROLES.ACCESS_ENABLED ||
    Number(role) === USER_ROLES.BRANCH_USER;

  const handleLogout = async () => {
    try {
      router.replace("/login");
      await signOut(undefined as any);
    } catch {
    } finally {
      queryClient.clear();
    }
  };

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
      label: "Profile",
      icon: "fa-regular fa-circle-user text-base!",
      command: () => {},
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full h-14 flex p-2 pl-4 cursor-pointer rounded-t-xl items-center gap-x-2 bg-primary-light"
            )}
          >
            <img
              src="/assets/images/profile.png"
              alt="User"
              className="w-9 h-9 rounded-full border border-primary/60"
            />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{userName}</p>
              <p className="font-medium text-xs text-foreground/70 truncate">
                {userRole}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      label: isSigningOut ? "Logging out..." : "Logout",
      icon: "fa-regular fa-arrow-right-from-bracket text-base!",
      command: handleLogout,
      template: (item: MenuItem, options: MenuItemOptions) => {
        return (
          <div
            onClick={(e) => options.onClick(e)}
            className={classNames(
              options.className,
              "w-full flex h-12 p-2 pl-4 cursor-pointer rounded-b-xl"
            )}
          >
            <span className={classNames(item.icon, "mr-2")}></span>
            <p className="font-medium text-sm">{item.label}</p>
          </div>
        );
      },
    },
  ];

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 sticky top-0 z-20 transition-all duration-300 ease-in-out print:hidden">
      <div className="flex items-center gap-4 z-10">
        {!isLoading && (
          <>
            {!isAccessEnabled ? (
              <>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className={classNames(
                    "w-10 h-10 flex items-center justify-center cursor-pointer rounded-full  focus:outline-none transition-all duration-300",
                    {
                      "bg-primary-light text-primary": !collapsed,
                      "bg-transparent text-primary hover:bg-primary-light":
                        collapsed,
                    }
                  )}
                >
                  <i
                    className={classNames("pi duration-200", {
                      "rotate-0 pi-chevron-left": !collapsed,
                      "rotate-180 pi-bars text-xl!": collapsed,
                    })}
                  />
                </button>

                <div className="h-6 w-px bg-gray-200 mx-1"></div>
                <h1 className="text-lg font-semibold tracking-wide">
                  {pageTitle}
                </h1>
              </>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-3 cursor-pointer group"
              >
                {pathname !== "/" && (
                  <button className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-primary cursor-pointer">
                    <i className="pi pi-home text-xl!" />
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/images/bak_transparent_logo.png"
                    alt="BAK United"
                    className="h-10 object-contain group-hover:opacity-90 transition-opacity"
                  />
                  <span className="font-bold text-[17px] text-primary hidden md:inline group-hover:opacity-90 transition-opacity">
                    BAK Timesheet
                  </span>
                </div>
              </Link>
            )}
          </>
        )}
      </div>

      {isAccessEnabled && !isLoading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none">
          <h1 className="text-lg font-semibold tracking-wide pointer-events-auto">
            {pageTitle}
          </h1>
        </div>
      )}

      <div className="flex items-center gap-4 z-10">
        <div
          className={classNames("flex items-center cursor-pointer gap-x-1", {
            "justify-center": collapsed,
          })}
          onClick={(event) => menuRight?.current?.toggle?.(event)}
        >
          <img
            src="/assets/images/profile.png"
            alt="User"
            className="w-10 h-10 rounded-full"
          />
          <i className="fa-sharp fa-solid fa-caret-down text-foreground/70" />
        </div>
        <Menu
          popup
          ref={menuRight}
          model={menuItem}
          id="popup_menu_right"
          popupAlignment="right"
          className="mt-2 shadow-lg rounded-xl! p-0!"
        />
      </div>
    </header>
  );
}
