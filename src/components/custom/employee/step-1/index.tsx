"use client";
import { FilePicker, Dropdown, Input } from "@/components/forms";
import { StepperFormHeading } from "@/components/common";
import { projects } from "@/utils/dummy";
import { useState } from "react";

const Step1 = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  return (
    <div className="flex flex-col gap-4 py-6">
      <StepperFormHeading title="Basic Info" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
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
        <div className="min-w-60">
          <FilePicker
            className="w-full"
            label="Phone"
            placeholder="Enter phone number"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;
