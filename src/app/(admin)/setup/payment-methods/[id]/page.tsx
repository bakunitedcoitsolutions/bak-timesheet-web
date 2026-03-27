"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdatePaymentMethod,
  useCreatePaymentMethod,
  useGetPaymentMethodById,
} from "@/lib/db/services/payment-method/requests";
import {
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
} from "@/lib/db/services/payment-method/payment-method.schemas";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import { Form, Input, Button, Dropdown, FormItem } from "@/components/forms";
import { StepperFormHeading } from "@/components";

const UpsertPaymentMethodPage = () => {
  const router = useRouter();
  const { id: paymentMethodIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: paymentMethodId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: paymentMethodIdParam,
  });

  const { mutateAsync: createPaymentMethod } = useCreatePaymentMethod();
  const { mutateAsync: updatePaymentMethod } = useUpdatePaymentMethod();
  const { data: foundPaymentMethod, isLoading } = useGetPaymentMethodById({
    id: paymentMethodId ? Number(paymentMethodId) : 0,
  });

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    isActive: true,
  };

  const zodSchema = isEditMode
    ? UpdatePaymentMethodSchema
    : CreatePaymentMethodSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
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
    if (foundPaymentMethod) {
      const setPaymentMethod = {
        ...(isEditMode ? { id: foundPaymentMethod?.id ?? 0 } : {}),
        nameEn: foundPaymentMethod?.nameEn,
        nameAr: foundPaymentMethod?.nameAr ?? "",
        isActive: foundPaymentMethod?.isActive,
      };
      reset(setPaymentMethod);
    }
  }, [foundPaymentMethod, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleAddPaymentMethod(data);
    } else {
      await handleUpdatePaymentMethod(data);
    }
  });

  const handleAddPaymentMethod = async (data: Record<string, any>) => {
    try {
      await createPaymentMethod(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Success",
            "Payment Method created successfully"
          );
          reset(defaultValues);
          router.replace("/setup/payment-methods");
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to create payment method"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  const handleUpdatePaymentMethod = async (data: Record<string, any>) => {
    try {
      await updatePaymentMethod(data, {
        onSuccess: () => {
          toastService.showSuccess(
            "Success",
            "Payment Method updated successfully"
          );
        },
        onError: (error: any) => {
          const errorMessage = getErrorMessage(
            error,
            "Failed to update payment method"
          );
          toastService.showError("Error", errorMessage);
        },
      });
    } catch (error) {}
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add Payment Method" : "Edit Payment Method"}
        />
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
                  <FormItem name="nameEn">
                    <Input
                      label="Name"
                      className="w-full"
                      placeholder="Enter name"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="nameAr">
                    <Input
                      label="Arabic Name"
                      className="w-full text-right"
                      placeholder="أدخل الاسم بالعربية"
                    />
                  </FormItem>
                </div>
                <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
                  <FormItem name="isActive">
                    <Dropdown
                      label="Status"
                      className="w-full"
                      placeholder="Choose"
                      options={STATUS_OPTIONS}
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
                onClick={() => router.replace("/setup/payment-methods")}
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

export default UpsertPaymentMethodPage;
