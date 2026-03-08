"use client";
import Link from "next/link";
import { classNames } from "primereact/utils";

import { useAccess } from "@/components";
import { useMemo } from "react";
import { menuItems } from "@/utils/user.utility";

const AccessEnabledDashboard = () => {
  const { canAccess } = useAccess();

  // Filter menuItems based on user access
  const allowedFeatures = useMemo(() => {
    return menuItems.filter((item) => item.feature && canAccess(item.feature));
  }, [canAccess]);

  return (
    <div className="flex flex-col gap-6 px-6 py-6 overflow-hidden!">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 bg-white w-full rounded-xl md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
        {allowedFeatures.map((item) => (
          <div
            key={item.feature}
            className={classNames(
              "flex flex-1 flex-col p-4 rounded-xl h-60 justify-center items-center gap-3",
              "bg-linear-to-b from-primary/10 to-primary/5"
            )}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary">
              <i className={classNames(item.icon, "text-xl! text-white")}></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              {item.label}
            </h3>
            <Link
              href={item.href || "#"}
              className="px-3 py-2.5 text-xs rounded-md shadow-[0px_6px_24.2px_-10px_#29343D38] bg-white cursor-pointer font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessEnabledDashboard;
