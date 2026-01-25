"use client";
import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import { Dropdown, Input, NumberInput } from "@/components/forms";

const bankOptions = [
  { label: "Saudi National Bank", value: "1" },
  { label: "Al Rajhi Bank", value: "2" },
  { label: "Alinma Bank", value: "3" },
  { label: "Saudi British Bank", value: "4" },
  { label: "Other", value: "5" },
];

const cityOptions = [
  { label: "Riyadh", value: "riyadh" },
  { label: "Jeddah", value: "jeddah" },
  { label: "Mecca", value: "mecca" },
  { label: "Medina", value: "medina" },
  { label: "Tabuk", value: "tabuk" },
  { label: "Hail", value: "hail" },
  { label: "Jazan", value: "jazan" },
  { label: "Najran", value: "najran" },
  { label: "Al-Baha", value: "al-baha" },
];

interface Step4Props {
  employeeId?: number | null;
}

const Step4 = ({ employeeId }: Step4Props) => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedGosiCity, setSelectedGosiCity] = useState<string | null>(null);

  return (
    <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="Bank Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="Name"
              className="w-full"
              options={bankOptions}
              placeholder="Choose Bank"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.value)}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              className="w-full"
              label="Code"
              placeholder="Enter bank code"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"], "md:col-span-2")}>
            <Input label="IBAN" className="w-full" placeholder="Enter IBAN" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="GOSI Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <NumberInput
              label="Salary"
              className="w-full"
              placeholder="Enter GOSI salary"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              label="City"
              className="w-full"
              options={cityOptions}
              placeholder="GOSI City"
              value={selectedGosiCity}
              onChange={(e) => setSelectedGosiCity(e.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4;
