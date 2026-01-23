"use client";

import { useEffect, useState, useMemo } from "react";
import { classNames } from "primereact/utils";
import { Checkbox } from "primereact/checkbox";
import { useParams, useRouter } from "next/navigation";

import { countriesData } from "@/utils/dummy";
import { StepperFormHeading } from "@/components";
import { getEntityModeFromParam } from "@/helpers";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { Button, Dropdown, Input } from "@/components/forms";

const cityStatusOptions = [
  { label: "Active", value: "1" },
  { label: "Inactive", value: "2" },
];

const UpsertCityPage = () => {
  const [showInPayroll, setShowInPayroll] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCityStatus, setSelectedCityStatus] = useState<string | null>(
    null
  );
  const router = useRouter();
  const { id: cityIdParam } = useParams();
  const {
    isInvalid,
    isAddMode,
    isEditMode,
    entityId: cityId,
  } = getEntityModeFromParam({
    addKeyword: "new",
    param: cityIdParam,
  });

  // Convert countriesData to dropdown options
  const countryOptions = useMemo(() => {
    return countriesData.map((country) => ({
      label: country.nameEn,
      value: String(country.id),
    }));
  }, []);

  // Redirect to 404 page if the entity is invalid
  useEffect(() => {
    if (isInvalid) {
      router.replace("/404");
    }
  }, [isInvalid, router]);

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
    router.replace(`/setup/cities`);
  };

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6">
      <div className="flex h-full justify-between flex-1 md:flex-none flex-col gap-4 py-6 bg-white rounded-lg">
        <StepperFormHeading title={isAddMode ? "Add City" : "Edit City"} />
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
              label="Country"
              className="w-full"
              options={countryOptions}
              placeholder="Choose Country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.value)}
              filter
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="City Status"
              className="w-full"
              options={cityStatusOptions}
              placeholder="Choose"
              value={selectedCityStatus}
              onChange={(e) => setSelectedCityStatus(e.value)}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <div className="flex align-items-center cursor-pointer">
              <Checkbox
                name="showInPayroll"
                inputId="showInPayroll"
                onChange={(e) => setShowInPayroll(e?.checked ?? false)}
                checked={showInPayroll}
              />
              <label htmlFor="showInPayroll" className="ml-2">
                Show in Payroll Details
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-end px-6">
          <Button
            size="small"
            variant="text"
            onClick={() => router.replace("/setup/cities")}
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

export default UpsertCityPage;
