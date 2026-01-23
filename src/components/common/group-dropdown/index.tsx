import { Dropdown } from "@/components/forms";
import { designationOptions, payrollSectionsData } from "@/utils/dummy";

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
  const getGroupedDesignations = () => {
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
        items: payrollSectionsData.map((payrollSection) => ({
          label: payrollSection.nameEn,
          value: payrollSection.id,
        })),
      },
      {
        label: "Designations",
        value: "designations",
        items: designationOptions.map((designation) => ({
          label: designation.label,
          value: designation.value,
        })),
      },
    ];
    return groupedDesignations;
  };

  const optionGroupTemplate = (option: any) => {
    if (option.value === "all") {
      return <div style={{ display: "none" }} />;
    }
    return (
      <div className="font-semibold text-sm text-gray-600 px-3 py-2">
        {option.label}
      </div>
    );
  };

  return (
    <Dropdown
      small
      filter
      value={value}
      optionLabel="label"
      className={className}
      optionGroupLabel="label"
      optionGroupChildren="items"
      placeholder={placeholder}
      options={getGroupedDesignations()}
      onChange={(e) => onChange(e.value)}
      optionGroupTemplate={optionGroupTemplate}
      panelClassName="designation-dropdown-panel"
    />
  );
};

export default GroupDropdown;
