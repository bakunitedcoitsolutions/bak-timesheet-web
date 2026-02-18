import { classNames } from "primereact/utils";

const Badge = ({
  text,
  textClassName,
  containerClassName,
  variant = "primary",
}: {
  text: string;
  containerClassName?: string;
  textClassName?: string;
  variant?: "primary" | "success" | "info" | "warning" | "danger";
}) => {
  const variantClasses = {
    primary: "bg-primary",
    success: "bg-theme-green",
    info: "bg-theme-blue",
    warning: "bg-theme-yellow",
    danger: "bg-theme-red",
  };

  return (
    <div
      className={classNames(
        "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
        variantClasses[variant],
        containerClassName
      )}
    >
      <span
        className={classNames("text-white text-base font-bold", textClassName)}
      >
        {text}
      </span>
    </div>
  );
};

export default Badge;
