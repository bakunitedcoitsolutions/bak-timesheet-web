"use client";

import { classNames } from "primereact/utils";
import { Button } from "@/components";

export interface StatusFilterGroupProps {
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
}

export const StatusFilterGroup = ({
  statusFilter,
  setStatusFilter,
}: StatusFilterGroupProps) => {
  return (
    <div className="flex flex-1 lg:flex-none w-full lg:w-auto items-center gap-3">
      <Button
        iconPosition="left"
        icon="pi pi-th-large"
        onClick={() => setStatusFilter("all")}
        variant={statusFilter === "all" ? "solid" : "outlined"}
        className="focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!"
      >
        All
      </Button>
      <Button
        variant={statusFilter === "active" ? "solid" : "outlined"}
        icon="pi pi-check-circle"
        iconPosition="left"
        onClick={() => setStatusFilter("active")}
        className={classNames(
          "border-theme-green! focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!",
          {
            "bg-theme-green! hover:text-white!": statusFilter === "active",
            "bg-theme-light-green! text-theme-green! hover:text-theme-green!":
              statusFilter !== "active",
          }
        )}
      >
        Active
      </Button>
      <Button
        variant={statusFilter === "inactive" ? "solid" : "outlined"}
        icon="pi pi-times-circle"
        iconPosition="left"
        onClick={() => setStatusFilter("inactive")}
        className={classNames(
          "border-theme-red! focus:shadow-none! w-full lg:w-32 lg:flex-1 lg:flex gap-2 justify-center items-center h-[44px]! rounded-lg!",
          {
            "bg-theme-red! hover:text-white!": statusFilter === "inactive",
            "bg-theme-light-red! text-theme-red! hover:text-theme-red!":
              statusFilter !== "inactive",
          }
        )}
      >
        Inactive
      </Button>
    </div>
  );
};
