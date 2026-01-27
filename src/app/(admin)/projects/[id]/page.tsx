"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { classNames } from "primereact/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateProject,
  useCreateProject,
  useGetProjectById,
} from "@/lib/db/services/project/requests";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from "@/lib/db/services/project/project.schemas";
import { useGetBranches } from "@/lib/db/services/branch/requests";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";
import {
  Input,
  Button,
  Dropdown,
  Form,
  FormItem,
  Textarea,
} from "@/components/forms";
import { StepperFormHeading } from "@/components";
import { ListedBranch } from "@/lib/db/services/branch/branch.dto";

const UpsertProjectPage = () => {
  const router = useRouter();
  const { id: projectIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: projectId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: projectIdParam,
  });

  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: updateProject } = useUpdateProject();
  const { data: foundProject, isLoading } = useGetProjectById({
    id: projectId ? Number(projectId) : 0,
  });

  // Fetch branches
  const { data: branchesResponse } = useGetBranches({
    page: 1,
    limit: 1000,
  });
  const branches = branchesResponse?.branches ?? [];

  const branchOptions = branches.map((branch: ListedBranch) => ({
    label: branch.nameEn,
    value: branch.id,
  }));

  const defaultValues = {
    ...(isEditMode ? { id: 0 } : {}),
    nameEn: "",
    nameAr: "",
    branchId: undefined,
    description: "",
    isActive: true,
  };

  const zodSchema = isEditMode ? UpdateProjectSchema : CreateProjectSchema;

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  useEffect(() => {
    if (foundProject) {
      const setProject = {
        ...(isEditMode ? { id: foundProject?.id ?? 0 } : {}),
        nameEn: foundProject?.nameEn,
        nameAr: foundProject?.nameAr ?? "",
        branchId: foundProject?.branchId ?? undefined,
        description: foundProject?.description ?? "",
        isActive: foundProject?.isActive,
      };
      reset(setProject);
    }
  }, [foundProject, isEditMode, reset]);

  const onFormSubmit = handleSubmit(async (data) => {
    if (isAddMode) {
      await handleCreateProject(data);
    } else {
      await handleUpdateProject(data);
    }
  });

  const handleCreateProject = async (data: any) => {
    try {
      await createProject(data);
      toastService.showSuccess("Done", "Project created successfully");
      router.replace("/projects");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to create project");
      toastService.showError("Error", errorMessage);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      await updateProject(data);
      toastService.showSuccess("Done", "Project updated successfully");
      router.replace("/projects");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to update project");
      toastService.showError("Error", errorMessage);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add Project" : "Edit Project"}
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

export default UpsertProjectPage;
