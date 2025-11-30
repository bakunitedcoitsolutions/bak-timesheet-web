"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { classNames } from "primereact/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);

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
    <div className="min-h-screen bg-secondary-white flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={classNames(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          {
            "ml-64": !collapsed,
            "ml-20": collapsed,
          }
        )}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="px-6 pt-6 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
