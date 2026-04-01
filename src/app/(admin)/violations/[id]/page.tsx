"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import { useGetPayrollSummaryStatus } from "@/lib/db/services/payroll-summary/requests";
import {
  useUpdateTrafficChallan,
  useCreateTrafficChallan,
  useGetTrafficChallanById,
} from "@/lib/db/services/traffic-challan/requests";
import {
  CreateTrafficChallanSchema,
  UpdateTrafficChallanSchema,
} from "@/lib/db/services/traffic-challan/traffic-challan.schemas";
import { useGlobalData, GlobalDataEmployee } from "@/context/GlobalDataContext";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { useAccess } from "@/components";
import { ViolationsUpsertHeader } from "./components/ViolationsUpsertHeader";
import { ViolationsForm } from "./components/ViolationsForm";
import {
  VIOLATION_DEFAULT_VALUES,
  getMonthYearFromDate,
  checkIsPayrollPosted,
} from "./helpers";

const UpsertChallanPage = () => {
  const router = useRouter();
  const { id: challanIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: challanId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: challanIdParam,
  });

  const { mutateAsync: createTrafficChallan } = useCreateTrafficChallan();
  const { mutateAsync: updateTrafficChallan } = useUpdateTrafficChallan();
  const { data: foundChallan, isLoading: isChallanLoading } =
    useGetTrafficChallanById({
      id: challanId ? Number(challanId) : 0,
    });

  const {
    can,
    isBranchScoped,
    branchId: userBranchId,
    isLoading: isAccessLoading,
  } = useAccess();
  const canEdit =
    can("trafficViolations", "edit") || can("trafficViolations", "full");
  const canAdd =
    can("trafficViolations", "add") || can("trafficViolations", "full");

  // Redirect if insufficient permissions
  useEffect(() => {
    if (isAccessLoading) return;
    if (isAddMode && !canAdd) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to add traffic violations."
      );
      router.replace("/violations");
    } else if (isEditMode && !canEdit) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to edit traffic violations."
      );
      router.replace("/violations");
    } else if (
      isEditMode &&
      isBranchScoped &&
      foundChallan &&
      Number(foundChallan.employee?.branchId) !== Number(userBranchId)
    ) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to edit this traffic violation."
      );
      setTimeout(() => {
        router.replace("/violations");
      }, 100);
    }
  }, [
    isAddMode,
    isEditMode,
    canAdd,
    canEdit,
    foundChallan,
    isBranchScoped,
    userBranchId,
    isAccessLoading,
    router,
  ]);

  const isLoading = isChallanLoading || isAccessLoading;

  // Fetch employees (already filtered by branch in GlobalDataContext)
  const { data: globalData } = useGlobalData();
  const employees = globalData.employees || [];

  const employeeOptions = useMemo(
    () =>
      employees.map((employee: GlobalDataEmployee) => ({
        label: `${employee.employeeCode} - ${employee.nameEn}`,
        value: employee.id,
      })),
    [employees]
  );

  const zodSchema = isEditMode
    ? UpdateTrafficChallanSchema
    : CreateTrafficChallanSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema) as any,
    defaultValues: {
      ...VIOLATION_DEFAULT_VALUES,
      ...(isEditMode ? { id: 0 } : {}),
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = form;

  const dateValue = watch("date");

  const { month: selectedMonth, year: selectedYear } = useMemo(() => {
    const targetDate = isEditMode ? foundChallan?.date : dateValue;
    return getMonthYearFromDate(targetDate);
  }, [isEditMode, foundChallan?.date, dateValue]);

  const { data: payrollSummaryStatus } = useGetPayrollSummaryStatus({
    month: selectedMonth,
    year: selectedYear,
  });

  const isPayrollPosted = checkIsPayrollPosted(
    payrollSummaryStatus,
    isEditMode ? foundChallan?.date : dateValue
  );

  useEffect(() => {
    if (isEditMode && isPayrollPosted) {
      toastService.showError(
        "Access Denied",
        "Cannot edit traffic violation as payroll for this month is already posted."
      );
      router.replace("/violations");
    } else if (isAddMode && isPayrollPosted && dateValue) {
      toastService.showError(
        "Error",
        "Cannot add traffic violation for this date as payroll for this month is already posted."
      );
      setValue("date", "");
    }
  }, [isEditMode, isAddMode, isPayrollPosted, dateValue, router, setValue]);

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundChallan) {
      const setChallan = {
        ...(isEditMode ? { id: foundChallan?.id ?? 0 } : {}),
        employeeId: foundChallan?.employeeId,
        date: foundChallan?.date
          ? new Date(foundChallan.date).toISOString().split("T")[0]
          : "",
        type: foundChallan?.type,
        amount: foundChallan?.amount ?? undefined,
        description: foundChallan?.description ?? "",
      };
      reset(setChallan);
    }
  }, [foundChallan, isEditMode, reset]);

  const handleCreateChallan = async (data: any) => {
    try {
      await createTrafficChallan(data);
      toastService.showSuccess(
        "Done",
        "Traffic Violation created successfully"
      );
      router.replace("/violations");
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to create traffic Violation"
      );
      toastService.showError("Error", errorMessage);
    }
  };

  const handleUpdateChallan = async (data: any) => {
    try {
      await updateTrafficChallan({
        id: challanId ? Number(challanId) : 0,
        ...data,
      });
      toastService.showSuccess(
        "Done",
        "Traffic Violation updated successfully"
      );
      router.replace("/violations");
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to update traffic Violation"
      );
      toastService.showError("Error", errorMessage);
    }
  };

  const onFormSubmit = handleSubmit(async (data) => {
    if (isPayrollPosted) {
      toastService.showError(
        "Error",
        "Cannot save as payroll for this month is already posted."
      );
      return;
    }
    if (isAddMode) {
      await handleCreateChallan(data);
    } else {
      await handleUpdateChallan(data);
    }
  });

  const onCancel = useCallback(() => {
    router.replace("/violations");
  }, [router]);

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6 font-primary">
      <div className="flex bg-white h-full justify-between flex-1 md:flex-none flex-col gap-4 py-8 rounded-xl shadow-[0px_4px_24px_-8px_#4D5BEC3B]">
        <ViolationsUpsertHeader isAddMode={isAddMode} />
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <ViolationsForm
            form={form}
            employeeOptions={employeeOptions}
            isSubmitting={isSubmitting}
            onCancel={onCancel}
            onSubmit={onFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default UpsertChallanPage;
