import { classNames } from "primereact/utils";

const Badge = ({
  text,
  textClassName,
  containerClassName,
}: {
  text: string;
  containerClassName?: string;
  textClassName?: string;
}) => {
  return (
    <div
      className={classNames(
        "w-5 h-5 bg-primary rounded-md flex items-center justify-center shrink-0",
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
