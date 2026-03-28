"use client";
import React from "react";
import { Button } from "@/components";

interface ViolationsHeaderProps {
  canAdd: boolean;
  onAdd: () => void;
}

export const ViolationsHeader = ({ canAdd, onAdd }: ViolationsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          Traffic Violation Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage traffic Violation records, and Violation details.
        </p>
      </div>
      {canAdd && (
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Violation"
            onClick={onAdd}
          />
        </div>
      )}
    </div>
  );
};
