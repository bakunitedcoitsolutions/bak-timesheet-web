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

const projects = [
  {
    label: "All Projects",
    value: "0",
  },
  {
    label: "ABC Company",
    value: "100",
  },
  {
    label: "XYZ Company",
    value: "200",
  },
  {
    label: "LMN Company",
    value: "300",
  },
  {
    label: "PQR Company",
    value: "400",
  },
  {
    label: "RST Company",
    value: "500",
  },
];

interface ProjectExpense {
  id: number;
  name: string;
  image: string;
  status: "active" | "inactive";
  expenses: number;
}

const expensesByProject: ProjectExpense[] = [
  {
    id: 1,
    name: "Jeddah Cash Salaries",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    status: "active",
    expenses: 3500,
  },
  {
    id: 2,
    name: "Riyadh Cash Salaries",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop",
    status: "active",
    expenses: 3500,
  },
  {
    id: 3,
    name: "Admin & Com. Center",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop",
    status: "inactive",
    expenses: 3500,
  },
  {
    id: 4,
    name: "Al-Omran Residence",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop",
    status: "inactive",
    expenses: 3500,
  },
  {
    id: 5,
    name: "Dammam Office Complex",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
    status: "active",
    expenses: 4200,
  },
  {
    id: 6,
    name: "Khobar Warehouse",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    status: "inactive",
    expenses: 2800,
  },
];

const branches = [
  { label: "All Branches", value: "all" },
  { label: "Jeddah Branch", value: "jeddah" },
  { label: "Riyadh Branch", value: "riyadh" },
  { label: "Dammam Branch", value: "dammam" },
];

const months = [
  { label: "Jan 2025", value: "2025-01" },
  { label: "Feb 2025", value: "2025-02" },
  { label: "Mar 2025", value: "2025-03" },
  { label: "Apr 2025", value: "2025-04" },
  { label: "May 2025", value: "2025-05" },
  { label: "Jun 2025", value: "2025-06" },
  { label: "Jul 2025", value: "2025-07" },
  { label: "Aug 2025", value: "2025-08" },
  { label: "Sep 2025", value: "2025-09" },
  { label: "Oct 2025", value: "2025-10" },
  { label: "Nov 2025", value: "2025-11" },
  { label: "Dec 2025", value: "2025-12" },
];

export { stats, projects, expensesByProject, branches, months };
export type { ProjectExpense };
