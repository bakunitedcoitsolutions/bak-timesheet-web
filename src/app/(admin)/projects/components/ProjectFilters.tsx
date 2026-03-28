import { Input, ExportOptions } from "@/components";

interface ProjectFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  exportCSV: () => void;
  exportExcel: () => void;
}

export const ProjectFilters = ({
  searchValue,
  onSearchChange,
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
        <div>
          <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
        </div>
      </div>
    </div>
  );
};
