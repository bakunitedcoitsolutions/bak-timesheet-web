"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { classNames } from "primereact/utils";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Button, Dropdown, Input } from "@/components/forms";

const projectStatusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const UpsertProjectPage = () => {
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<
    string | null
  >(null);
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

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
    router.replace(`/projects`);
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add Project" : "Edit Project"}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
            <Input
              label="Full Name (En)"
              className="w-full"
              placeholder="Enter full name in English"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
            <Input
              label="Full Name (Ar)"
              className="w-full text-right"
              placeholder="أدخل الاسم الكامل بالعربية"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
            <Dropdown
              label="Project Status"
              className="w-full"
              options={projectStatusOptions}
              placeholder="Choose"
              selectedItem={selectedProjectStatus}
              setSelectedItem={setSelectedProjectStatus}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/projects")}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="solid"
            onClick={handleSubmit}
            className="w-28 justify-center!"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpsertProjectPage;
