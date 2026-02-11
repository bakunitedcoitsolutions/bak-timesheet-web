"use client";
import { useRef, useEffect } from "react";
import { Chips, ChipsProps } from "primereact/chips";

interface AutoScrollChipsProps extends ChipsProps {
  value: any[];
}

export const AutoScrollChips = (props: AutoScrollChipsProps) => {
  const chipsRef = useRef<Chips>(null);
  const prevValueLength = useRef(0);
  const { value, className, pt, ...rest } = props;

  // Auto-scroll to end when a new chip is added
  useEffect(() => {
    if (value && value.length > prevValueLength.current) {
      // Find the container within the Chips component
      // Primereact Chips structure: .p-chips > ul.p-inputtext
      const container = chipsRef.current
        ?.getElement()
        ?.querySelector("ul.p-inputtext");
      if (container) {
        container.scrollLeft = container.scrollWidth;
      }
    }
    prevValueLength.current = value?.length || 0;
  }, [value]);

  return (
    <Chips
      ref={chipsRef}
      value={value}
      className={`flex flex-row! ${className || ""}`}
      pt={{
        container: {
          className:
            "w-full flex! flex-nowrap! h-full items-center! overflow-x-auto! [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        },
        inputToken: { className: "text-sm py-0! min-w-[150px]" },
        token: { className: "bg-primary text-white text-xs " },
        ...pt,
      }}
      {...rest}
    />
  );
};
