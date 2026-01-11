"use client";
import { useRouter } from "next/navigation";

import {
  Input,
  Table,
  Button,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { Country, countriesData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (country: Country) => void,
  handleDelete: (country: Country) => void
): TableColumn<Country>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: Country) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: Country) => (
      <span className="text-sm">{rowData.nameEn}</span>
    ),
  },
  {
    field: "nameAr",
    header: "Arabic Name",
    ...commonColumnProps,
    style: { minWidth: "200px" },
    body: (rowData: Country) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-sm text-right">{rowData.nameAr || ""}</span>
      </div>
    ),
  },
  {
    field: "isActive",
    header: "Is Active",
    sortable: true,
    filterable: true,
    smallFilter: true,
    showFilterMenu: false,
    showClearButton: false,
    style: { minWidth: "150px" },
    align: "center",
    body: (rowData: Country) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    field: "actions",
    header: "Actions",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: 150 },
    body: (rowData: Country) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const CountriesPage = () => {
  const router = useRouter();

  const handleEdit = (country: Country) => {
    console.log("Edit country:", country);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/countries/${country.id}/edit`);
  };

  const handleDelete = (country: Country) => {
    console.log("Delete country:", country);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${country.nameEn}?`)) {
      // Delete logic here
      // Example: deleteCountry(country.id);
    }
  };

  const renderHeader = ({
    value,
    onChange,
    exportCSV,
    exportExcel,
  }: CustomHeaderProps) => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="w-full md:w-auto">
          <Input
            small
            className="w-full"
            value={value}
            icon="pi pi-search"
            iconPosition="left"
            onChange={onChange}
            placeholder="Search"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <ExportOptions
              exportCSV={exportCSV || (() => {})}
              exportExcel={exportExcel || (() => {})}
            />
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Country Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage country records, and country details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add Country"
            onClick={() => router.push("/setup/countries/new")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <Table
          dataKey="id"
          data={countriesData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
        />
      </div>
    </div>
  );
};

export default CountriesPage;
