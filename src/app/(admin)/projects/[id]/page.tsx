"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProgressSpinner } from "primereact/progressspinner";

import {
  useUpdateProject,
  useCreateProject,
  useGetProjectById,
} from "@/lib/db/services/project/requests";
import { useGlobalData, GlobalDataGeneral } from "@/context/GlobalDataContext";
import { toastService } from "@/lib/toast";
import { getEntityModeFromParam } from "@/helpers";
import { getErrorMessage } from "@/utils/helpers";
import { StepperFormHeading, useAccess } from "@/components";
import { ProjectForm } from "./components/ProjectForm";

const UpsertProjectPage = () => {
  const router = useRouter();
  const { id: projectIdParam } = useParams();
  const { role } = useAccess();
  const isAccessEnabledUser = role === 4;
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { data: globalData } = useGlobalData();
  const branchOptions = (globalData.branches || []).map(
    (branch: GlobalDataGeneral) => ({
      label: branch.nameEn,
      value: branch.id,
    })
  );

  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    } else if (isAccessEnabledUser) {
      toastService.showError(
        "Access Denied",
        "You do not have permission to access this page"
      );
      router.replace("/projects");
    }
  }, [isInvalid, isAccessEnabledUser, router]);

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isAddMode) {
        await createProject(data);
        toastService.showSuccess("Done", "Project created successfully");
      } else {
        await updateProject(data);
        toastService.showSuccess("Done", "Project updated successfully");
      }
      router.replace("/projects");
    } catch (error) {
      const errorMessage = getErrorMessage(
        error,
        `Failed to ${isAddMode ? "create" : "update"} project`
      );
      toastService.showError("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
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
          <ProjectForm
            isAddMode={isAddMode}
            isEditMode={isEditMode}
            initialData={foundProject}
            branchOptions={branchOptions}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default UpsertProjectPage;
