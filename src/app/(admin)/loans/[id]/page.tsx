"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";
import dayjs from "dayjs";

import { useGetPayrollSummaryStatus } from "@/lib/db/services/payroll-summary/requests";
import {
  useUpdateLoan,
  useCreateLoan,
  useGetLoanById,
} from "@/lib/db/services/loan/requests";
import {
  CreateLoanSchema,
  UpdateLoanSchema,
} from "@/lib/db/services/loan/loan.schemas";
import { useGlobalData, GlobalDataEmployee } from "@/context/GlobalDataContext";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";

import { StepperFormHeading, useAccess } from "@/components";

// Components
import { LoanForm } from "./components/LoanForm";
import { LoanFormActions } from "./components/LoanFormActions";

// Helpers
import { loanTypeOptions } from "./helpers";

const UpsertLoanPage = () => {
  const router = useRouter();
  const { id: loanIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: loanId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: loanIdParam,
  });

  const { mutateAsync: createLoan } = useCreateLoan();
  const { mutateAsync: updateLoan } = useUpdateLoan();
  const { data: foundLoan, isLoading: isLoanLoading } = useGetLoanById({
    id: loanId ? Number(loanId) : 0,
  });

  const { can, isLoading: isAccessLoading } = useAccess();
  const canEdit = can("loans", "edit") || can("loans", "full");
  const canAdd = can("loans", "add") || can("loans", "full");

  // Redirect if insufficient permissions
  useEffect(() => {
    if (isAccessLoading) return;
    if (isAddMode && !canAdd) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to add loans."
      );
      router.replace("/loans");
    } else if (isEditMode && !canEdit) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to edit loans."
      );
      router.replace("/loans");
    }
  }, [isAddMode, isEditMode, canAdd, canEdit, isAccessLoading, router]);

  const isLoading = isLoanLoading || isAccessLoading;

  // Fetch employees
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

  const zodSchema = isEditMode ? UpdateLoanSchema : CreateLoanSchema;

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    employeeId: undefined as number | undefined,
    date: "",
    type: undefined as "LOAN" | "RETURN" | undefined,
    amount: undefined as number | undefined,
    remarks: "",
  };

  const form = useForm({
    resolver: zodResolver(zodSchema) as any,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const dateValue = form.watch("date");

  const { month: selectedMonth, year: selectedYear } = useMemo(() => {
    if (isEditMode) {
      if (!foundLoan?.date) return { month: 0, year: 0 };
      const d = dayjs(foundLoan.date);
      return { month: d.month() + 1, year: d.year() };
    } else {
      const d = dayjs(dateValue || new Date());
      return { month: d.month() + 1, year: d.year() };
    }
  }, [isEditMode, foundLoan?.date, dateValue]);

  const { data: payrollSummaryStatus } = useGetPayrollSummaryStatus({
    month: selectedMonth,
    year: selectedYear,
  });

  const isPayrollPosted = payrollSummaryStatus?.payrollStatusId === 3;

  useEffect(() => {
    if (isEditMode && isPayrollPosted) {
      toastService.showError(
        "Access Denied",
        "Cannot edit loan as payroll for this month is already posted."
      );
      router.replace("/loans");
    } else if (isAddMode && isPayrollPosted && dateValue) {
      toastService.showError(
        "Error",
        "Cannot add loan for this date as payroll for this month is already posted."
      );
      form.setValue("date", dayjs().format("YYYY-MM-DD"));
    }
  }, [isEditMode, isAddMode, isPayrollPosted, dateValue, router, form]);

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundLoan) {
      const setLoan = {
        ...(isEditMode ? { id: foundLoan?.id ?? 0 } : {}),
        employeeId: foundLoan?.employeeId,
        date: foundLoan?.date
          ? new Date(foundLoan.date).toISOString().split("T")[0]
          : "",
        type: foundLoan?.type,
        amount: foundLoan?.amount ?? undefined,
        remarks: foundLoan?.remarks ?? "",
      };
      reset(setLoan);
    }
  }, [foundLoan, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isPayrollPosted) {
      toastService.showError(
        "Error",
        "Cannot save as payroll for this month is already posted."
      );
      return;
    }
    if (isAddMode) {
      await handleCreateLoan(data);
    } else {
      await handleUpdateLoan(data);
    }
  });

  const handleCreateLoan = async (data: any) => {
    try {
      await createLoan(data);
      toastService.showSuccess("Done", "Loan created successfully");
      router.replace("/loans");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to create loan");
      toastService.showError("Error", errorMessage);
    }
  };

  const handleUpdateLoan = async (data: any) => {
    try {
      await updateLoan({ id: loanId ? Number(loanId) : 0, ...data });
      toastService.showSuccess("Done", "Loan updated successfully");
      router.replace("/loans");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to update loan");
      toastService.showError("Error", errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add Loan" : "Edit Loan"} />
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          </div>
        ) : (
          <>
            <LoanForm
              form={form}
              employeeOptions={employeeOptions}
              loanTypeOptions={loanTypeOptions}
            />
            <LoanFormActions
              onSave={onFormSubmit}
              isSubmitting={isSubmitting}
              onCancel={() => router.replace("/loans")}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UpsertLoanPage;
