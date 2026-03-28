"use client";
import { useRouter } from "next/navigation";
import { DataTableFilterMeta } from "primereact/datatable";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import { TableRef, useAccess } from "@/components";
import { getErrorMessage, createSortHandler } from "@/utils/helpers";
import {
  ListedProject,
  ListProjectsSortableField,
} from "@/lib/db/services/project/project.dto";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useDeleteProject,
  useGetProjects,
} from "@/lib/db/services/project/requests";

// Components
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectTable } from "./components/ProjectTable";

// Helpers
import {
  SortableField,
  SORTABLE_FIELDS,
  getProjectTableColumns,
} from "./helpers";

const ProjectsPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<
    SortableField | ListProjectsSortableField
  >("createdAt");
  const { role } = useAccess();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteProject } = useDeleteProject();

  // Debounce search input and column filters
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedColumnFilters = useDebounce(columnFilters, 500);

  // Reset to first page when search value or filter changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  // Reset to first page when column filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedColumnFilters]);

  const handleFilterChange = useCallback((filters: DataTableFilterMeta) => {
    const newFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([field, filterMeta]) => {
      // Skip global filter
      if (field === "global") return;

      // Handle different filter meta structures
      const meta = filterMeta as any;
      if (meta && meta.value) {
        newFilters[field] = meta.value;
      }
    });

    setColumnFilters(newFilters);
  }, []);

  const { data: projectsResponse, isLoading } = useGetProjects({
    page,
    limit,
    sortBy: sortBy as ListProjectsSortableField,
    sortOrder,
    search: debouncedSearch || undefined,
    // Column filters
    nameEn: debouncedColumnFilters.nameEn,
    nameAr: debouncedColumnFilters.nameAr,
    description: debouncedColumnFilters.description,
  });

  const isAccessEnabledUser = role === 4;
  const projects = projectsResponse?.projects ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = projectsResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (project: ListedProject) => {
      router.push(`/projects/${project.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (project: ListedProject) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Project",
        message: `Are you sure you want to delete "${project.nameEn}"?`,
        onAccept: async () => {
          await deleteProject(
            { id: project.id },
            {
              onSuccess: () => {
                toastService.showInfo("Done", "Project deleted successfully");
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete project"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteProject]
  );

  const exportCSV = useCallback(() => {
    tableRef.current?.exportCSV();
  }, []);

  const exportExcel = useCallback(() => {
    tableRef.current?.exportExcel();
  }, []);

  const handlePageChange = useCallback(
    (e: { page?: number; rows?: number }) => {
      setPage((e.page ?? 0) + 1);
      setLimit(e.rows ?? currentLimit);
    },
    [currentLimit]
  );

  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  const handleSortByChange = useCallback((field: SortableField | undefined) => {
    setSortBy(field ?? "createdAt");
  }, []);

  const handleSortOrderChange = useCallback(
    (order: "asc" | "desc" | undefined) => {
      setSortOrder(order ?? "desc");
    },
    []
  );

  const sortHandler = useMemo(
    () =>
      createSortHandler({
        fieldMap: SORTABLE_FIELDS,
        currentPage: page,
        onSortByChange: handleSortByChange,
        onSortOrderChange: handleSortOrderChange,
        onPageReset: handlePageReset,
      }),
    [page, handlePageReset, handleSortByChange, handleSortOrderChange]
  );

  const tableColumns = useMemo(
    () => getProjectTableColumns(handleEdit, handleDelete, isAccessEnabledUser),
    [handleEdit, handleDelete, isAccessEnabledUser]
  );

  const renderHeader = useCallback(
    () => (
      <ProjectFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        exportCSV={exportCSV}
        exportExcel={exportExcel}
      />
    ),
    [searchValue, exportCSV, exportExcel]
  );

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <ProjectHeader
        isAccessEnabledUser={isAccessEnabledUser}
        onNewProject={() => router.push("/projects/new")}
      />

      <ProjectTable
        projects={projects}
        isLoading={isLoading}
        tableRef={tableRef}
        columns={tableColumns}
        renderHeader={renderHeader}
        onPageChange={handlePageChange}
        onSort={sortHandler}
        onFilter={handleFilterChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        currentLimit={currentLimit}
        currentPage={currentPage}
        total={total}
      />
    </div>
  );
};

export default ProjectsPage;
