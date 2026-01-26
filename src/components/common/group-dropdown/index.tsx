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
  className = "w-full",
  placeholder = "Choose",
}: {
  value: any;
  className?: string;
  placeholder?: string;
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
        <div className="font-semibold text-sm text-gray-600 px-3 py-2">
          {option.label}
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
