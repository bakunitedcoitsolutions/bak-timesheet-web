import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import { Dropdown, FilePicker, NumberInput } from "@/components/forms";

const isCardDeliveredOptions = [
  {
    label: "Yes",
    value: "1",
  },
  {
    label: "No",
    value: "2",
  },
];

const Step5 = () => {
  const [cardDocument, setCardDocument] = useState<File | null>(null);
  const [selectedIsCardDelivered, setSelectedIsCardDelivered] = useState<
    string | null
  >(null);

  return (
    <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="Loan Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <NumberInput
              label="Opening Balance"
              className="w-full"
              placeholder="Enter opening balance"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="BAK Card Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Dropdown
              className="w-full"
              label="Is Card Delivered?"
              options={isCardDeliveredOptions}
              placeholder="Choose"
              selectedItem={selectedIsCardDelivered}
              setSelectedItem={setSelectedIsCardDelivered}
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <div className="w-full md:w-60 xl:w-72">
              <FilePicker
                multiple={false}
                className="w-full"
                label="Card Document"
                dropText="Drop card document here or"
                browseText="browse"
                accept={{
                  "image/jpeg": [".jpg", ".jpeg"],
                  "image/png": [".png"],
                  "application/pdf": [".pdf"],
                }}
                onFileSelect={(files: File[]) => {
                  if (files) {
                    const file = files[0];
                    setCardDocument(file);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;
