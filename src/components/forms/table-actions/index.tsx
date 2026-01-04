"use client";
import { Button } from "@/components";
import { ReactNode } from "react";

export interface TableAction {
  icon: string;
  label: string;
  severity?:
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "secondary"
    | "help"
    | "contrast";
  onClick: (rowData: any) => void;
  tooltip?: string;
  disabled?: boolean;
}

interface TableActionsProps<T = any> {
  rowData: T;
  onEdit?: (rowData: T) => void;
  onDelete?: (rowData: T) => void;
  beforeActions?: TableAction[];
  afterActions?: TableAction[];
  showEdit?: boolean; // Default: true if onEdit is provided
  showDelete?: boolean; // Default: true if onDelete is provided
  editTooltip?: string;
  deleteTooltip?: string;
}

const commonButtonProps = {
  style: {
    width: 40,
    height: 40,
  },
};

export default function TableActions<T = any>({
  rowData,
  onEdit,
  onDelete,
  beforeActions = [],
  afterActions = [],
  showEdit,
  showDelete,
  editTooltip = "Edit",
  deleteTooltip = "Delete",
}: TableActionsProps<T>) {
  // Default showEdit/showDelete to true if handlers are provided, false otherwise
  const shouldShowEdit = showEdit !== undefined ? showEdit : !!onEdit;
  const shouldShowDelete = showDelete !== undefined ? showDelete : !!onDelete;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(rowData);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(rowData);
    }
  };

  const renderAction = (action: TableAction, index: number) => (
    <Button
      key={index}
      rounded
      size="small"
      variant="text"
      severity={action.severity || "secondary"}
      icon={action.icon}
      onClick={() => action.onClick(rowData)}
      tooltip={action.tooltip || action.label}
      tooltipOptions={{ position: "top" }}
      disabled={action.disabled}
      style={commonButtonProps.style}
      aria-label={action.label}
    />
  );

  return (
    <div className="w-full flex flex-1 justify-center gap-2">
      {/* Before Actions */}
      {beforeActions.map((action, index) => renderAction(action, index))}

      {/* Edit Action */}
      {shouldShowEdit && onEdit && (
        <Button
          rounded
          size="small"
          variant="text"
          severity="info"
          icon="pi pi-pencil text-lg!"
          style={commonButtonProps.style}
          onClick={handleEdit}
          tooltip={editTooltip}
          tooltipOptions={{ position: "top" }}
          aria-label="Edit"
        />
      )}

      {/* Delete Action */}
      {shouldShowDelete && onDelete && (
        <Button
          rounded
          size="small"
          variant="text"
          severity="danger"
          icon="pi pi-trash text-lg!"
          onClick={handleDelete}
          tooltip={deleteTooltip}
          style={commonButtonProps.style}
          tooltipOptions={{ position: "top" }}
          aria-label="Delete"
        />
      )}

      {/* After Actions */}
      {afterActions.map((action, index) => renderAction(action, index))}
    </div>
  );
}
