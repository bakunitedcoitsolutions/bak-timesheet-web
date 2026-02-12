"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DataTableFilterMeta } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import {
  Input,
  Table,
  Badge,
  Button,
  TableRef,
  TypeBadge,
  TableColumn,
  TableActions,
  ExportOptions,
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
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { COMMON_QUERY_INPUT, STORAGE_CONFIG } from "@/utils/constants";
import { ListedEmployee } from "@/lib/db/services/employee/employee.dto";
import { useDeleteEmployee, useGetEmployees } from "@/lib/db/services/employee";
import { ListEmployeesSortableField } from "@/lib/db/services/employee/employee.dto";
import {
  useGlobalData,
  GlobalDataDesignation,
  GlobalDataGeneral,
} from "@/context/GlobalDataContext";

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

const commonColumnProps = {
  sortable: true,
  filterable: true,
  smallFilter: true,
  showFilterMenu: false,
  showClearButton: false,
  style: { minWidth: 200 },
};

type SortableField = keyof typeof SORTABLE_FIELDS;

// Helper component for profile picture with signed URL
const EmployeeProfilePicture = ({
  profilePicture,
  employeeName,
}: {
  profilePicture: string | null;
  employeeName: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profilePicture) {
      setIsLoading(false);
      return;
    }

    // Check if it's already a URL
    if (profilePicture.startsWith("http")) {
      setImageUrl(profilePicture);
      setIsLoading(false);
      return;
    }

    // Generate signed URL for private file
    getSignedUrl(STORAGE_CONFIG.EMPLOYEES_BUCKET, profilePicture, 3600)
      .then((signedUrl) => {
        setImageUrl(signedUrl);
      })
      .catch((error) => {
        console.error("Failed to get signed URL:", error);
        setImageUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [profilePicture]);

  if (isLoading) {
    return (
      <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
        <i className="pi pi-spin pi-spinner text-gray-400 text-sm"></i>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
        <Image
          width={48}
          height={48}
          src={imageUrl}
          alt={employeeName || "Employee"}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
      <i className="pi pi-user text-gray-400 text-xl"></i>
    </div>
  );
};

const columns = (
  handlePrint: (employee: ListedEmployee) => void,
  handleEdit: (employee: ListedEmployee) => void,
  handleDelete: (employee: ListedEmployee) => void,
  handleViewCard: (employee: ListedEmployee) => void
): TableColumn<ListedEmployee>[] => [
  {
    field: "id",
    header: "#",
    sortable: false,
    filterable: false,
    align: "center",
    style: { minWidth: "70px" },
    headerStyle: { minWidth: "70px" },
    body: (rowData: ListedEmployee) => (
      <div className={"flex items-center justify-center gap-1.5 w-[40px]"}>
        <span className="text-sm font-medium">{rowData?.id}</span>
      </div>
    ),
  },
  {
    field: "employeeCode",
    header: "Emp. Code",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="flex items-center gap-5">
        <EmployeeProfilePicture
          profilePicture={rowData.profilePicture}
          employeeName={rowData.nameEn}
        />
        <span
          className="text-sm font-semibold text-primary underline cursor-pointer"
          onClick={() => handleEdit(rowData)}
        >
          {rowData.employeeCode}
        </span>
      </div>
    ),
  },
  {
    field: "nameEn",
    header: "Name (En)",
    ...commonColumnProps,
    style: { minWidth: "250px" },
    body: (rowData: ListedEmployee) => (
      <span className="text-sm uppercase font-medium whitespace-nowrap">
        {rowData.nameEn}
      </span>
    ),
  },
  {
    field: "nameAr",
    header: "Name (Ar)",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-right font-medium font-arabic">
          {rowData.nameAr || ""}
        </span>
      </div>
    ),
  },
  {
    field: "gender",
    header: "Gender",
    style: { minWidth: 100 },
    filterable: false,
    sortable: true,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        <span className="text-sm">
          {rowData.gender === "male"
            ? "M"
            : rowData.gender === "female"
              ? "F"
              : "-"}
        </span>
      </div>
    ),
  },
  {
    field: "idCardNo",
    header: "ID No.",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData.idCardNo || "-"}</span>
    ),
  },
  {
    field: "designationId",
    header: "Designation",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: any) => (
      <span className="text-sm">
        {rowData?.designationName ? rowData.designationName : "-"}
      </span>
    ),
  },
  {
    field: "payrollSectionId",
    header: "Payroll Sect.",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: any) => (
      <span className="text-sm">
        {rowData?.payrollSectionName ? rowData.payrollSectionName : "-"}
      </span>
    ),
  },
  {
    field: "profession",
    header: "Profession",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-end">
        <span className="text-right font-medium font-arabic">
          {rowData.profession || ""}
        </span>
      </div>
    ),
  },
  {
    field: "hourlyRate",
    header: "Hourly Rate",
    sortable: false,
    filterable: false,
    style: { minWidth: 120 },
    body: (rowData: ListedEmployee) => (
      <div className="flex items-start justify-center gap-2">
        <span className="text-sm font-semibold">
          {rowData.hourlyRate && rowData.hourlyRate > 0 ? (
            rowData.hourlyRate.toString()
          ) : (
            <span className="text-text-gray font-normal">N/A</span>
          )}
        </span>
      </div>
    ),
  },
  {
    field: "salary",
    header: "Salary",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: ListedEmployee) => (
      <div className="flex justify-between gap-2">
        <span className="text-sm font-semibold">
          {rowData.salary && rowData.salary > 0 ? (
            rowData.salary.toString()
          ) : (
            <span className="text-text-gray font-normal">N/A</span>
          )}
        </span>
        <div className="flex items-start gap-2">
          {rowData.isFixed && <Badge text="F" />}
          {rowData.isDeductable && <Badge text="D" />}
        </div>
      </div>
    ),
  },
  {
    field: "openingBalance",
    header: "Opening Balance",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">
        {rowData.openingBalance?.toString() || "-"}
      </span>
    ),
  },
  {
    field: "nationality",
    header: "Nationality",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData?.nationality?.nameEn || "-"}</span>
    ),
  },
  {
    field: "phone",
    header: "Contact No.",
    ...commonColumnProps,
    body: (rowData: ListedEmployee) => (
      <span className="text-sm">{rowData.phone || "-"}</span>
    ),
  },
  {
    field: "isCardDelivered",
    header: "Card Delivered?",
    sortable: false,
    filterable: false,
    style: { minWidth: 150 },
    align: "center",
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        <TypeBadge
          text={rowData.isCardDelivered ? "Yes" : "No"}
          variant={rowData.isCardDelivered ? "success" : "danger"}
        />
      </div>
    ),
  },
  {
    field: "cardDocument",
    header: "ID Card",
    sortable: false,
    filterable: false,
    style: { minWidth: 100 },
    align: "center",
    body: (rowData: ListedEmployee) => (
      <div className="w-full flex flex-1 justify-center">
        {rowData.cardDocument ? (
          <span
            className="text-sm text-center text-primary underline cursor-pointer"
            onClick={() => handleViewCard(rowData)}
          >
            View
          </span>
        ) : (
          <span className="text-sm text-center text-text-gray">N/A</span>
        )}
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
    body: (rowData: ListedEmployee) => (
      <TableActions
        rowData={rowData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        beforeActions={[
          {
            icon: "pi pi-print text-lg!",
            label: "Print",
            severity: "secondary",
            onClick: handlePrint,
            tooltip: "Print",
          },
        ]}
      />
    ),
  },
];

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
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteEmployee } = useDeleteEmployee();

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
    // Column filters
    employeeCode: debouncedColumnFilters.employeeCode,
    nameEn: debouncedColumnFilters.nameEn,
    nameAr: debouncedColumnFilters.nameAr,
    phone: debouncedColumnFilters.phone,
    idCardNo: debouncedColumnFilters.idCardNo,
    profession: debouncedColumnFilters.profession,
    nationality: debouncedColumnFilters.nationality,
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

  const modifyEmployeesData = useMemo(() => {
    return employees.map((employee: ListedEmployee) => {
      const designation = designations.find(
        (designation: GlobalDataDesignation) =>
          designation.id === employee.designationId
      );
      const payrollSection = payrollSections.find(
        (payrollSection: GlobalDataGeneral) =>
          payrollSection.id === employee.payrollSectionId
      );
      return {
        ...employee,
        designationName: designation?.nameEn,
        payrollSectionName: payrollSection?.nameEn,
      };
    });
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
    console.log("Print employee:", employee);
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
          console.error("Failed to get signed URL:", error);
          toastService.showError("Error", "Failed to load card document");
        });
    }
  }, []);

  const exportCSV = useCallback(() => {
    tableRef.current?.exportCSV();
  }, []);

  const exportExcel = useCallback(() => {
    tableRef.current?.exportExcel();
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
    () => columns(handlePrint, handleEdit, handleDelete, handleViewCard),
    [handlePrint, handleEdit, handleDelete, handleViewCard]
  );

  // Memoized header renderer
  const renderHeader = useCallback(() => {
    return (
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 flex-1 w-full">
        <div className="w-full md:w-auto md:min-w-60">
          <GroupDropdown value={selectedFilter} onChange={setSelectedFilter} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div>
              <ExportOptions exportCSV={exportCSV} exportExcel={exportExcel} />
            </div>
          </div>
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
  }, [searchValue, exportCSV, exportExcel, selectedFilter]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="w-full md:w-auto flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            Employee Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View, manage employee records, personal information, and employment
            details.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <Button
            size="small"
            variant="solid"
            icon="pi pi-plus"
            label="New Employee"
            onClick={() => router.push("/employees/new")}
          />
        </div>
      </div>
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
