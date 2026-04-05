import { Input, ExportOptions, Dropdown } from "@/components";

interface ProjectFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  status: "all" | "active" | "inactive";
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  exportCSV: () => void;
  exportExcel: () => void;
}

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const ProjectFilters = ({
  searchValue,
  onSearchChange,
  status,
  onStatusChange,
  exportCSV,
  exportExcel,
}: ProjectFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
      <div className="w-full md:w-auto">
        <Input
          small
          className="w-full"
          value={searchValue}
          icon="pi pi-search"
          iconPosition="left"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <div className="w-full md:w-[150px]">
          <Dropdown
            small
            value={status}
            className="w-full"
            placeholder="Status"
            options={STATUS_OPTIONS}
            onChange={(e) => onStatusChange(e.value)}
          />
        </div>
        <div className="w-auto">
          <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
        </div>
      </div>
    </div>
  );
};
