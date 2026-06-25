"use client";

import { useMemo } from "react";
import { classNames } from "primereact/utils";
import { BreadCrumb } from "primereact/breadcrumb";
import type { MenuItem } from "primereact/menuitem";
import { usePathname, useRouter } from "next/navigation";

import {
  getBreadcrumbItems,
  type AppBreadcrumbItem,
} from "@/utils/breadcrumb.utility";

export type BreadcrumbItem = AppBreadcrumbItem;

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  lastLabel?: string;
  className?: string;
}

export default function Breadcrumb({
  items,
  lastLabel,
  className,
}: BreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();

  const resolvedItems = useMemo(
    () => items ?? getBreadcrumbItems(pathname, { lastLabel }),
    [items, lastLabel, pathname]
  );

  const model: MenuItem[] = useMemo(
    () =>
      resolvedItems.map((item, index) => {
        const isLast = index === resolvedItems.length - 1;

        return {
          label: item.label,
          disabled: isLast,
          command:
            !isLast && item.href
              ? () => {
                  router.push(item.href!);
                }
              : undefined,
        };
      }),
    [resolvedItems, router]
  );

  return (
    <BreadCrumb
      model={model}
      separatorIcon={
        <span className="app-breadcrumb-separator pointer-events-none select-none">
          /
        </span>
      }
      className={classNames(
        "app-breadcrumb border-none bg-transparent p-0",
        className
      )}
      pt={{
        menuitem: { className: "opacity-100!" },
        root: { className: "bg-transparent border-none p-0" },
        menu: { className: "flex flex-wrap items-center m-0 p-0 list-none" },
        separator: { className: "mx-2 opacity-100!" },
        action: {
          className:
            "text-primary! hover:text-primary! opacity-100! font-medium px-0 py-0",
        },
        label: { className: "font-medium opacity-100!" },
      }}
    />
  );
}
