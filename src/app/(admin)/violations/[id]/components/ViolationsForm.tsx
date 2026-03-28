"use client";

import { UseFormReturn } from "react-hook-form";
import { classNames } from "primereact/utils";
import {
  Form,
  FormItem,
  Input,
  Dropdown,
  NumberInput,
  Textarea,
  Button,
} from "@/components/forms";
import { FORM_FIELD_WIDTHS } from "@/utils/constants";
import { CHALLAN_TYPE_OPTIONS } from "../helpers";

interface ViolationsFormProps {
  form: UseFormReturn<any>;
  employeeOptions: { label: string; value: number }[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ViolationsForm = ({
  form,
  employeeOptions,
  isSubmitting,
  onCancel,
  onSubmit,
}: ViolationsFormProps) => {
  return (
    <>
      <Form form={form} className="w-full h-full content-start md:max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-4 md:py-5 px-6 mt-5 md:mt-0 flex-1">
          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="date">
              <Input
                type="date"
                label="Date"
                className="w-full"
                placeholder="Select date"
              />
            </FormItem>
          </div>

          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="employeeId">
              <Dropdown
                label="Employee"
                className="w-full"
                placeholder="Choose employee"
                options={employeeOptions}
                filter
                showClear
              />
            </FormItem>
          </div>

          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="type">
              <Dropdown
                label="Type"
                className="w-full"
                placeholder="Choose type"
                options={CHALLAN_TYPE_OPTIONS}
              />
            </FormItem>
          </div>

          <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
            <FormItem name="amount">
              <NumberInput
                label="Amount"
                className="w-full"
                placeholder="Enter amount"
                min={0}
                mode="decimal"
              />
            </FormItem>
          </div>

          <div className={classNames("md:col-span-2")}>
            <FormItem name="description">
              <Textarea
                label="Description"
                className="w-full"
                placeholder="Enter description..."
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
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="solid"
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-28 justify-center! gap-1"
        >
          Save
        </Button>
      </div>
    </>
  );
};
