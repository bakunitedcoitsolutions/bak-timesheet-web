"use client";

import {
  use,
  ReactNode,
  ChangeEvent,
  ReactElement,
  cloneElement,
  createContext,
  FormHTMLAttributes,
} from "react";
import {
  Path,
  useForm,
  Controller,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { classNames } from "primereact/utils";
import { ZodObject, ZodRawShape } from "zod";

type FormOptionsContextType = {
  schema?: ZodObject<ZodRawShape> | null;
  labelClassname?: string;
  hideError?: boolean;
};

type FormProps<T extends FieldValues> = {
  form: ReturnType<typeof useForm<T>>;
  children: ReactNode;
} & FormHTMLAttributes<HTMLFormElement> &
  FormOptionsContextType;

export const FormOptionsContext = createContext<FormOptionsContextType | null>(
  null
);

export function useFormOptions() {
  const context = use(FormOptionsContext);
  if (!context)
    throw new Error("useFormOptions must be used within a FormOptionsProvider");
  return context;
}

export function Form<T extends FieldValues>({
  form,
  schema,
  labelClassname,
  hideError,
  children,
  ...props
}: FormProps<T>) {
  return (
    <FormOptionsContext
      value={{
        schema: schema ?? null,
        labelClassname,
        hideError: hideError ?? false,
      }}
    >
      <FormProvider {...form}>
        <form {...props}>{children}</form>
      </FormProvider>
    </FormOptionsContext>
  );
}

interface FormItemChildProps {
  className?: string;
  id?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

type FormItemProps<T extends FieldValues> = {
  name: Path<T>;
  label?: ReactNode;
  children: ReactElement<FormItemChildProps>;
  valueName?: string;
  className?: string;
  errorClassName?: string;
  normalizer?: {
    in: (value: any) => any;
    out: (value: any) => any;
  };
} & FormOptionsContextType;

export function FormItem<T extends FieldValues>({
  name,
  label,
  children,
  errorClassName,
  className,
  valueName = "value",
  hideError: localHideError,
  labelClassname: localLabelClassname,
  normalizer = {
    in: (value: any) => value,
    out: (value: any) => value,
  },
}: FormItemProps<T>) {
  const { control } = useFormContext<T>();

  const {
    schema,
    labelClassname: globalLabelClassname,
    hideError: globalHideError,
  } = useFormOptions();

  const hideError = localHideError ?? globalHideError;

  const labelClassname = classNames(
    "text-primary text-sm",
    { "mb-4": valueName === "checked" },
    globalLabelClassname,
    localLabelClassname
  );

  const fieldSchema = schema?.shape?.[name];
  const isRequired =
    !!fieldSchema &&
    (fieldSchema as { _def?: { typeName?: string } })?._def?.typeName !==
      "ZodOptional" &&
    (fieldSchema as { _def?: { typeName?: string } })?._def?.typeName !==
      "ZodDefault";

  const labelCom = label !== undefined && (
    <label htmlFor={name} className={labelClassname}>
      {isRequired && (
        <>
          <span className="text-error">*</span>{" "}
        </>
      )}
      {label}
    </label>
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const normalizedValue = normalizer.in(value);
        return (
          <div className={classNames("flex flex-col", className)}>
            {labelCom}
            <div className={classNames("flex flex-col", className)}>
              <div className="flex flex-col gap-1 w-full">
                {cloneElement(children, {
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    const newValue = normalizer.out(
                      // @ts-ignore
                      e.target?.[valueName] ?? e?.[valueName] ?? e
                    );
                    onChange(newValue);
                  },
                  [valueName]: normalizedValue,
                  id: name,
                  className: `${children.props.className ?? ""} ${
                    error?.message ? "p-error" : ""
                  }`.trim(),
                })}
                {!hideError && (
                  <small
                    className={classNames(
                      "text-error text-xs block mt-1.5 ml-1",
                      errorClassName,
                      {
                        "mt-1": !!error?.message,
                      }
                    )}
                  >
                    {error?.message}
                  </small>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
