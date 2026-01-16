"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SetupOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

const setupOptions: SetupOption[] = [
  {
    id: "countries",
    title: "Countries",
    description: "Manage country records and details",
    icon: "fa-light fa-globe",
    route: "/setup/countries",
  },
  {
    id: "cities",
    title: "Cities",
    description: "Manage city records and details",
    icon: "fa-light fa-city",
    route: "/setup/cities",
  },
  {
    id: "branches",
    title: "Branches",
    description: "Manage branch records and details",
    icon: "fa-light fa-sitemap",
    route: "/setup/branches",
  },
  {
    id: "gosi-cities",
    title: "GOSI Cities",
    description: "Manage GOSI city records and details",
    icon: "fa-light fa-building-memo",
    route: "/setup/gosi-cities",
  },
  {
    id: "designation",
    title: "Designation",
    description: "Manage employee designations",
    icon: "fa-light fa-briefcase",
    route: "/setup/designation",
  },
  {
    id: "employee-statuses",
    title: "Employee Statuses",
    description: "Manage employee status records",
    icon: "fa-light fa-user-check",
    route: "/setup/employee-statuses",
  },
  {
    id: "payroll-sections",
    title: "Payroll Sections",
    description: "Manage payroll section records",
    icon: "fa-light fa-wallet",
    route: "/setup/payroll-sections",
  },
  {
    id: "user-roles",
    title: "User Roles",
    description: "Manage user roles and access levels",
    icon: "fa-light fa-user-shield",
    route: "/setup/user-roles",
  },
];

const SetupPage = () => {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Setup</h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Manage system configurations and master data settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {setupOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => router.push(option.route)}
            onMouseEnter={() => setHoveredCard(option.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="bg-white border border-gray-100 rounded-xl p-8 cursor-pointer transition-all duration-300 hover:bg-primary-light hover:border-primary hover:-translate-y-2 hover:scale-[1.02] group relative overflow-hidden"
            style={{
              transform:
                hoveredCard === option.id
                  ? "translateY(-8px) scale(1.02)"
                  : "translateY(0) scale(1)",
            }}
          >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgb(220 38 38) 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }}
              ></div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent"></div>
            </div>

            <div className="relative flex flex-col gap-6 h-full">
              <div className="flex items-start gap-5 flex-1">
                <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center group-hover:bg-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shrink-0">
                  <i
                    className={`${option.icon} text-2xl! text-primary group-hover:text-white group-hover:scale-110 transition-all duration-300`}
                  ></i>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3 className="text-xl font-semibold text-primary group-hover:text-primary transition-colors duration-300 leading-tight mb-2.5">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-gray-200 group-hover:border-primary/20 transition-colors duration-300">
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors duration-300">
                  Manage
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary-light group-hover:bg-primary flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110">
                    <i className="pi pi-arrow-right text-sm text-primary group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SetupPage;
