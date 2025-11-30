import Image from "next/image";
import { classNames } from "primereact/utils";

const ICON_PATH = "/assets/icons/toast/";
const ICONS: Record<string, string> = {
  info: `${ICON_PATH}info-icon.svg`,
  error: `${ICON_PATH}danger-icon.svg`,
  warn: `${ICON_PATH}warning-icon.svg`,
  success: `${ICON_PATH}success-icon.svg`,
};

const getToastColors = (type: string) => {
  switch (type) {
    case "info":
      return {
        bg: "bg-[#F8F9FF]",
        text: "text-[#2647E4]",
        border: "border border-[#2647E4] border-l-[12px] border-l-[#2647E4]",
      };
    case "success":
      return {
        bg: "bg-[#ECFDF5]",
        text: "text-[#06996A]",
        border: "border border-[#06996A] border-l-[12px] border-l-[#06996A]",
      };
    case "error":
      return {
        bg: "bg-[#FEF2F2]",
        text: "text-[#DE1C1E]",
        border: "border border-[#DE1C1E] border-l-[12px] border-l-[#DE1C1E]",
      };
    case "warn":
      return {
        bg: "bg-[#FFFBEA]",
        text: "text-[#BD6306]",
        border: "border border-[#BD6306] border-l-[12px] border-l-[#BD6306]",
      };
    default:
      return {
        bg: "bg-[#F8F9FF]",
        text: "text-[#2647E4]",
        border: "border border-[#2647E4] border-l-[12px] border-l-[#2647E4]",
      };
  }
};

interface CustomToastProps {
  type: "info" | "success" | "error" | "warn";
  title?: string;
  message?: string;
}

export function CustomToast({ type, title, message }: CustomToastProps) {
  const iconSrc = ICONS[type];
  const { text } = getToastColors(type);

  return (
    <div className="flex flex-1 flex-row items-start gap-3 rounded-md">
      <Image
        alt="icon"
        width={36}
        height={36}
        src={iconSrc}
        className="shrink-0"
      />
      <div className="flex-1 pl-1.5">
        {!!title && (
          <h6 className={classNames("text-lg font-semibold", text)}>{title}</h6>
        )}
        {!!message && (
          <p
            className={classNames("text-sm", text, {
              "mt-2": !!title,
            })}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
