import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "@/lib/db/services/project/project.schemas";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import {
  Input,
  Button,
  Dropdown,
  Form,
  FormItem,
  Textarea,
} from "@/components/forms";

interface ProjectFormProps {
  isAddMode: boolean;
  isEditMode: boolean;
  initialData?: any;
  branchOptions: { label: string; value: number }[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export const ProjectForm = ({
  isAddMode,
  isEditMode,
  initialData,
  branchOptions,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) => {
  const router = useRouter();
  const zodSchema = isEditMode ? UpdateProjectSchema : CreateProjectSchema;

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    branchId: undefined,
    description: "",
    isActive: true,
  };

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const { reset, handleSubmit } = form;

  useEffect(() => {
    if (initialData) {
      const setProject = {
        ...(isEditMode ? { id: initialData?.id ?? 0 } : {}),
        nameEn: initialData?.nameEn,
        nameAr: initialData?.nameAr ?? "",
        branchId: initialData?.branchId ?? undefined,
        description: initialData?.description ?? "",
        isActive: initialData?.isActive,
      };
      reset(setProject);
    }
  }, [initialData, isEditMode, reset]);

  return (
    <>
      <Form
        form={form}
        className="w-full h-full content-start md:max-w-5xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-4 md:py-5 px-6 mt-5 md:mt-0 flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="nameEn">
              <Input
                label="Project Name"
                className="w-full"
                placeholder="Enter project name"
              />
            </FormItem>
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="nameAr">
              <Input
                label="Arabic Name"
                className="w-full text-right"
                placeholder="أدخل اسم المشروع بالعربية"
              />
            </FormItem>
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="branchId">
              <Dropdown
                label="Branch"
                className="w-full"
                placeholder="Choose branch"
                options={branchOptions}
                showClear
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
          <div className={classNames("md:col-span-2")}>
            <FormItem name="description">
              <Textarea
                label="Description"
                className="w-full"
                placeholder="Enter project description"
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
          onClick={() => router.replace("/projects")}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="solid"
          onClick={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-28 justify-center! gap-1"
        >
          Save
        </Button>
      </div>
    </>
  );
};
