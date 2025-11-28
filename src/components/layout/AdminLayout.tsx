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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar collapsed={collapsed} />

      <div
        className={classNames(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          {
            "ml-64": !collapsed,
            "ml-20": collapsed,
          }
        )}
      >
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className="p-6 flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
