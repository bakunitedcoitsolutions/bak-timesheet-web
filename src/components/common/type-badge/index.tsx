import { classNames } from "primereact/utils";

interface TypeBadgeProps {
  text: string;
  className?: string;
  variant: "primary" | "success" | "warning" | "danger";
}

const TypeBadge = ({
  text,
  className = "",
  variant = "primary",
}: TypeBadgeProps) => {
  return (
    <div className={`w-full flex flex-1 justify-center ${className}`}>
      <span
        className={classNames("text-sm px-3 py-1 rounded-md", {
          "text-primary bg-primary-light": variant === "primary",
          "text-theme-green bg-theme-light-green": variant === "success",
          "text-yellow-700 bg-yellow-100": variant === "warning",
          "text-theme-red bg-theme-light-red": variant === "danger",
        })}
      >
        {text}
      </span>
    </div>
  );
};

export default TypeBadge;
