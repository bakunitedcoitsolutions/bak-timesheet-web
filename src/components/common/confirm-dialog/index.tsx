"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { ContentProps } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export interface ConfirmDialogOptions {
  group?: string;
  title: string;
  message: string;
  icon?: string;
  iconColor?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  showCancel?: boolean;
  onReject?: () => void;
  onAccept: () => void | Promise<void>;
}
const group = "custom-confirm";
const dialogOptionsMap = new Map<string, Partial<ConfirmDialogOptions>>();

export const showConfirmDialog = ({
  title,
  message,
  icon = "pi pi-question",
  iconColor = "bg-primary",
  acceptLabel = "Confirm",
  rejectLabel = "Cancel",
  showCancel = true,
  onAccept,
  onReject,
}: ConfirmDialogOptions) => {
  dialogOptionsMap.set(group, {
    icon,
    iconColor,
    acceptLabel,
    rejectLabel,
    showCancel,
    onAccept,
    onReject,
  });

  confirmDialog({
    group,
    message,
    header: title,
    icon,
    defaultFocus: "accept",
    accept: onAccept,
    reject: onReject,
  });
};

interface InnerContentProps extends ContentProps {
  group: string;
}

function InnerConfirmDialogContent({
  group,
  hide,
  message,
  headerRef,
  contentRef,
  footerRef,
}: InnerContentProps) {
  const [loading, setLoading] = useState(false);

  // Get stored options for this group
  const storedOptions = dialogOptionsMap.get(group) || {};

  const customMessage = message as typeof message & {
    icon?: string;
    accept?: () => void | Promise<void>;
    reject?: () => void;
  };

  // Use stored custom values or defaults
  const onAccept = storedOptions.onAccept || customMessage.accept;
  const onReject = storedOptions.onReject || customMessage.reject;
  const icon = storedOptions.icon || customMessage.icon || "pi pi-question";
  const iconColor = storedOptions.iconColor || "bg-primary";
  const acceptLabel = storedOptions.acceptLabel || "Confirm";
  const rejectLabel = storedOptions.rejectLabel || "Cancel";
  const showCancel =
    storedOptions.showCancel !== undefined ? storedOptions.showCancel : true;

  const handleAccept = async (event: any) => {
    if (!onAccept) return;

    try {
      setLoading(true);
      await onAccept?.();
      setLoading(false);
      hide(event);
      dialogOptionsMap.delete(group);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleReject = (event: any) => {
    if (loading) return;
    hide(event);
    onReject?.();
    dialogOptionsMap.delete(group);
  };

  return (
    <div className="flex bg-white flex-col items-center p-6 rounded-lg shadow-lg max-w-md">
      <div
        className={`rounded-full ${iconColor} inline-flex items-center justify-center h-20 w-20 -mt-16 shadow-md`}
      >
        <i className={`${icon} text-4xl text-white`}></i>
      </div>
      <span
        className="font-bold text-xl block mb-2 mt-4 text-gray-800 text-center"
        ref={headerRef as React.RefObject<HTMLSpanElement>}
      >
        {customMessage.header}
      </span>
      <p
        className="mb-0 text-gray-600 text-center text-sm leading-relaxed"
        ref={contentRef as React.RefObject<HTMLParagraphElement>}
      >
        {customMessage.message}
      </p>
      <div
        className="flex items-center gap-3 mt-6 w-full justify-center"
        ref={footerRef as React.RefObject<HTMLDivElement>}
      >
        {showCancel && (
          <Button
            text
            size="small"
            label={rejectLabel}
            disabled={loading}
            onClick={handleReject}
            className="shadow-none!"
          />
        )}
        <Button
          size="small"
          className="px-6"
          loading={loading}
          disabled={loading}
          label={acceptLabel}
          onClick={handleAccept}
        />
      </div>
    </div>
  );
}

interface CustomConfirmDialogProps {
  group?: string;
}

export default function CustomConfirmDialog({
  group = "custom-confirm",
}: CustomConfirmDialogProps) {
  return (
    <ConfirmDialog
      group={group}
      content={(props: ContentProps) => (
        <InnerConfirmDialogContent {...props} group={group} />
      )}
    />
  );
}
