"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  Input,
  Table,
  Button,
  TypeBadge,
  TableColumn,
  TableActions,
  ExportOptions,
  CustomHeaderProps,
} from "@/components";
import { City, citiesData, countriesData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const CitiesPage = () => {
  const router = useRouter();

  // Create a map of countryId to country name for efficient lookup
  const countryMap = useMemo(() => {
    const map = new Map<number, string>();
    countriesData.forEach((country) => {
      map.set(country.id, country.nameEn);
    });
    return map;
  }, []);

  const columns = (
    handleEdit: (city: City) => void,
    handleDelete: (city: City) => void
  ): TableColumn<City>[] => [
    {
      field: "id",
      header: "#",
      sortable: false,
      filterable: false,
      align: "center",
      style: { width: "40px" },
      body: (rowData: City) => (
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
      body: (rowData: City) => (
        <span className="text-sm">{rowData.nameEn}</span>
      ),
    },
    {
      field: "nameAr",
      header: "Arabic Name",
      ...commonColumnProps,
      style: { minWidth: "200px" },
      body: (rowData: City) => (
        <div className="w-full flex flex-1 justify-end">
          <span className="text-xl! text-right font-arabic">
            {rowData.nameAr || ""}
          </span>
        </div>
      ),
    },
    {
      field: "countryId",
      header: "Country",
      ...commonColumnProps,
      style: { minWidth: "200px" },
      body: (rowData: City) => (
        <span className="text-sm">
          {countryMap.get(rowData.countryId) || "Unknown"}
        </span>
      ),
    },
    {
      field: "isActive",
      header: "Status",
      sortable: true,
      filterable: false,
      style: { minWidth: 100 },
      align: "center",
      body: (rowData: City) => (
        <TypeBadge
          text={rowData.isActive ? "Active" : "Inactive"}
          variant={rowData.isActive ? "success" : "danger"}
        />
      ),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      align: "center",
      style: { minWidth: 150 },
      body: (rowData: City) => (
        <TableActions
          rowData={rowData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  const handleEdit = (city: City) => {
    console.log("Edit city:", city);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/cities/${city.id}/edit`);
  };

  const handleDelete = (city: City) => {
    console.log("Delete city:", city);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${city.nameEn}?`)) {
      // Delete logic here
      // Example: deleteCity(city.id);
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
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
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
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            City Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage city records, and city details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="Add City"
            onClick={() => router.push("/setup/cities/new")}
          />
        </div>
      </div>
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          data={citiesData}
          customHeader={renderHeader}
          columns={columns(handleEdit, handleDelete)}
          pagination={true}
          rowsPerPageOptions={[10, 25, 50]}
          rows={10}
          scrollable
          scrollHeight="65vh"
        />
      </div>
    </div>
  );
};

export default CitiesPage;
