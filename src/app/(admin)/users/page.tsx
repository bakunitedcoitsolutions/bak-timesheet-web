"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

import { TableRef } from "@/components";
import { getErrorMessage, createSortHandler } from "@/utils/helpers";
import { ListedUser } from "@/lib";
import { useDebounce } from "@/hooks";
import { toastService } from "@/lib/toast";
import { showConfirmDialog } from "@/components/common/confirm-dialog";
import { useDeleteUser, useGetUsers } from "@/lib/db/services/user/requests";

// Sub-components and Helpers
import { SORTABLE_FIELDS, SortableField, createColumns } from "./helpers";
import { UsersHeader } from "./components/UsersHeader";
import { UsersFilters } from "./components/UsersFilters";
import { UsersTable } from "./components/UsersTable";

const UsersPage = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [sortBy, setSortBy] = useState<SortableField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(
    undefined
  );
  const tableRef = useRef<TableRef>(null);
  const { mutateAsync: deleteUser } = useDeleteUser();

  // Debounce search input
  const debouncedSearch = useDebounce(searchValue, 500);

  // Reset to first page when search value changes
  useEffect(() => {
    if (searchValue !== debouncedSearch && page !== 1) {
      setPage(1);
    }
  }, [searchValue, debouncedSearch, page]);

  const { data: usersResponse, isLoading } = useGetUsers({
    page,
    limit,
    sortBy,
    sortOrder,
    search: debouncedSearch || undefined,
  });

  const users = usersResponse?.users ?? [];
  const {
    total,
    page: currentPage,
    limit: currentLimit,
  } = usersResponse?.pagination ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // Memoized handlers
  const handleEdit = useCallback(
    (user: ListedUser) => {
      router.push(`/users/${user.id}`);
    },
    [router]
  );

  const handleDelete = useCallback(
    (user: ListedUser) => {
      showConfirmDialog({
        icon: "pi pi-trash",
        title: "Delete User",
        message: `Are you sure you want to delete "${user.nameEn}"?`,
        onAccept: async () => {
          await deleteUser(
            { id: user.id },
            {
              onSuccess: () => {
                toastService.showInfo("Done", "User deleted successfully");
              },
              onError: (error: any) => {
                const errorMessage = getErrorMessage(
                  error,
                  "Failed to delete user"
                );
                toastService.showError("Error", errorMessage);
              },
            }
          );
        },
      });
    },
    [deleteUser]
  );

  const handlePageChange = useCallback(
    (e: { page?: number; rows?: number }) => {
      // PrimeReact uses 0-based page index, our API uses 1-based
      setPage((e.page ?? 0) + 1);
      setLimit(e.rows ?? currentLimit);
    },
    [currentLimit]
  );

  const handlePageReset = useCallback(() => {
    setPage(1);
  }, []);

  // Memoized sort handler
  const sortHandler = useMemo(
    () =>
      createSortHandler({
        fieldMap: SORTABLE_FIELDS,
        currentPage: page,
        onSortByChange: setSortBy,
        onSortOrderChange: setSortOrder,
        onPageReset: handlePageReset,
      }),
    [page, handlePageReset]
  );

  // Memoized columns
  const tableColumns = useMemo(
    () => createColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  // Memoized header renderer
  const renderHeader = useCallback(() => {
    return (
      <UsersFilters searchValue={searchValue} onSearchChange={setSearchValue} />
    );
  }, [searchValue]);

  return (
    <div className="flex h-full flex-col gap-6 px-6 py-6 font-primary">
      <UsersHeader onAddUser={() => router.push("/users/new")} />

      <UsersTable
        tableRef={tableRef}
        users={users}
        isLoading={isLoading}
        columns={tableColumns}
        renderHeader={renderHeader}
        page={currentPage}
        limit={currentLimit}
        total={total}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onPageChange={handlePageChange}
        onSort={sortHandler}
      />
    </div>
  );
};

export default UsersPage;
