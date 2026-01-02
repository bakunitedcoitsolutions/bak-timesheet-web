"use client";
import Link from "next/link";
import { classNames } from "primereact/utils";

import { BarChart, PieChart } from "@/components";

const HomePage = () => {
  const stats = [
    {
      title: "Active Employees",
      value: "16,689",
      iconBg: "#635BFF",
      icon: "fa-light fa-address-card text-xl!",
      bg: "linear-gradient(180deg, rgba(99, 91, 255, 0.12) 0%, rgba(99, 91, 255, 0.03) 100%)",
      link: "/employees",
    },
    {
      title: "Active Projects",
      value: "42",
      iconBg: "#36C76C",
      icon: "fa-light fa-building text-xl!",
      bg: "linear-gradient(180deg, rgba(54, 199, 108, 0.13) 0%, rgba(54, 199, 108, 0.03) 100%)",
      link: "/projects",
    },
    {
      title: "Active Users",
      value: "20",
      icon: "pi pi-users text-2xl!",
      iconBg: "#16CDC7",
      bg: "linear-gradient(180deg, rgba(22, 205, 199, 0.13) 0%, rgba(22, 205, 199, 0.03) 100%)",
      link: "/users",
    },
    {
      title: "Active Loans",
      value: "160",
      icon: "fa-light fa-newspaper text-xl!",
      iconBg: "#F89F7F",
      bg: "linear-gradient(180deg, #FFC6B1 0%, rgba(255, 198, 177, 0.1) 100%)",
      link: "/loans",
    },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-hidden!">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 bg-white w-full rounded-xl md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{ background: stat.bg }}
            className={classNames(
              "flex flex-1 flex-col p-4 rounded-xl h-60 justify-center items-center gap-3"
            )}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center`}
              style={{ background: stat.iconBg }}
            >
              <i className={classNames(stat.icon, "text-xl text-white")}></i>
            </div>
            <p className="text-gray-500 text-sm">{stat.title}</p>
            <h3 className="text-2xl font-semibold text-gray-800">
              {stat.value}
            </h3>
            <Link
              href={stat.link}
              className="px-3 py-2.5 text-xs rounded-md shadow-[0px_6px_24.2px_-10px_#29343D38] bg-white cursor-pointer font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl w-full p-6 col-span-1 xl:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Financial Overview
              </h3>
              <p className="text-gray-500 text-sm font-normal">
                Track your income and expenses over time
              </p>
            </div>
          </div>
          <div className="h-[500px] w-full min-w-0 mt-6 relative">
            <BarChart />
          </div>
        </div>
        <div className="bg-white rounded-xl w-full p-6 col-span-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Financial Overview
              </h3>
              <p className="text-gray-500 text-sm font-normal">
                Track your income and expenses over time
              </p>
            </div>
          </div>
          <div className="h-[500px] w-full min-w-0 mt-6 relative flex items-center justify-center">
            <PieChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
