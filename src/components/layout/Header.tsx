"use client";

import { useRouter } from "next/navigation";
import { classNames } from "primereact/utils";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Header({ collapsed, setCollapsed }: HeaderProps) {
  const router = useRouter();
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full hover:bg-primary-50 text-primary focus:outline-none transition-colors"
        >
          <i
            className={classNames("pi transition-all duration-300", {
              "pi-chevron-right": collapsed,
              "pi-chevron-left": !collapsed,
            })}
          ></i>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full hover:bg-primary-50 text-primary focus:outline-none transition-colors"
          title="Logout"
          onClick={() => router.replace("/login")}
        >
          <i className="pi pi-sign-out text-xl"></i>
        </button>
      </div>
    </header>
  );
}
