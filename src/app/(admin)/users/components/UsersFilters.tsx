"use client";
import { Input } from "@/components";

interface UsersFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const UsersFilters = ({
  searchValue,
  onSearchChange,
}: UsersFiltersProps) => {
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
    </div>
  );
};
