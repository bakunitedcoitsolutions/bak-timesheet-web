"use client";
import React from "react";
import { Button } from "@/components/forms";

interface UserActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export const UserActions = ({
  onCancel,
  onSave,
  isSubmitting,
}: UserActionsProps) => {
  return (
    <div className="flex items-center gap-3 justify-end px-6">
      <Button
        size="small"
        variant="text"
        disabled={isSubmitting}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        size="small"
        variant="solid"
        onClick={onSave}
        loading={isSubmitting}
        disabled={isSubmitting}
        className="w-28 justify-center! gap-1"
      >
        Save
      </Button>
    </div>
  );
};
