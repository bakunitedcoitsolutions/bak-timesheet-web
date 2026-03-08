"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { classNames } from "primereact/utils";
import { useAccess } from "@/components";
import { USER_ROLES } from "@/utils/user.utility";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAccess();
  const isAccessEnabled = Number(role) === USER_ROLES.ACCESS_ENABLED;

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white flex">
      {!isAccessEnabled && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className={classNames(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          {
            "md:ml-64": !isAccessEnabled && !collapsed,
            "md:ml-20": !isAccessEnabled && collapsed,
            "ml-0": isAccessEnabled,
            "print:ml-0!": true,
          }
        )}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="flex-1 overflow-x-hidden bg-secondary-white md:rounded-tl-xl">
          {children}
        </main>
      </div>
    </div>
  );
}
