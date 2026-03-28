"use client";
import React from "react";
import { Button } from "@/components";

interface UsersHeaderProps {
  onAddUser: () => void;
}

export const UsersHeader = ({ onAddUser }: UsersHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
      <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900">
          User Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View, manage user records, and user details.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <Button
          size="small"
          variant="solid"
          icon="pi pi-plus"
          label="Add User"
          onClick={onAddUser}
        />
      </div>
    </div>
  );
};
