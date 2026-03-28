import { Input, ExportOptions, BulkUploadOptions } from "@/components";

interface LoansFiltersProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchValue: string;
  setSearchValue: (search: string) => void;
  exportCSV: () => void;
  exportExcel: () => void;
  canAdd: boolean;
  uploadCSV: () => void;
  uploadExcel: () => void;
  downloadTemplate: () => void;
}

export const LoansFilters = ({
  selectedDate,
  setSelectedDate,
  searchValue,
  setSearchValue,
  exportCSV,
  exportExcel,
  canAdd,
  uploadCSV,
  uploadExcel,
  downloadTemplate,
}: LoansFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
      <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <Input
            small
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-44"
            placeholder="Select Date"
          />
        </div>
        <div className="w-full md:w-auto">
          <Input
            small
            value={searchValue}
            className="w-full md:w-64"
            icon="pi pi-search"
            iconPosition="left"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search..."
          />
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-full md:w-auto">
          <ExportOptions
            exportCSV={exportCSV}
            exportExcel={exportExcel}
            buttonClassName="w-full md:w-auto h-9!"
          />
        </div>
        {canAdd && (
          <div className="w-full lg:w-auto">
            <BulkUploadOptions
              uploadCSV={uploadCSV}
              uploadExcel={uploadExcel}
              downloadTemplate={downloadTemplate}
              buttonClassName="w-full md:w-auto h-9!"
            />
          </div>
        )}
      </div>
    </div>
  );
};
