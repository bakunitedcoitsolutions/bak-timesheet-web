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
import { Project, projectsData } from "@/utils/dummy";

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

const columns = (
  handleEdit: (project: Project) => void,
  handleDelete: (project: Project) => void
): TableColumn<Project>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { width: "40px" },
    body: (rowData: Project) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData.id}</span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Project Name (En)",
    ...commonColumnProps,
    style: { minWidth: "25rem" },
    body: (rowData: Project) => (
      <span className="text-sm uppercase font-medium whitespace-nowrap">
        {rowData.nameEn}
      </span>
    ),
  },
  {
    field: "nameAr",
    header: "Project Name (Ar)",
    ...commonColumnProps,
    body: (rowData: Project) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-sm text-right font-medium">{rowData.nameAr}</span>
      </div>
    ),
  },
  {
    field: "isActive",
    header: "Is Active",
    sortable: true,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: Project) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm text-center">
          {rowData.isActive ? "Yes" : "No"}
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
    body: (rowData: Project) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    ),
  },
];

const ProjectsPage = () => {
  const router = useRouter();

  const handleEdit = (project: Project) => {
    console.log("Edit project:", project);
    // TODO: Navigate to edit page or open edit modal
    // Example: router.push(`/projects/${project.id}/edit`);
  };

  const handleDelete = (project: Project) => {
    console.log("Delete project:", project);
    // TODO: Implement delete functionality with confirmation
    if (confirm(`Are you sure you want to delete ${project.nameEn}?`)) {
      // Delete logic here
      // Example: deleteProject(project.id);
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
    <div className="flex flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, Manage project records, and project details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="New Project"
            onClick={() => router.push("/projects/new")}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl overflow-hidden">
        <Table
          dataKey="id"
          data={projectsData}
          columns={columns(handleEdit, handleDelete)}
          customHeader={renderHeader}
        />
      </div>
    </div>
  );
};

export default ProjectsPage;
