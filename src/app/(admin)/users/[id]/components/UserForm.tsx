"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { classNames } from "primereact/utils";
import { Input, Dropdown, FormItem } from "@/components/forms";
import { FORM_FIELD_WIDTHS, STATUS_OPTIONS } from "@/utils/constants";

interface UserFormProps {
  form: UseFormReturn<any>;
  isEditMode: boolean;
  userRoleOptions: { label: string; value: any }[];
  branchOptions: { label: string; value: any }[];
  onGeneratePassword: () => void;
  selectedUserRoleId: number;
}

export const UserForm = ({
  form,
  isEditMode,
  userRoleOptions,
  branchOptions,
  onGeneratePassword,
  selectedUserRoleId,
}: UserFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:gap-y-4 md:py-5 px-6 mt-5 md:mt-0 flex-1">
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="nameEn">
          <Input
            label="Name"
            className="w-full"
            placeholder="Enter name"
          />
        </FormItem>
      </div>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="nameAr">
          <Input
            label="Arabic Name"
            className="w-full text-right"
            placeholder="أدخل الاسم بالعربية"
          />
        </FormItem>
      </div>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="email">
          <Input
            type="email"
            label="Email"
            className="w-full"
            disabled={isEditMode}
            placeholder="Enter email"
          />
        </FormItem>
      </div>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="userRoleId">
          <Dropdown
            label="User Role"
            className="w-full"
            placeholder="Choose"
            options={userRoleOptions}
          />
        </FormItem>
      </div>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="isActive">
          <Dropdown
            label="Status"
            className="w-full"
            placeholder="Choose"
            options={STATUS_OPTIONS}
          />
        </FormItem>
      </div>
      <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
        <FormItem name="password">
          <Input
            className="w-full"
            label="Set Password"
            placeholder="Set/Generate password"
            icon="pi pi-refresh"
            iconPosition="right"
            onIconClick={onGeneratePassword}
          />
        </FormItem>
      </div>
      {selectedUserRoleId === 3 && (
        <div className={classNames(FORM_FIELD_WIDTHS["2"])}>
          <FormItem name="branchId">
            <Dropdown
              label="Branch"
              className="w-full"
              options={branchOptions}
              placeholder="Choose Branch"
            />
          </FormItem>
        </div>
      )}
    </div>
  );
};
