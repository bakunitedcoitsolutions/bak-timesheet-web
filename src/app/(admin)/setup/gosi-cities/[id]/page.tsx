"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { classNames } from "primereact/utils";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Button, Dropdown, Input } from "@/components/forms";

const gosiCityStatusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const UpsertGosiCityPage = () => {
  const [selectedGosiCityStatus, setSelectedGosiCityStatus] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { id: gosiCityIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: gosiCityId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: gosiCityIdParam,
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
    router.replace(`/setup/gosi-cities`);
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading
          title={isAddMode ? "Add GOSI City" : "Edit GOSI City"}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6 mt-5 md:mt-0 w-full md:max-w-5xl content-start flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input label="Name" className="w-full" placeholder="Enter name" />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              label="Arabic Name"
              className="w-full text-right"
              placeholder="أدخل الاسم بالعربية"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="GOSI City Status"
              className="w-full"
              options={gosiCityStatusOptions}
              placeholder="Choose"
              value={selectedGosiCityStatus}
              onChange={(e) => setSelectedGosiCityStatus(e.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/setup/gosi-cities")}
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

export default UpsertGosiCityPage;
