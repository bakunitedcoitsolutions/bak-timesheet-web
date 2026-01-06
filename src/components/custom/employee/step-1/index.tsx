"use client";
import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import { FilePicker, Input, NumberInput } from "@/components/forms";

const Step1 = () => {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const renderProfilePicture = () => {
    return (
      <div className="space-y-2 gap-4 px-6">
        <label className="block text-[15px] ml-1">Profile Picture</label>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full">
            <img
              alt="user"
              className="w-16 h-16 rounded-full"
              src={
                profilePicture
                  ? URL.createObjectURL(profilePicture)
                  : "/assets/icons/user-icon.jpg"
              }
            />
          </div>
          <div className="min-w-60 md:min-w-72">
            <FilePicker
              multiple={false}
              className="w-full"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              onFileSelect={(files: File[]) => {
                if (files) {
                  const file = files[0];
                  setProfilePicture(file);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 md:flex-none flex-col gap-4 py-6">
      <StepperFormHeading title="Basic Info" />
      <div className="flex flex-col xl:flex-row gap-2">
        {renderProfilePicture()}
        <div
          className={classNames(
            FORM_FIELD_WIDTHS["2"],
            "pl-6 mt-4 xl:pl-0 xl:mt-0"
          )}
        >
          <label className={`block text-[15px] ml-1 xl:mt-[12px] mb-[8px]`}>
            Emp. Code
          </label>
          <NumberInput
            useGrouping={false}
            className="w-full md:w-60 xl:w-72"
            placeholder="Enter employee code"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-8 md:py-5 px-6">
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
          <Input
            label="Birth Date"
            type="date"
            className="w-full"
            placeholder="Select birth date"
          />
        </div>
        <div className={classNames(FORM_FIELD_WIDTHS["2"], "xl:min-w-83.5!")}>
          <NumberInput
            prefix="0"
            maxLength={9}
            className="w-full"
            useGrouping={false}
            label="Mobile Number"
            placeholder="Enter mobile number (without 0/966/+966)"
          />
        </div>
      </div>
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        <div className="min-w-60">
          <Dropdown
            small
            filter
            label="Project"
            options={projects}
            className="w-full"
            placeholder="Select Project"
            selectedItem={selectedProject}
            setSelectedItem={setSelectedProject}
          />
        </div>
        <div className="min-w-60">
          <Input
            className="w-full"
            label="Phone"
            placeholder="Enter phone number"
          />
        </div>
        <div className="min-w-60">
          <Input
            type="date"
            className="w-full"
            label="Date of Birth"
            placeholder="Select date of birth"
          />
        </div>
        <div className="min-w-60 w-72">
          <FilePicker
            multiple={false}
            className="w-full"
            label="Upload Picture"
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
            }}
            onFileSelect={(files) => {
              console.log(files);
            }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default Step1;
