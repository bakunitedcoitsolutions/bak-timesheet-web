"use client";

import Link from "next/link";
import { Skeleton } from "primereact/skeleton";

import { classNames } from "primereact/utils";
import { Feature } from "@/utils/user.utility";
import { useGetDashboardStats } from "@/lib/db/services/dashboard";

const stats: Array<{
  title: string;
  value: string;
  iconBg: string;
  icon: string;
  bg: string;
  link: string;
  feature: Feature;
}> = [
  {
    title: "Active Projects",
    value: "20",
    icon: "fa-light fa-building text-xl!",
    iconBg: "#16CDC7",
    bg: "linear-gradient(180deg, rgba(22, 205, 199, 0.13) 0%, rgba(22, 205, 199, 0.03) 100%)",
    link: "/projects",
    feature: "projects",
  },
  {
    title: "Active Users",
    value: "42",
    iconBg: "#36C76C",
    icon: "pi pi-users text-2xl!",
    bg: "linear-gradient(180deg, rgba(54, 199, 108, 0.13) 0%, rgba(54, 199, 108, 0.03) 100%)",
    link: "/users",
    feature: "usersManagement",
  },
  {
    title: "Active Loans",
    value: "160",
    icon: "fa-light fa-newspaper text-xl!",
    iconBg: "#F89F7F",
    bg: "linear-gradient(180deg, #FFC6B1 0%, rgba(255, 198, 177, 0.1) 100%)",
    link: "/loans",
    feature: "loans",
  },
  {
    title: "Active Violations",
    value: "16,689",
    iconBg: "#635BFF",
    icon: "fa-light fa-ticket text-xl!",
    bg: "linear-gradient(180deg, rgba(99, 91, 255, 0.12) 0%, rgba(99, 91, 255, 0.03) 100%)",
    link: "/violations",
    feature: "trafficViolations",
  },
];

const StatsGrid = () => {
  const { data: statsData, isLoading } = useGetDashboardStats();

  const getStatValue = (title: string) => {
    if (!statsData) return "0";
    switch (title) {
      case "Active Projects":
        return statsData.activeProjects;
      case "Active Users":
        return statsData.activeUsers;
      case "Active Loans":
        return statsData.activeLoans;
      case "Active Violations":
        return statsData.activeViolations;
      default:
        return "0";
    }
  };

  return (
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
          {isLoading ? (
            <Skeleton width="4rem" height="2rem" />
          ) : (
            <h3 className="text-2xl font-semibold text-gray-800">
              {getStatValue(stat.title)}
            </h3>
          )}
          <Link
            href={stat.link}
            className="px-3 py-2.5 text-xs rounded-md shadow-[0px_6px_24.2px_-10px_#29343D38] bg-white cursor-pointer font-semibold"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
