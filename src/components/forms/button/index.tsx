"use client";
import { Button, ButtonProps } from "primereact/button";
import { classNames } from "primereact/utils";

type ButtonVariant = "solid" | "outlined" | "text";
type IconPosition = "left" | "right";

interface CustomButtonProps extends Omit<
  ButtonProps,
  "outlined" | "text" | "icon" | "iconPos"
> {
  variant?: ButtonVariant;
  icon?: string;
  iconPosition?: IconPosition;
  active?: boolean;
  children?: React.ReactNode;
}

export default function CustomButton({
  variant = "solid",
  icon,
  iconPosition = "left",
  active = false,
  children,
  className,
  ...rest
}: CustomButtonProps) {
  const isOutlined = variant === "outlined";
  const isText = variant === "text";

  // Build className with active state
  const buttonClassName = classNames(className, {
    "active-button": active && variant === "solid",
  });

  // PrimeReact Button props
  const buttonProps: ButtonProps = {
    ...rest,
    className: buttonClassName,
  };

  // Handle variant
  if (isOutlined) {
    buttonProps.outlined = true;
  } else if (isText) {
    buttonProps.text = true;
  }

  // Handle icon positioning
  if (icon) {
    if (iconPosition === "right") {
      buttonProps.icon = icon;
      buttonProps.iconPos = "right";
    } else {
      buttonProps.icon = icon;
    }
  }

  return <Button {...buttonProps}>{children}</Button>;
}
