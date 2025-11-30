import { LineChart } from "@/components";

const HomePage = () => {
  const stats = [
    {
      title: "Total Employees",
      value: "1,234",
      icon: "pi pi-id-card",
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/employees",
    },
    {
      title: "Active Projects",
      value: "42",
      icon: "pi pi-briefcase",
      color: "text-purple-600",
      bg: "bg-purple-50",
      link: "/projects",
    },
    {
      title: "Active Loans",
      value: "15",
      icon: "pi pi-money-bill",
      color: "text-orange-600",
      bg: "bg-orange-50",
      link: "/loans",
    },
    {
      title: "Active Users",
      value: "8",
      icon: "pi pi-users",
      color: "text-pink-600",
      bg: "bg-pink-50",
      link: "/users",
    },
  ];

  return (
    <div className="flex flex-col gap-8 overflow-hidden!">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}
              >
                <i className={`${stat.icon} text-xl`}></i>
              </div>
              <a
                href={stat.link}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer"
              >
                <i className="pi pi-arrow-up-right text-sm"></i>
              </a>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white hidden md:block rounded-2xl w-full p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Financial Overview
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Track your income and expenses over time
            </p>
          </div>
        </div>
        <div className="h-[500px] w-full min-w-0 relative">
          <LineChart />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
