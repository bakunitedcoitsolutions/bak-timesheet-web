// "use client";
// import { useRef, useEffect } from "react";
// import { Chips, ChipsProps } from "primereact/chips";

// interface AutoScrollChipsProps extends ChipsProps {
//   value: any[];
// }

// export const AutoScrollChips = (props: AutoScrollChipsProps) => {
//   const chipsRef = useRef<Chips>(null);
//   const prevValueLength = useRef(0);
//   const { value, className, pt, ...rest } = props;

//   // Auto-scroll to end when a new chip is added
//   useEffect(() => {
//     if (value && value.length > prevValueLength.current) {
//       // Find the container within the Chips component
//       // Primereact Chips structure: .p-chips > ul.p-inputtext
//       const container = chipsRef.current
//         ?.getElement()
//         ?.querySelector("ul.p-inputtext");
//       if (container) {
//         container.scrollLeft = container.scrollWidth;
//       }
//     }
//     prevValueLength.current = value?.length || 0;
//   }, [value]);

//   return (
//     <Chips
//       ref={chipsRef}
//       value={value}
//       className={`flex flex-row! ${className || ""}`}
//       pt={{
//         container: {
//           className:
//             "w-full flex! flex-nowrap! h-full items-center! overflow-x-auto! [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
//         },
//         inputToken: { className: "text-sm py-0! min-w-[150px]" },
//         token: { className: "bg-primary text-white text-xs " },
//         ...pt,
//       }}
//       separator=","
//       keyfilter={/[0-9,]/}
//       {...rest}
//     />
//   );
// };

"use client";
import { useState, useEffect } from "react";
import Input, { ModifiedInputProps } from "../forms/input";

interface MultiEmpInputProps extends Omit<
  ModifiedInputProps,
  "onChange" | "value"
> {
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiEmpInput = (props: MultiEmpInputProps) => {
  const { value, onChange, ...rest } = props;
  const [displayValue, setDisplayValue] = useState(value.join(", "));

  // Sync internal display value with external value changes (e.g. clearing filters)
  useEffect(() => {
    const currentJoined = value.join(",");
    const displayJoined = displayValue
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code !== "")
      .join(",");

    if (currentJoined !== displayJoined) {
      setDisplayValue(value.join(", "));
    }
  }, [value, displayValue]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setDisplayValue(newVal);

    const codes = newVal
      .split(",")
      .map((code) => code.trim())
      .filter((code) => code !== "");

    if (codes.join(",") !== value.join(",")) {
      onChange?.(codes);
    }
  };

  return (
    <Input
      placeholder="Employee Codes"
      keyfilter={/[0-9, ]/}
      value={displayValue}
      onChange={handleOnChange}
      {...rest}
    />
  );
};
