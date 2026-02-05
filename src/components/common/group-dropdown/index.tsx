"use client";

import { useMemo, memo } from "react";
import { Dropdown } from "@/components/forms";
import { COMMON_QUERY_INPUT } from "@/utils/constants";
import { useGetDesignations } from "@/lib/db/services/designation/requests";
import { useGetPayrollSections } from "@/lib/db/services/payroll-section/requests";
import type { ListedDesignation } from "@/lib/db/services/designation/designation.dto";
import type { ListedPayrollSection } from "@/lib/db/services/payroll-section/payroll-section.dto";

const GroupDropdown = ({
  value,
  onChange,
  hideAllOption = false,
  className = "w-full",
  placeholder = "Choose",
}: {
  value: any;
  className?: string;
  placeholder?: string;
  hideAllOption?: boolean;
  onChange: (value: any) => void;
}) => {
  // Fetch designations with stable query key
  const { data: designationsResponse } = useGetDesignations(COMMON_QUERY_INPUT);

  // Fetch payroll sections with stable query key
  const { data: payrollSectionsResponse } =
    useGetPayrollSections(COMMON_QUERY_INPUT);

  const designations = designationsResponse?.designations ?? [];
  const payrollSections = payrollSectionsResponse?.payrollSections ?? [];

  const getGroupedDesignations = useMemo(() => {
    const groupedDesignations = [
      ...((!hideAllOption && [
        {
          label: "All",
          value: "all",
          items: [
            {
              label: "All",
              value: "all",
            },
          ],
        },
      ]) ||
        []),
      {
        label: "Payroll Sections",
        value: "payroll-sections",
        items: payrollSections.map((payrollSection: ListedPayrollSection) => ({
          label: payrollSection.nameEn,
          value: `payroll-${payrollSection.id}`,
        })),
      },
      {
        label: "Designations",
        value: "designations",
        items: designations.map((designation: ListedDesignation) => ({
          label: designation.nameEn,
          value: `designation-${designation.id}`,
        })),
      },
    ];
    return groupedDesignations;
  }, [designations, payrollSections]);

  const optionGroupTemplate = useMemo(
    () => (option: any) => {
      if (option.value === "all") {
        return <div style={{ display: "none" }} />;
      }
      return (
        <div className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white">
          <div className="flex-1 h-px bg-lineat-to-r from-transparent via-gray-300 to-gray-300" />
          <span className="inline-flex items-center px-3 py-1 bg-primary/10 rounded-full font-semibold text-xs text-primary tracking-wide uppercase">
            {option.label}
          </span>
          <div className="flex-1 h-px bg-lineat-to-l from-transparent via-gray-300 to-gray-300" />
        </div>
      );
    },
    []
  );

  return (
    <Dropdown
      small
      filter
      value={value}
      optionLabel="label"
      optionValue="value"
      className={className}
      optionGroupLabel="label"
      optionGroupChildren="items"
      placeholder={placeholder}
      options={getGroupedDesignations}
      onChange={(e) => onChange(e.value)}
      optionGroupTemplate={optionGroupTemplate}
      panelClassName="designation-dropdown-panel"
    />
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(GroupDropdown);
