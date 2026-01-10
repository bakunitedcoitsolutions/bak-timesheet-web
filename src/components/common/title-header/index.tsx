"use client";

import { Input } from "@/components";
import { classNames } from "primereact/utils";
import { ReactNode, useState, useEffect } from "react";

const TitleHeader = ({
  icon,
  title,
  value,
  children,
  onChange,
}: {
  title: string;
  icon: ReactNode;
  children?: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (children) {
      return;
    }
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document?.addEventListener?.("fullscreenchange", handleFullscreenChange);
    return () => {
      document?.removeEventListener?.(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document?.fullscreenElement) {
        await document?.documentElement?.requestFullscreen?.();
      } else {
        await document?.exitFullscreen?.();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  return (
    <div
      className={classNames(
        "bg-linear-to-r from-primary to-[#96313C] flex flex-col md:flex-row items-start md:items-center justify-between h-auto md:h-[80px] w-full py-5 px-6 gap-4"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-md bg-white/20 text-white">
          {icon}
        </div>
        <h1 className="text-lg md:text-xl uppercase font-semibold text-white">
          {title}
        </h1>
      </div>
      {children ?? (
        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="w-full md:w-80">
            <Input
              value={value}
              className="w-full"
              icon="pi pi-search"
              iconPosition="left"
              onChange={onChange}
              placeholder="Search"
            />
          </div>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-md cursor-pointer text-white hover:bg-white/20 transition-colors"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <i
              className={`${
                isFullscreen ? "fa-regular fa-compress" : "fa-regular fa-expand"
              } text-xl!`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TitleHeader;
