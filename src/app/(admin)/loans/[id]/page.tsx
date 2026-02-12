"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

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
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import {
  Input,
  Button,
  Dropdown,
  Form,
  FormItem,
  NumberInput,
  Textarea,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";

const loanTypeOptions = [
  { label: "Loan", value: "LOAN" },
  { label: "Return", value: "RETURN" },
];

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
  const { data: foundLoan, isLoading } = useGetLoanById({
    id: loanId ? Number(loanId) : 0,
  });

  // Fetch employees
  const { data: globalData } = useGlobalData();
  const employees = globalData.employees || [];

  const employeeOptions = employees.map((employee: GlobalDataEmployee) => ({
    label: `${employee.employeeCode} - ${employee.nameEn}`,
    value: employee.id,
  }));

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
            <Form
              form={form}
              className="w-full h-full content-start md:max-w-5xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-4 md:py-5 px-6 mt-5 md:mt-0 flex-1">
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="date">
                    <Input
                      type="date"
                      label="Date"
                      className="w-full"
                      placeholder="Select date"
                    />
                  </FormItem>
                </div>

                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="employeeId">
                    <Dropdown
                      label="Employee"
                      className="w-full"
                      placeholder="Choose employee"
                      options={employeeOptions}
                      filter
                      showClear
                    />
                  </FormItem>
                </div>

                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="type">
                    <Dropdown
                      label="Type"
                      className="w-full"
                      placeholder="Choose type"
                      options={loanTypeOptions}
                    />
                  </FormItem>
                </div>

                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="amount">
                    <NumberInput
                      label="Amount"
                      className="w-full"
                      placeholder="Enter amount"
                      min={0}
                      mode="decimal"
                    />
                  </FormItem>
                </div>

                <div className={classNames("md:col-span-2")}>
                  <FormItem name="remarks">
                    <Textarea
                      label="Remarks"
                      className="w-full"
                      placeholder="Enter remarks..."
                      rows={4}
                    />
                  </FormItem>
                </div>
              </div>
            </Form>

            <div className="flex items-center gap-3 justify-end px-6">
              <Button
                size="small"
                variant="text"
                disabled={isSubmitting}
                onClick={() => router.replace("/loans")}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="solid"
                onClick={onFormSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-28 justify-center! gap-1"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpsertLoanPage;
