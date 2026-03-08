"use client";

import { useRef } from "react";
import { Menu } from "primereact/menu";
import { classNames } from "primereact/utils";
import { usePathname } from "next/navigation";
import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { useSession } from "next-auth/react";
import { useSignOut } from "@/lib/db/services/user/requests";
import { useRouter } from "next/navigation";
import { USER_ROLES } from "@/utils/user.utility";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuRight = useRef<Menu | null>(null);
  const { data: session } = useSession();
  const { mutateAsync: signOut, isPending: isSigningOut } = useSignOut();

  const userName = (session?.user as any)?.name || "User";
  const userRole = (session?.user as any)?.role || "-";
  const userRoleId = (session?.user as any)?.roleId;
  const isAccessEnabled = userRoleId === USER_ROLES.ACCESS_ENABLED;

  const handleLogout = async () => {
    try {
      await signOut(undefined as any);
      router.replace("/login");
    } catch {}
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
            <div>
              <p className="font-medium text-sm">{userName}</p>
              <p className="font-medium text-xs text-foreground/70">
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
      <div className="flex items-center gap-4">
        {!isAccessEnabled && (
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
          </>
        )}

        <h1 className="text-lg font-semibold tracking-wide">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
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
