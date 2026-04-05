"use client";
import { useRouter } from "next/navigation";
import { DataTableFilterMeta } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import {
  Input,
  Table,
  TableRef,
  Dropdown,
  useAccess,
  GroupDropdown,
} from "@/components";
import {
  getSignedUrl,
  getErrorMessage,
  createSortHandler,
  toPrimeReactSortOrder,
  parseGroupDropdownFilter,
} from "@/utils/helpers";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { STORAGE_CONFIG } from "@/utils/constants";
import { useGlobalData } from "@/context/GlobalDataContext";
import { devConsole, devError } from "@/utils/helpers/functions";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { useDeleteEmployee, useGetEmployees } from "@/lib/db/services/employee";
import { ListEmployeesSortableField } from "@/lib/db/services/employee/employee.dto";

// Components
import { EmployeeHeader } from "./components/EmployeeHeader";
import { getEmployeeTableColumns } from "./components/EmployeeTableColumns";

// Helpers
import { getModifiedEmployeesData, parseDataTableFilters } from "./helpers";

// Constants
const SORTABLE_FIELDS = {
  nameEn: "nameEn",
  nameAr: "nameAr",
  employeeCode: "employeeCode",
  phone: "phone",
  dob: "dob",
  joiningDate: "joiningDate",
  contractStartDate: "contractStartDate",
  contractEndDate: "contractEndDate",
  gender: "gender",
  idCardNo: "idCardNo",
  profession: "profession",
  nationality: "nationality",
} as const;

type SortableField = keyof typeof SORTABLE_FIELDS;

const EmployeesPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<
    SortableField | ListEmployeesSortableField
  >("employeeCode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>(
    "all"
  );
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [selectedStatusId, setSelectedStatusId] = useState<number | "all">(1);
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteEmployee } = useDeleteEmployee();

  const { can, role } = useAccess();
  const canEdit = can("employees", "edit");
  const canAdd = can("employees", "add");

  // Debounce search input and column filters
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedColumnFilters = useDebounce(columnFilters, 500);

  // Reset to first page when search value or filter changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [selectedFilter]);

  // Reset to first page when column filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedColumnFilters, selectedStatusId]);

  const handleFilterChange = useCallback((filters: DataTableFilterMeta) => {
    const newFilters = parseDataTableFilters(filters);
    setColumnFilters(newFilters);
  }, []);

  // Parse filter parameters from GroupDropdown selection
  const filterParams = parseGroupDropdownFilter(selectedFilter);

  const { data: employeesResponse, isLoading } = useGetEmployees({
    page,
    limit,
    sortBy: sortBy as ListEmployeesSortableField,
    sortOrder,
    search: debouncedSearch || undefined,
    designationId: filterParams.designationId,
    payrollSectionId: filterParams.payrollSectionId,
    statusId: selectedStatusId === "all" ? undefined : selectedStatusId,
    // Column filters
    phone: debouncedColumnFilters.phone,
    nameEn: debouncedColumnFilters.nameEn,
    nameAr: debouncedColumnFilters.nameAr,
    idCardNo: debouncedColumnFilters.idCardNo,
    profession: debouncedColumnFilters.profession,
    nationality: debouncedColumnFilters.nationality,
    employeeCode: debouncedColumnFilters.employeeCode,
  });

  const employees = employeesResponse?.employees ?? [];

  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = employeesResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
  };

  const { data: globalData } = useGlobalData();
  const designations = globalData.designations || [];
  const payrollSections = globalData.payrollSections || [];
  const employeeStatuses = globalData.employeeStatuses || [];


  const modifyEmployeesData = useMemo(() => {
    return getModifiedEmployeesData(employees, designations, payrollSections);
  }, [employees, designations, payrollSections]);

  // Memoized handlers
  const handleEdit = useCallback(
    (employee: ListedEmployee) => {
      router.push(`/employees/${employee.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (employee: ListedEmployee) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete Employee",
        message: `Are you sure you want to delete "${employee.nameEn}"?`,
        onAccept: async () => {
          await deleteEmployee(
            { id: employee.id },
            {
              onSuccess: () => {
                toastService.showInfo("Done", "Employee deleted successfully");
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete employee"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteEmployee]
  );

  const handlePrint = useCallback((employee: ListedEmployee) => {
    devConsole("Print employee card:", employee);
    // TODO: Implement print functionality
  }, []);

  const handleViewCard = useCallback((employee: ListedEmployee) => {
    if (employee.cardDocument) {
      // Generate signed URL and open in new tab
      getSignedUrl(STORAGE_CONFIG.EMPLOYEES_BUCKET, employee.cardDocument, 3600)
        .then((signedUrl) => {
          window.open(signedUrl, "_blank");
        })
        .catch((error) => {
          devError("Failed to get signed URL:", error);
          toastService.showError("Error", "Failed to load card document");
        });
    }
  }, []);

  const handlePageChange = useCallback(
    (e: { page?: number; rows?: number }) => {
      const newPage = (e.page ?? 0) + 1;
      const newLimit = e.rows ?? currentLimit;
      setPage(newPage);
      setLimit(newLimit);
    },
    [currentLimit]
  );

  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  // Wrapper for setSortBy to handle undefined (reset to default)
  const handleSortByChange = useCallback((field: SortableField | undefined) => {
    setSortBy(field ?? "employeeCode");
  }, []);

  // Wrapper for setSortOrder to handle undefined (reset to default)
  const handleSortOrderChange = useCallback(
    (order: "asc" | "desc" | undefined) => {
      setSortOrder(order ?? "asc");
    },
    []
  );

  // Memoized sort handler
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

  // Memoized columns
  const tableColumns = useMemo(
    () =>
      getEmployeeTableColumns({
        role,
        canEdit,
        handleEdit,
        handlePrint,
        handleDelete,
        handleViewCard,
      }),
    [handlePrint, role, handleEdit, canEdit, handleDelete, handleViewCard]
  );

  // Memoized header renderer
  const renderHeader = useCallback(() => {
    const statusOptions = [
      { label: "All Status", value: "all" },
      ...employeeStatuses.map((s) => ({ label: s.nameEn, value: s.id })),
    ];

    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-60">
            <GroupDropdown
              value={selectedFilter}
              onChange={setSelectedFilter}
            />
          </div>
          <div className="w-full lg:w-60">
            <Dropdown
              small
              value={selectedStatusId}
              options={statusOptions}
              onChange={(e) => setSelectedStatusId(e.value ?? "all")}
              placeholder="Status"
              className="w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="w-full md:w-auto">
            <Input
              small
              className="w-full"
              value={searchValue}
              icon="pi pi-search"
              iconPosition="left"
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              placeholder="Search"
            />
          </div>
        </div>
      </div>
    );
  }, [searchValue, selectedFilter, selectedStatusId, employeeStatuses]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <EmployeeHeader
        canAdd={canAdd}
        onNewEmployee={() => router.push("/employees/new")}
      />
      <div className="bg-white flex-1 rounded-xl overflow-hidden min-h-0">
        <Table
          dataKey="id"
          removableSort
          data={modifyEmployeesData}
          ref={tableRef}
          loading={isLoading}
          loadingIcon={
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          }
          customHeader={renderHeader}
          columns={tableColumns}
          sortMode="single"
          onPage={handlePageChange}
          onSort={sortHandler}
          sortField={sortBy}
          sortOrder={toPrimeReactSortOrder(sortOrder) as any}
          pagination={true}
          lazy={true}
          onFilter={handleFilterChange}
          rowsPerPageOptions={[10, 25, 50]}
          rows={currentLimit}
          first={(currentPage - 1) * currentLimit}
          totalRecords={total}
          globalSearch={true}
          scrollable
          scrollHeight="65vh"
        />
      </div>
    </div>
  );
};

export default EmployeesPage;
