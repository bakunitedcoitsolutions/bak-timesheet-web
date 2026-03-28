import { Input, Dropdown } from "@/components";

interface PayrollFiltersProps {
  yearOptions: { label: string; value: string }[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  searchValue?: string;
  onSearchChange?: (e: any) => void;
}


export const PayrollFilters = ({
  yearOptions,
  selectedYear,
  setSelectedYear,
  searchValue,
  onSearchChange,
}: PayrollFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
      <div className="w-full md:w-auto">
        <Dropdown
          small
          filter
          options={yearOptions}
          placeholder="Select Year"
          className="w-full md:w-44"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.value)}
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <Input
            small
            value={searchValue}
            className="w-full"
            icon="pi pi-search"
            iconPosition="left"
            onChange={onSearchChange}
            placeholder="Search"
          />
        </div>
      </div>
    </div>
  );
};
