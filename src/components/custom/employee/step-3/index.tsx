import { useState } from "react";
import { classNames } from "primereact/utils";

import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { StepperFormHeading } from "@/components/common";
import { FilePicker, Input, NumberInput } from "@/components/forms";

const Step3 = () => {
  const [idCardDocument, setIdCardDocument] = useState<File | null>(null);
  const [passportDocument, setPassportDocument] = useState<File | null>(null);

  return (
    <div className="flex flex-1 md:flex-none flex-col gap-10 py-6">
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <NumberInput
              className="w-full"
              useGrouping={false}
              label="ID Card No."
              placeholder="Enter ID card number"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              type="date"
              className="w-full"
              label="ID Card Expiry Date"
              placeholder="Enter ID card expiry date"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              className="w-full"
              label="Profession"
              placeholder="Enter profession"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FilePicker
              multiple={false}
              className="w-full"
              label="ID Card Document"
              dropText="Drop your document here or"
              browseText="browse"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/pdf": [".pdf"],
              }}
              onFileSelect={(files: File[]) => {
                if (files) {
                  const file = files[0];
                  setIdCardDocument(file);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <StepperFormHeading title="Passport" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 lg:gap-y-8 px-6">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              className="w-full"
              label="Nationality"
              placeholder="Enter nationality"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <NumberInput
              className="w-full"
              useGrouping={false}
              label="Passport No."
              placeholder="Enter passport number"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <Input
              type="date"
              className="w-full"
              label="Passport Expiry Date"
              placeholder="Enter passport expiry date"
            />
          </div>
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FilePicker
              multiple={false}
              className="w-full"
              label="Passport Document"
              dropText="Drop your document here or"
              browseText="browse"
              accept={{
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
                "application/pdf": [".pdf"],
              }}
              onFileSelect={(files: File[]) => {
                if (files) {
                  const file = files[0];
                  setPassportDocument(file);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;
