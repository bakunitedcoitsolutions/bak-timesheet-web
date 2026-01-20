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
    label: "ABC Company ABC Company ABC Company ABC Company",
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
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
    status: "active",
    expenses: 3500,
  },
  {
    id: 2,
    name: "Riyadh Cash Salaries",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop",
    status: "active",
    expenses: 3500,
  },
  {
    id: 3,
    name: "Admin & Com. Center",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop",
    status: "inactive",
    expenses: 3500,
  },
  {
    id: 4,
    name: "Al-Omran Residence",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=100&fit=crop",
    status: "inactive",
    expenses: 3500,
  },
  {
    id: 5,
    name: "Dammam Office Complex",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
    status: "active",
    expenses: 4200,
  },
  {
    id: 6,
    name: "Khobar Warehouse",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
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

interface Employee {
  id: number;
  empCode: string;
  empPicture: string;
  empNameEn: string;
  empNameAr: string;
  empGender: string;
  empIdNo: string;
  empDesignation: string;
  empPayrollSection: string;
  empProfession: string;
  empHourlyRate: string;
  empOpeningBalance: string;
  empNationality: string;
  empContactNo: string;
  empIsFixed: boolean;
  empIsCardDelivered: boolean;
  empCardDocLink: string;
}

const employees: Employee[] = [
  {
    id: 1,
    empCode: "EMP001",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Ahmed Al-Mansouri",
    empNameAr: "أحمد المنصوري",
    empGender: "Male",
    empIdNo: "1234567890",
    empDesignation: "Senior Engineer",
    empPayrollSection: "Engineering",
    empProfession: "Civil Engineer",
    empHourlyRate: "150.00",
    empOpeningBalance: "5,000.00",
    empNationality: "Saudi",
    empContactNo: "+966501234567",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 2,
    empCode: "EMP002",
    empPicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    empNameEn: "Fatima Al-Zahra",
    empNameAr: "فاطمة الزهراء",
    empGender: "Female",
    empIdNo: "2345678901",
    empDesignation: "HR Manager",
    empPayrollSection: "Administration",
    empProfession: "Human Resources",
    empHourlyRate: "120.00",
    empOpeningBalance: "3,500.00",
    empNationality: "Saudi",
    empContactNo: "+966502345678",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 3,
    empCode: "EMP003",
    empPicture:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    empNameEn: "Mohammed Al-Rashid",
    empNameAr: "محمد الراشد",
    empGender: "Male",
    empIdNo: "3456789012",
    empDesignation: "Project Manager",
    empPayrollSection: "Management",
    empProfession: "Project Management",
    empHourlyRate: "180.00",
    empOpeningBalance: "7,500.00",
    empNationality: "Saudi",
    empContactNo: "+966503456789",
    empIsFixed: true,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 4,
    empCode: "EMP004",
    empPicture:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    empNameEn: "Sara Al-Mutairi",
    empNameAr: "سارة المطيري",
    empGender: "Female",
    empIdNo: "4567890123",
    empDesignation: "Accountant",
    empPayrollSection: "Finance",
    empProfession: "Accounting",
    empHourlyRate: "100.00",
    empOpeningBalance: "2,000.00",
    empNationality: "Saudi",
    empContactNo: "+966504567890",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 5,
    empCode: "EMP005",
    empPicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    empNameEn: "Khalid Al-Otaibi",
    empNameAr: "خالد العتيبي",
    empGender: "Male",
    empIdNo: "5678901234",
    empDesignation: "Site Supervisor",
    empPayrollSection: "Operations",
    empProfession: "Construction",
    empHourlyRate: "90.00",
    empOpeningBalance: "1,500.00",
    empNationality: "Saudi",
    empContactNo: "+966505678901",
    empIsFixed: false,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 6,
    empCode: "EMP006",
    empPicture:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    empNameEn: "Noura Al-Dosari",
    empNameAr: "نورة الدوسري",
    empGender: "Female",
    empIdNo: "6789012345",
    empDesignation: "IT Specialist",
    empPayrollSection: "IT",
    empProfession: "Information Technology",
    empHourlyRate: "130.00",
    empOpeningBalance: "4,000.00",
    empNationality: "Saudi",
    empContactNo: "+966506789012",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 7,
    empCode: "EMP007",
    empPicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    empNameEn: "Omar Al-Harbi",
    empNameAr: "عمر الحربي",
    empGender: "Male",
    empIdNo: "7890123456",
    empDesignation: "Mechanical Engineer",
    empPayrollSection: "Engineering",
    empProfession: "Mechanical Engineering",
    empHourlyRate: "140.00",
    empOpeningBalance: "3,200.00",
    empNationality: "Saudi",
    empContactNo: "+966507890123",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 8,
    empCode: "EMP008",
    empPicture:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    empNameEn: "Layla Al-Shammari",
    empNameAr: "ليلى الشمري",
    empGender: "Female",
    empIdNo: "8901234567",
    empDesignation: "Administrative Assistant",
    empPayrollSection: "Administration",
    empProfession: "Administration",
    empHourlyRate: "75.00",
    empOpeningBalance: "1,200.00",
    empNationality: "Saudi",
    empContactNo: "+966508901234",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 9,
    empCode: "EMP009",
    empPicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    empNameEn: "Yousef Al-Ghamdi",
    empNameAr: "يوسف الغامدي",
    empGender: "Male",
    empIdNo: "9012345678",
    empDesignation: "Electrician",
    empPayrollSection: "Operations",
    empProfession: "Electrical",
    empHourlyRate: "85.00",
    empOpeningBalance: "1,800.00",
    empNationality: "Saudi",
    empContactNo: "+966509012345",
    empIsFixed: false,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 10,
    empCode: "EMP010",
    empPicture: "",
    empNameEn: "Mariam Al-Qahtani",
    empNameAr: "مريم القحطاني",
    empGender: "Female",
    empIdNo: "0123456789",
    empDesignation: "Quality Control",
    empPayrollSection: "Quality",
    empProfession: "Quality Assurance",
    empHourlyRate: "110.00",
    empOpeningBalance: "2,500.00",
    empNationality: "Saudi",
    empContactNo: "+966500123456",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 11,
    empCode: "EMP011",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Faisal Al-Shehri",
    empNameAr: "فيصل الشهري",
    empGender: "Male",
    empIdNo: "1234509876",
    empDesignation: "Architect",
    empPayrollSection: "Engineering",
    empProfession: "Architecture",
    empHourlyRate: "160.00",
    empOpeningBalance: "6,000.00",
    empNationality: "Saudi",
    empContactNo: "+966501234567",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 12,
    empCode: "EMP012",
    empPicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    empNameEn: "Hanan Al-Mutlaq",
    empNameAr: "حنان المطلق",
    empGender: "Female",
    empIdNo: "2345610987",
    empDesignation: "Procurement Officer",
    empPayrollSection: "Procurement",
    empProfession: "Procurement",
    empHourlyRate: "95.00",
    empOpeningBalance: "2,200.00",
    empNationality: "Saudi",
    empContactNo: "+966502345678",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 13,
    empCode: "EMP013",
    empPicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    empNameEn: "Saud Al-Balawi",
    empNameAr: "سعود البلوي",
    empGender: "Male",
    empIdNo: "3456721098",
    empDesignation: "Safety Officer",
    empPayrollSection: "Safety",
    empProfession: "Safety Management",
    empHourlyRate: "105.00",
    empOpeningBalance: "2,800.00",
    empNationality: "Saudi",
    empContactNo: "+966503456789",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 14,
    empCode: "EMP014",
    empPicture:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    empNameEn: "Reem Al-Fahad",
    empNameAr: "ريم الفهد",
    empGender: "Female",
    empIdNo: "4567832109",
    empDesignation: "Marketing Specialist",
    empPayrollSection: "Marketing",
    empProfession: "Marketing",
    empHourlyRate: "115.00",
    empOpeningBalance: "3,000.00",
    empNationality: "Saudi",
    empContactNo: "+966504567890",
    empIsFixed: true,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 15,
    empCode: "EMP015",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Nasser Al-Mazrouei",
    empNameAr: "ناصر المزروعي",
    empGender: "Male",
    empIdNo: "5678943210",
    empDesignation: "Warehouse Manager",
    empPayrollSection: "Logistics",
    empProfession: "Warehouse Management",
    empHourlyRate: "125.00",
    empOpeningBalance: "4,500.00",
    empNationality: "Saudi",
    empContactNo: "+966505678901",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 16,
    empCode: "EMP016",
    empPicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    empNameEn: "Amal Al-Harbi",
    empNameAr: "أمل الحربي",
    empGender: "Female",
    empIdNo: "6789054321",
    empDesignation: "Legal Advisor",
    empPayrollSection: "Legal",
    empProfession: "Law",
    empHourlyRate: "170.00",
    empOpeningBalance: "8,000.00",
    empNationality: "Saudi",
    empContactNo: "+966506789012",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 17,
    empCode: "EMP017",
    empPicture:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    empNameEn: "Majed Al-Sulami",
    empNameAr: "ماجد السلمي",
    empGender: "Male",
    empIdNo: "7890165432",
    empDesignation: "Plumber",
    empPayrollSection: "Maintenance",
    empProfession: "Plumbing",
    empHourlyRate: "80.00",
    empOpeningBalance: "1,300.00",
    empNationality: "Saudi",
    empContactNo: "+966507890123",
    empIsFixed: false,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 18,
    empCode: "EMP018",
    empPicture:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    empNameEn: "Hala Al-Rashid",
    empNameAr: "هالة الراشد",
    empGender: "Female",
    empIdNo: "8901276543",
    empDesignation: "Receptionist",
    empPayrollSection: "Administration",
    empProfession: "Reception",
    empHourlyRate: "70.00",
    empOpeningBalance: "1,000.00",
    empNationality: "Saudi",
    empContactNo: "+966508901234",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 19,
    empCode: "EMP019",
    empPicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    empNameEn: "Turki Al-Anzi",
    empNameAr: "تركي العنزي",
    empGender: "Male",
    empIdNo: "9012387654",
    empDesignation: "Driver",
    empPayrollSection: "Transportation",
    empProfession: "Driving",
    empHourlyRate: "65.00",
    empOpeningBalance: "800.00",
    empNationality: "Saudi",
    empContactNo: "+966509012345",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 20,
    empCode: "EMP020",
    empPicture:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    empNameEn: "Rana Al-Mutairi",
    empNameAr: "رنا المطيري",
    empGender: "Female",
    empIdNo: "0123498765",
    empDesignation: "Data Entry Clerk",
    empPayrollSection: "Administration",
    empProfession: "Data Entry",
    empHourlyRate: "60.00",
    empOpeningBalance: "900.00",
    empNationality: "Saudi",
    empContactNo: "+966500123456",
    empIsFixed: false,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 21,
    empCode: "EMP021",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Bandar Al-Otaibi",
    empNameAr: "بندر العتيبي",
    empGender: "Male",
    empIdNo: "1234501234",
    empDesignation: "Surveyor",
    empPayrollSection: "Engineering",
    empProfession: "Surveying",
    empHourlyRate: "135.00",
    empOpeningBalance: "3,600.00",
    empNationality: "Saudi",
    empContactNo: "+966501234567",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 22,
    empCode: "EMP022",
    empPicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    empNameEn: "Nada Al-Dosari",
    empNameAr: "ندى الدوسري",
    empGender: "Female",
    empIdNo: "2345612345",
    empDesignation: "Nurse",
    empPayrollSection: "Medical",
    empProfession: "Nursing",
    empHourlyRate: "145.00",
    empOpeningBalance: "4,200.00",
    empNationality: "Saudi",
    empContactNo: "+966502345678",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 23,
    empCode: "EMP023",
    empPicture:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    empNameEn: "Hamad Al-Harbi",
    empNameAr: "حمد الحربي",
    empGender: "Male",
    empIdNo: "3456723456",
    empDesignation: "Carpenter",
    empPayrollSection: "Operations",
    empProfession: "Carpentry",
    empHourlyRate: "88.00",
    empOpeningBalance: "1,600.00",
    empNationality: "Saudi",
    empContactNo: "+966503456789",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 24,
    empCode: "EMP024",
    empPicture:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
    empNameEn: "Lina Al-Shammari",
    empNameAr: "لينا الشمري",
    empGender: "Female",
    empIdNo: "4567834567",
    empDesignation: "Secretary",
    empPayrollSection: "Administration",
    empProfession: "Secretarial",
    empHourlyRate: "72.00",
    empOpeningBalance: "1,100.00",
    empNationality: "Saudi",
    empContactNo: "+966504567890",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 25,
    empCode: "EMP025",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Zaid Al-Ghamdi",
    empNameAr: "زيد الغامدي",
    empGender: "Male",
    empIdNo: "5678945678",
    empDesignation: "Security Guard",
    empPayrollSection: "Security",
    empProfession: "Security",
    empHourlyRate: "55.00",
    empOpeningBalance: "700.00",
    empNationality: "Saudi",
    empContactNo: "+966505678901",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 26,
    empCode: "EMP026",
    empPicture: "",
    empNameEn: "Maha Al-Qahtani",
    empNameAr: "مها القحطاني",
    empGender: "Female",
    empIdNo: "6789056789",
    empDesignation: "Graphic Designer",
    empPayrollSection: "Design",
    empProfession: "Graphic Design",
    empHourlyRate: "125.00",
    empOpeningBalance: "3,400.00",
    empNationality: "Saudi",
    empContactNo: "+966506789012",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 27,
    empCode: "EMP027",
    empPicture:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    empNameEn: "Waleed Al-Shehri",
    empNameAr: "وليد الشهري",
    empGender: "Male",
    empIdNo: "7890167890",
    empDesignation: "Welder",
    empPayrollSection: "Operations",
    empProfession: "Welding",
    empHourlyRate: "92.00",
    empOpeningBalance: "1,700.00",
    empNationality: "Saudi",
    empContactNo: "+966507890123",
    empIsFixed: false,
    empIsCardDelivered: false,
    empCardDocLink: "#",
  },
  {
    id: 28,
    empCode: "EMP028",
    empPicture:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    empNameEn: "Dina Al-Mutlaq",
    empNameAr: "دينا المطلق",
    empGender: "Female",
    empIdNo: "8901278901",
    empDesignation: "Translator",
    empPayrollSection: "Administration",
    empProfession: "Translation",
    empHourlyRate: "108.00",
    empOpeningBalance: "2,600.00",
    empNationality: "Saudi",
    empContactNo: "+966508901234",
    empIsFixed: true,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 29,
    empCode: "EMP029",
    empPicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    empNameEn: "Raed Al-Balawi",
    empNameAr: "رائد البلوي",
    empGender: "Male",
    empIdNo: "9012389012",
    empDesignation: "Heavy Equipment Operator",
    empPayrollSection: "Operations",
    empProfession: "Heavy Equipment",
    empHourlyRate: "98.00",
    empOpeningBalance: "2,100.00",
    empNationality: "Saudi",
    empContactNo: "+966509012345",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
  {
    id: 30,
    empCode: "EMP030",
    empPicture:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    empNameEn: "Yasmin Al-Fahad",
    empNameAr: "ياسمين الفهد",
    empGender: "Female",
    empIdNo: "0123490123",
    empDesignation: "Customer Service",
    empPayrollSection: "Customer Service",
    empProfession: "Customer Relations",
    empHourlyRate: "82.00",
    empOpeningBalance: "1,400.00",
    empNationality: "Saudi",
    empContactNo: "+966500123456",
    empIsFixed: false,
    empIsCardDelivered: true,
    empCardDocLink: "#",
  },
];

const designationOptions = [
  { label: "All Designations", value: "0" },
  { label: "Engineer", value: "1" },
  { label: "Manager", value: "2" },
  { label: "Assistant", value: "3" },
  { label: "Other", value: "4" },
];

interface TimesheetEntry {
  id: number;
  rowNumber: number;
  code: string;
  employeeName: string;
  designation: string;
  hasFlag: boolean;
  isLocked: boolean;
  project1: string | null;
  project1Hours: number;
  project1OT: number;
  project2: string | null;
  project2Hours: number;
  project2OT: number;
  totalHours: number;
  remarks: string;
  allowBreakProject1?: boolean;
  allowBreakProject1Value?: boolean;
  allowBreakProject2?: boolean;
  allowBreakProject2Value?: boolean;
}

// Sample data matching the image description
const initialTimesheetData: TimesheetEntry[] = [
  {
    id: 1,
    rowNumber: 1,
    code: "10000",
    employeeName: "REJA, HALIL/HALIL, SALUM SALUM SALUM SALUM",
    designation: "Driver",
    hasFlag: false,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: false,
    allowBreakProject1Value: false,
    allowBreakProject2: false,
    allowBreakProject2Value: false,
  },
  {
    id: 2,
    rowNumber: 2,
    code: "20000",
    employeeName: "EMPLOYEE NAME 2",
    designation: "Designation",
    hasFlag: false,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: true,
    allowBreakProject1Value: false,
    allowBreakProject2: true,
    allowBreakProject2Value: false,
  },
  {
    id: 3,
    rowNumber: 3,
    code: "30001",
    employeeName: "HUSSEIN ALI SHILAH ISSA",
    designation: "Truck Driver (Low Loader)",
    hasFlag: true,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: false,
    allowBreakProject1Value: false,
    allowBreakProject2: false,
    allowBreakProject2Value: false,
  },
  {
    id: 4,
    rowNumber: 4,
    code: "30002",
    employeeName: "IBRAHIM ALI SHILAH ISSA",
    designation: "Foreman Engineer",
    hasFlag: false,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: true,
    allowBreakProject1Value: false,
    allowBreakProject2: true,
    allowBreakProject2Value: false,
  },
  {
    id: 5,
    rowNumber: 5,
    code: "30003",
    employeeName: "EMPLOYEE NAME 5",
    designation: "Electrician",
    hasFlag: false,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: true,
    allowBreakProject1Value: false,
    allowBreakProject2: true,
    allowBreakProject2Value: false,
  },
  {
    id: 6,
    rowNumber: 6,
    code: "30004",
    employeeName: "ABDI FARAX ABDI SALAH (GEN)",
    designation: "Watchman",
    hasFlag: false,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: true,
    allowBreakProject1Value: false,
    allowBreakProject2: true,
    allowBreakProject2Value: false,
  },
];

// Generate more rows to reach 24
for (let i = 7; i <= 24; i++) {
  initialTimesheetData.push({
    id: i,
    rowNumber: i,
    code: String(10000 + i * 1000),
    employeeName: `EMPLOYEE NAME ${i}`,
    designation: i % 3 === 0 ? "Mechanic" : i % 3 === 1 ? "Plumber" : "Laborer",
    hasFlag: i >= 7 && i <= 12,
    isLocked: false,
    project1: null,
    project1Hours: 0,
    project1OT: 0,
    project2: null,
    project2Hours: 0,
    project2OT: 0,
    totalHours: 0,
    remarks: "",
    allowBreakProject1: true,
    allowBreakProject1Value: false,
    allowBreakProject2: true,
    allowBreakProject2Value: false,
  });
}

interface Project {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

const projectsData: Project[] = [];

for (let i = 1; i <= 10; i++) {
  projectsData.push({
    id: i,
    nameEn: `Project ${i}`,
    nameAr: `المشروع ${i}`,
    isActive: i % 2 === 0,
  });
}

interface LoanEntry {
  id: number;
  date: string; // DD-Mon-YYYY format
  code: string; // 5-digit code
  employeeName: string;
  designation: string;
  amount: number;
  remarks: string;
  type: "loan" | "return";
}

interface PayrollEntry {
  id: number;
  period: string; // "JANUARY 2025" format
  gosiSalary: number;
  salary: number;
  previousAdvance: number;
  currentAdvance: number;
  deduction: number;
  netLoan: number; // can be negative
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  status: "Posted" | "Pending";
}

interface PayrollDetailEntry {
  id: number;
  empCode: string;
  name: string;
  arabicName: string;
  designation: string;
  idNumber: string;
  nationality: string;
  professionInId: string;
  gosiCity: string;
  passportNumber: string;
  passportExpiryDate: string;
  joiningDate: string;
  iban: string;
  bankCode: string;
  gosiSalary: number;
  workDays: number;
  overTime: number;
  totalHours: number;
  hourlyRate: number;
  allowance: number;
  totalSalary: number;
  previousAdvance: number;
  currentAdvance: number;
  deduction: number;
  netLoan: number;
  previousTraffic: number;
  currentTraffic: number;
  trafficDeduction: number;
  netTraffic: number;
  netSalaryPayable: number;
  cardSalary: number;
  cashSalary: number;
  remarks: string;
  project: string | null;
  status: "Pending" | "Posted";
  isLocked: boolean;
  gender?: string; // "M" or "F" for gender flag
}

const initialPayrollDetailData: PayrollDetailEntry[] = [
  {
    id: 1,
    empCode: "10001",
    name: "MO VIMAD AL AMIN",
    arabicName: "علي سعيد ال سعيد ال",
    designation: "CJO",
    idNumber: "236721715",
    nationality: "Indian",
    professionInId: "سائق",
    gosiCity: "Jeddah",
    passportNumber: "D-1133190",
    passportExpiryDate: "Jan-2025",
    joiningDate: "",
    iban: "218/XXXXXXX",
    bankCode: "233399",
    gosiSalary: 0,
    workDays: 62410,
    overTime: 0,
    totalHours: 0,
    hourlyRate: 0,
    allowance: 0,
    totalSalary: 0,
    previousAdvance: 0,
    currentAdvance: 0,
    deduction: 0,
    netLoan: 0,
    previousTraffic: 0,
    currentTraffic: 0,
    trafficDeduction: 0,
    netTraffic: 0,
    netSalaryPayable: 0,
    cardSalary: 0,
    cashSalary: 0,
    remarks: "",
    project: null,
    status: "Pending",
    isLocked: false,
    gender: "M",
  },
  {
    id: 2,
    empCode: "10002",
    name: "ABDULLAH MOHMOOD MOHMOOD",
    arabicName: "عبدالله محمود محمود",
    designation: "Director",
    idNumber: "500000753",
    nationality: "Pakistani",
    professionInId: "عامل",
    gosiCity: "Jeddah",
    passportNumber: "G11700032",
    passportExpiryDate: "Sep-2023",
    joiningDate: "",
    iban: "C28/28/12230213",
    bankCode: "B-2",
    gosiSalary: 150,
    workDays: 8440,
    overTime: 0,
    totalHours: 0,
    hourlyRate: 0,
    allowance: 0,
    totalSalary: 0,
    previousAdvance: 0,
    currentAdvance: 0,
    deduction: 0,
    netLoan: 0,
    previousTraffic: 0,
    currentTraffic: 0,
    trafficDeduction: 0,
    netTraffic: 0,
    netSalaryPayable: 0,
    cardSalary: 0,
    cashSalary: 0,
    remarks: "",
    project: null,
    status: "Pending",
    isLocked: false,
    gender: "M",
  },
  {
    id: 3,
    empCode: "10003",
    name: "AHMED AL-MANSOURI",
    arabicName: "أحمد المنصوري",
    designation: "Senior Engineer",
    idNumber: "1234567890",
    nationality: "Saudi",
    professionInId: "مهندس",
    gosiCity: "Riyadh",
    passportNumber: "A1234567",
    passportExpiryDate: "Dec-2026",
    joiningDate: "01-Jan-2023",
    iban: "SA1234567890123456789012",
    bankCode: "23399",
    gosiSalary: 5000,
    workDays: 26,
    overTime: 10,
    totalHours: 208,
    hourlyRate: 150,
    allowance: 2000,
    totalSalary: 33200,
    previousAdvance: 5000,
    currentAdvance: 2000,
    deduction: 1500,
    netLoan: 3000,
    previousTraffic: 500,
    currentTraffic: 300,
    trafficDeduction: 200,
    netTraffic: 600,
    netSalaryPayable: 27700,
    cardSalary: 20000,
    cashSalary: 7700,
    remarks: "",
    project: "1",
    status: "Posted",
    isLocked: true,
    gender: "M",
  },
  {
    id: 4,
    empCode: "10004",
    name: "FATIMA AL-ZAHRA",
    arabicName: "فاطمة الزهراء",
    designation: "HR Manager",
    idNumber: "2345678901",
    nationality: "Saudi",
    professionInId: "مدير",
    gosiCity: "Jeddah",
    passportNumber: "B2345678",
    passportExpiryDate: "Mar-2027",
    joiningDate: "15-Feb-2022",
    iban: "SA2345678901234567890123",
    bankCode: "B-2",
    gosiSalary: 4500,
    workDays: 25,
    overTime: 5,
    totalHours: 205,
    hourlyRate: 120,
    allowance: 1500,
    totalSalary: 26100,
    previousAdvance: 3000,
    currentAdvance: 1000,
    deduction: 800,
    netLoan: 2000,
    previousTraffic: 400,
    currentTraffic: 200,
    trafficDeduction: 150,
    netTraffic: 450,
    netSalaryPayable: 22300,
    cardSalary: 15000,
    cashSalary: 7300,
    remarks: "",
    project: "2",
    status: "Posted",
    isLocked: true,
    gender: "F",
  },
  {
    id: 5,
    empCode: "10005",
    name: "MOHAMMED AL-RASHID",
    arabicName: "محمد الراشد",
    designation: "Project Manager",
    idNumber: "3456789012",
    nationality: "Saudi",
    professionInId: "مدير مشروع",
    gosiCity: "Riyadh",
    passportNumber: "C3456789",
    passportExpiryDate: "Jun-2025",
    joiningDate: "01-Mar-2021",
    iban: "SA3456789012345678901234",
    bankCode: "23399",
    gosiSalary: 6000,
    workDays: 27,
    overTime: 15,
    totalHours: 231,
    hourlyRate: 180,
    allowance: 3000,
    totalSalary: 44580,
    previousAdvance: 7500,
    currentAdvance: 3000,
    deduction: 2000,
    netLoan: 5000,
    previousTraffic: 800,
    currentTraffic: 500,
    trafficDeduction: 300,
    netTraffic: 1000,
    netSalaryPayable: 37080,
    cardSalary: 30000,
    cashSalary: 7080,
    remarks: "",
    project: "3",
    status: "Pending",
    isLocked: false,
    gender: "M",
  },
  {
    id: 6,
    empCode: "10006",
    name: "SARA AHMED",
    arabicName: "سارة أحمد",
    designation: "Accountant",
    idNumber: "4567890123",
    nationality: "Egyptian",
    professionInId: "محاسب",
    gosiCity: "Jeddah",
    passportNumber: "D4567890",
    passportExpiryDate: "Sep-2024",
    joiningDate: "10-Apr-2023",
    iban: "SA4567890123456789012345",
    bankCode: "B-2",
    gosiSalary: 3500,
    workDays: 24,
    overTime: 8,
    totalHours: 200,
    hourlyRate: 100,
    allowance: 1000,
    totalSalary: 21000,
    previousAdvance: 2000,
    currentAdvance: 1000,
    deduction: 600,
    netLoan: 1500,
    previousTraffic: 300,
    currentTraffic: 150,
    trafficDeduction: 100,
    netTraffic: 350,
    netSalaryPayable: 18900,
    cardSalary: 12000,
    cashSalary: 6900,
    remarks: "",
    project: "1",
    status: "Pending",
    isLocked: false,
    gender: "F",
  },
  {
    id: 7,
    empCode: "10007",
    name: "KHALID IBRAHIM",
    arabicName: "خالد إبراهيم",
    designation: "Carpenter",
    idNumber: "5678901234",
    nationality: "Pakistani",
    professionInId: "نجار",
    gosiCity: "Jeddah",
    passportNumber: "E5678901",
    passportExpiryDate: "Dec-2025",
    joiningDate: "05-May-2023",
    iban: "SA5678901234567890123456",
    bankCode: "23399",
    gosiSalary: 2500,
    workDays: 22,
    overTime: 12,
    totalHours: 188,
    hourlyRate: 80,
    allowance: 500,
    totalSalary: 15540,
    previousAdvance: 1500,
    currentAdvance: 800,
    deduction: 400,
    netLoan: 1000,
    previousTraffic: 200,
    currentTraffic: 100,
    trafficDeduction: 50,
    netTraffic: 250,
    netSalaryPayable: 13890,
    cardSalary: 10000,
    cashSalary: 3890,
    remarks: "",
    project: "2",
    status: "Pending",
    isLocked: false,
    gender: "M",
  },
  {
    id: 8,
    empCode: "10008",
    name: "NOOR ALI",
    arabicName: "نور علي",
    designation: "Data Operator",
    idNumber: "6789012345",
    nationality: "Bangladeshi",
    professionInId: "عامل",
    gosiCity: "Jeddah",
    passportNumber: "F6789012",
    passportExpiryDate: "Aug-2026",
    joiningDate: "20-Jun-2023",
    iban: "SA6789012345678901234567",
    bankCode: "B-2",
    gosiSalary: 2000,
    workDays: 23,
    overTime: 6,
    totalHours: 194,
    hourlyRate: 60,
    allowance: 300,
    totalSalary: 11940,
    previousAdvance: 1000,
    currentAdvance: 500,
    deduction: 300,
    netLoan: 500,
    previousTraffic: 150,
    currentTraffic: 80,
    trafficDeduction: 40,
    netTraffic: 190,
    netSalaryPayable: 11150,
    cardSalary: 8000,
    cashSalary: 3150,
    remarks: "",
    project: "3",
    status: "Pending",
    isLocked: false,
    gender: "F",
  },
  {
    id: 9,
    empCode: "10009",
    name: "YOUSEF HASSAN",
    arabicName: "يوسف حسن",
    designation: "Truck Driver",
    idNumber: "7890123456",
    nationality: "Saudi",
    professionInId: "سائق",
    gosiCity: "Riyadh",
    passportNumber: "G7890123",
    passportExpiryDate: "Jan-2027",
    joiningDate: "01-Jul-2022",
    iban: "SA7890123456789012345678",
    bankCode: "23399",
    gosiSalary: 3000,
    workDays: 25,
    overTime: 10,
    totalHours: 210,
    hourlyRate: 90,
    allowance: 800,
    totalSalary: 19700,
    previousAdvance: 2500,
    currentAdvance: 1200,
    deduction: 700,
    netLoan: 2000,
    previousTraffic: 400,
    currentTraffic: 200,
    trafficDeduction: 120,
    netTraffic: 480,
    netSalaryPayable: 16800,
    cardSalary: 12000,
    cashSalary: 4800,
    remarks: "",
    project: "1",
    status: "Posted",
    isLocked: true,
    gender: "M",
  },
  {
    id: 10,
    empCode: "10010",
    name: "MARIAM SALEM",
    arabicName: "مريم سالم",
    designation: "Helper",
    idNumber: "8901234567",
    nationality: "Filipino",
    professionInId: "عامل",
    gosiCity: "Jeddah",
    passportNumber: "H8901234",
    passportExpiryDate: "Feb-2026",
    joiningDate: "15-Aug-2023",
    iban: "SA8901234567890123456789",
    bankCode: "B-2",
    gosiSalary: 1800,
    workDays: 21,
    overTime: 4,
    totalHours: 172,
    hourlyRate: 50,
    allowance: 200,
    totalSalary: 8800,
    previousAdvance: 800,
    currentAdvance: 400,
    deduction: 250,
    netLoan: 300,
    previousTraffic: 100,
    currentTraffic: 50,
    trafficDeduction: 30,
    netTraffic: 120,
    netSalaryPayable: 8230,
    cardSalary: 6000,
    cashSalary: 2230,
    remarks: "",
    project: "2",
    status: "Pending",
    isLocked: false,
    gender: "F",
  },
  {
    id: 11,
    empCode: "10011",
    name: "OMAR KHALED",
    arabicName: "عمر خالد",
    designation: "Mechanic",
    idNumber: "9012345678",
    nationality: "Saudi",
    professionInId: "ميكانيكي",
    gosiCity: "Riyadh",
    passportNumber: "I9012345",
    passportExpiryDate: "Nov-2025",
    joiningDate: "10-Sep-2022",
    iban: "SA9012345678901234567890",
    bankCode: "23399",
    gosiSalary: 3200,
    workDays: 26,
    overTime: 8,
    totalHours: 216,
    hourlyRate: 95,
    allowance: 900,
    totalSalary: 21420,
    previousAdvance: 2200,
    currentAdvance: 1100,
    deduction: 650,
    netLoan: 1800,
    previousTraffic: 350,
    currentTraffic: 180,
    trafficDeduction: 100,
    netTraffic: 430,
    netSalaryPayable: 18670,
    cardSalary: 13000,
    cashSalary: 5670,
    remarks: "",
    project: "3",
    status: "Pending",
    isLocked: false,
    gender: "M",
  },
  {
    id: 12,
    empCode: "10012",
    name: "LAYLA MOHAMMED",
    arabicName: "ليلى محمد",
    designation: "Secretary",
    idNumber: "0123456789",
    nationality: "Saudi",
    professionInId: "سكرتير",
    gosiCity: "Jeddah",
    passportNumber: "J0123456",
    passportExpiryDate: "Apr-2027",
    joiningDate: "01-Oct-2023",
    iban: "SA0123456789012345678901",
    bankCode: "B-2",
    gosiSalary: 2800,
    workDays: 24,
    overTime: 3,
    totalHours: 195,
    hourlyRate: 85,
    allowance: 600,
    totalSalary: 17175,
    previousAdvance: 1800,
    currentAdvance: 900,
    deduction: 500,
    netLoan: 1200,
    previousTraffic: 250,
    currentTraffic: 120,
    trafficDeduction: 70,
    netTraffic: 300,
    netSalaryPayable: 15675,
    cardSalary: 11000,
    cashSalary: 4675,
    remarks: "",
    project: "1",
    status: "Pending",
    isLocked: false,
    gender: "F",
  },
];

interface EmployeeReportEntry {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  idCard: string;
  idCardExpiry: string;
  passport: string;
  passportExpiry: string;
  designation: string;
  section: string;
  iban: string;
  goalSalary: number;
  rate: number;
  allowance: number;
  deductable: string;
  status: boolean;
  joining: string;
  opening: number;
  fixed: boolean;
  gender: string;
}

const initialEmployeeReportData: EmployeeReportEntry[] = [
  // Formans (Construction) - Section 1
  {
    id: 1,
    code: "10025",
    nameEn: "ABDUL HALEEM AL NAJJAR",
    nameAr: "عبد الحليم عبد القادر عبد الحليم النجار",
    idCard: "2178690265",
    idCardExpiry: "07-Aug-2024",
    passport: "A28463704",
    passportExpiry: "02-Jul-2028",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA5880000723608201039080",
    goalSalary: 25000,
    rate: 83.33,
    allowance: 0,
    deductable: "RJH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 2,
    code: "10006",
    nameEn: "JABER AHMED MOHAMED MAHMOUD",
    nameAr: "جابر احمد محمد محمود",
    idCard: "2044077186",
    idCardExpiry: "23-May-2025",
    passport: "A29079716",
    passportExpiry: "22-Oct-2028",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA2810000001520000073110",
    goalSalary: 15000,
    rate: 66.67,
    allowance: 0,
    deductable: "NCSR",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 3,
    code: "10028",
    nameEn: "AKBAR ALI GHULAM RASOOL",
    nameAr: "اكبر على غلام رسول",
    idCard: "2133286621",
    idCardExpiry: "16-Dec-2024",
    passport: "AA6100043",
    passportExpiry: "10-Jun-2027",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "0104176711001",
    goalSalary: 6000,
    rate: 26.67,
    allowance: 0,
    deductable: "BAZ",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  // Final Out Labour
  {
    id: 4,
    code: "120001",
    nameEn: "ZAKI MOHAMED KAMAL SAGHIR",
    nameAr: "زكي محمد كمال صغير",
    idCard: "2273420840",
    idCardExpiry: "",
    passport: "N01640172",
    passportExpiry: "05-Aug-2026",
    designation: "Engineer",
    section: "Final Out Labour",
    iban: "0817831329880043",
    goalSalary: 0,
    rate: 10.0,
    allowance: 0,
    deductable: "BAZ",
    status: false,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 5,
    code: "120005",
    nameEn: "WALEH UR REHMAN CH MUHAMMAD SADIQ",
    nameAr: "ولي الرحمن چودھری محمد صادق",
    idCard: "2515454870",
    idCardExpiry: "",
    passport: "99104071",
    passportExpiry: "09-Aug-2027",
    designation: "Engineer",
    section: "Final Out Labour",
    iban: "0817831338860043",
    goalSalary: 2471,
    rate: 10.0,
    allowance: 0,
    deductable: "BAZ",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  // Formans (Construction) - Section 2
  {
    id: 6,
    code: "20002",
    nameEn: "MAHMOOD NASR ABDUL SALAM",
    nameAr: "محمود نصر عبد السلام",
    idCard: "2526362361",
    idCardExpiry: "03-Jul-2024",
    passport: "A31879323",
    passportExpiry: "18-Oct-2025",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA4180000645680161612045",
    goalSalary: 5000,
    rate: 30.0,
    allowance: 0,
    deductable: "RJH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 7,
    code: "20014",
    nameEn: "MOHAMED NABIL MAHMOUD ABAZA",
    nameAr: "محمد نبيل محمود أباظه",
    idCard: "2037002469",
    idCardExpiry: "14-Feb-2025",
    passport: "A35987900",
    passportExpiry: "15-Jul-2025",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA2010000032110620085500",
    goalSalary: 6000,
    rate: 20.0,
    allowance: 0,
    deductable: "RJH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 8,
    code: "20023",
    nameEn: "MOHAMMAD HASEEB MUHAMMAD JAMIL",
    nameAr: "حسيب جميل",
    idCard: "2519425900",
    idCardExpiry: "27-Sep-2024",
    passport: "AS6839971",
    passportExpiry: "14-Jan-2025",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA2080000640980183395800",
    goalSalary: 3850,
    rate: 18.33,
    allowance: 0,
    deductable: "BAH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 9,
    code: "20024",
    nameEn: "FAWZI ABDUL KARIM FARAJ JAD",
    nameAr: "فوزي عبد الكريم فرج جاد",
    idCard: "2036849862",
    idCardExpiry: "26-Apr-2025",
    passport: "",
    passportExpiry: "",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA5650000000025932800588",
    goalSalary: 20000,
    rate: 83.33,
    allowance: 0,
    deductable: "BAR",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 10,
    code: "20027",
    nameEn: "DANISH NAZAR MOHAMMED DAUN",
    nameAr: "دانش نظر محمد ضون",
    idCard: "2468025543",
    idCardExpiry: "23-Jun-2024",
    passport: "M1834451",
    passportExpiry: "02-Sep-2024",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA5080000640801535962529",
    goalSalary: 3000,
    rate: 18.33,
    allowance: 0,
    deductable: "RJH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 11,
    code: "20029",
    nameEn: "ELSAED AWAD ELSAIED ELDAAW",
    nameAr: "السيد عوض السيد الداو",
    idCard: "2004795991",
    idCardExpiry: "08-Dec-2024",
    passport: "",
    passportExpiry: "",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA7350000062032572819000",
    goalSalary: 5500,
    rate: 20.0,
    allowance: 0,
    deductable: "JNMA",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
  {
    id: 12,
    code: "20031",
    nameEn: "MUHAMMAD FAIZAN ALI MUHAMMAD M. MALIK",
    nameAr: "محمد فيضان على محمد ملک",
    idCard: "2558621885",
    idCardExpiry: "13-Jan-2025",
    passport: "",
    passportExpiry: "",
    designation: "Engineer",
    section: "Formans (Construction)",
    iban: "SA4080000016108601694871",
    goalSalary: 3250,
    rate: 18.33,
    allowance: 0,
    deductable: "RJH",
    status: true,
    joining: "-",
    opening: 0,
    fixed: true,
    gender: "M",
  },
];

const initialPayrollData: PayrollEntry[] = [
  {
    id: 10,
    period: "DEC 2025",
    gosiSalary: 175900,
    salary: 225720,
    previousAdvance: 46657,
    currentAdvance: 1000,
    deduction: 4350,
    netLoan: -352,
    netSalaryPayable: 7132,
    cardSalary: 105170,
    cashSalary: 116014,
    status: "Pending",
  },
  {
    id: 1,
    period: "JAN 2025",
    gosiSalary: 690853,
    salary: 1121577,
    previousAdvance: 154583,
    currentAdvance: 50267,
    deduction: 62172,
    netLoan: 7759,
    netSalaryPayable: 97969,
    cardSalary: 371172,
    cashSalary: 688252,
    status: "Posted",
  },
  {
    id: 2,
    period: "FEB 2025",
    gosiSalary: 699805,
    salary: 1076188,
    previousAdvance: 147611,
    currentAdvance: 63119,
    deduction: 42497,
    netLoan: 24634,
    netSalaryPayable: 81713,
    cardSalary: 388685,
    cashSalary: 645112,
    status: "Posted",
  },
  {
    id: 3,
    period: "MAR 2025",
    gosiSalary: 717403,
    salary: 821263,
    previousAdvance: 173933,
    currentAdvance: 58329,
    deduction: 52005,
    netLoan: 46123,
    netSalaryPayable: 215474,
    cardSalary: 306175,
    cashSalary: 463319,
    status: "Posted",
  },
  {
    id: 4,
    period: "APR 2025",
    gosiSalary: 699303,
    salary: 956258,
    previousAdvance: 181579,
    currentAdvance: 66068,
    deduction: 35239,
    netLoan: 10829,
    netSalaryPayable: 77722,
    cardSalary: 381824,
    cashSalary: 539893,
    status: "Posted",
  },
  {
    id: 5,
    period: "MAY 202525",
    gosiSalary: 699303,
    salary: 1190127,
    previousAdvance: 212408,
    currentAdvance: 53012,
    deduction: 84872,
    netLoan: 83950,
    netSalaryPayable: 72686,
    cardSalary: 446990,
    cashSalary: 658274,
    status: "Posted",
  },
  {
    id: 6,
    period: "JUN 2025",
    gosiSalary: 613103,
    salary: 931819,
    previousAdvance: 139401,
    currentAdvance: 29424,
    deduction: 42671,
    netLoan: 72436,
    netSalaryPayable: 542446,
    cardSalary: 390397,
    cashSalary: 498680,
    status: "Posted",
  },
  {
    id: 7,
    period: "JUL 2025",
    gosiSalary: 648053,
    salary: 891314,
    previousAdvance: 132625,
    currentAdvance: 29932,
    deduction: 39439,
    netLoan: 5740,
    netSalaryPayable: 159266,
    cardSalary: 366240,
    cashSalary: 485646,
    status: "Posted",
  },
  {
    id: 8,
    period: "OCT 2025",
    gosiSalary: 784959,
    salary: 1350379,
    previousAdvance: 270024,
    currentAdvance: 113976,
    deduction: 74221,
    netLoan: 8710,
    netSalaryPayable: 75665,
    cardSalary: 417486,
    cashSalary: 845904,
    status: "Posted",
  },
  {
    id: 9,
    period: "NOV 2025",
    gosiSalary: 878507,
    salary: 1381864,
    previousAdvance: 297385,
    currentAdvance: 111891,
    deduction: 116801,
    netLoan: 25287,
    netSalaryPayable: 305013,
    cardSalary: 391906,
    cashSalary: 853674,
    status: "Posted",
  },
];

const initialLoansData: LoanEntry[] = [
  {
    id: 1,
    date: "01-Dec-2025",
    code: "60045",
    employeeName: "TAIMOOR HASSAN MUHAMMAD WALAYAT",
    designation: "Truck House Driver",
    amount: 200,
    remarks: "Exit re-entry visa fess",
    type: "loan",
  },
  {
    id: 2,
    date: "04-Dec-2025",
    code: "90525",
    employeeName: "NADEEM ABBAS",
    designation: "OS, Carpenter",
    amount: 500,
    remarks: "Issue Iqama Process fee (Abu Mashal)",
    type: "return",
  },
  {
    id: 3,
    date: "08-Dec-2025",
    code: "10014",
    employeeName: "WAKIL AHMED CHOUDHURY",
    designation: "Data Operator",
    amount: 1000,
    remarks: "PV-6541",
    type: "loan",
  },
  {
    id: 4,
    date: "09-Dec-2025",
    code: "90668",
    employeeName: "WAQAR AHMED",
    designation: "Shavel Operator",
    amount: 200,
    remarks: "Advance taken by sajid aurangzeb",
    type: "return",
  },
  {
    id: 5,
    date: "10-Dec-2025",
    code: "90642",
    employeeName: "ZAKRIYA MUHAMMED",
    designation: "Carpenter",
    amount: 500,
    remarks: "Advance PV-6086",
    type: "loan",
  },
  {
    id: 6,
    date: "11-Dec-2025",
    code: "60062",
    employeeName: "SHAHADAT KHAN MUHAMMAD TUFAIL",
    designation: "Truck House Driver",
    amount: 2000,
    remarks: "Naqal Kafala fees",
    type: "return",
  },
  {
    id: 7,
    date: "12-Dec-2025",
    code: "40104",
    employeeName: "SHAD MUHAMMAD UMAR DAD",
    designation: "Carpenter",
    amount: 3000,
    remarks: "PV-6564 khafala Charges paid outside",
    type: "loan",
  },
  {
    id: 8,
    date: "13-Dec-2025",
    code: "40103",
    employeeName: "MUHAMMAD SAJID AURANGZEB",
    designation: "Data Operator",
    amount: 2500,
    remarks: "3 months iqama JAN, FEB, MAR 2026",
    type: "return",
  },
  {
    id: 9,
    date: "14-Dec-2025",
    code: "60065",
    employeeName: "ISHTIAQ AHMED MUHAMMAD SIDDIQUE",
    designation: "Truck House Driver",
    amount: 7500,
    remarks: "Jun 2025 to Feb 2026",
    type: "loan",
  },
  {
    id: 10,
    date: "15-Dec-2025",
    code: "60066",
    employeeName: "AHMED ALI KHAN",
    designation: "Shavel Operator",
    amount: 400,
    remarks: "Advance",
    type: "return",
  },
];

// Generate more entries to reach 152 total (as shown in pagination)
for (let i = 11; i <= 152; i++) {
  const designations = [
    "Truck House Driver",
    "OS, Carpenter",
    "Data Operator",
    "Shavel Operator",
    "Carpenter",
    "Site Supervisor",
    "Mechanical Engineer",
    "Electrician",
  ];
  const employeeNames = [
    "TAIMOOR HASSAN MUHAMMAD WALAYAT",
    "NADEEM ABBAS",
    "WAKIL AHMED CHOUDHURY",
    "WAQAR AHMED",
    "ZAKRIYA MUHAMMED",
    "SHAHADAT KHAN MUHAMMAD TUFAIL",
    "SHAD MUHAMMAD UMAR DAD",
    "MUHAMMAD SAJID AURANGZEB",
    "ISHTIAQ AHMED MUHAMMAD SIDDIQUE",
    "AHMED ALI KHAN",
    "MUHAMMAD HASSAN",
    "ALI AHMED",
    "HASSAN MUHAMMAD",
    "ABDUL RAHMAN",
    "OMAR ALI",
  ];
  const remarks = [
    "Exit re-entry visa fess",
    "Issue Iqama Process fee",
    "PV-6541",
    "Advance taken",
    "Advance PV-6086",
    "Naqal Kafala fees",
    "khafala Charges paid outside",
    "3 months iqama",
    "Advance",
    "Medical expenses",
    "Travel expenses",
    "Emergency loan",
  ];

  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = "Dec";
  const year = 2025;
  const code = String(Math.floor(Math.random() * 90000) + 10000);

  initialLoansData.push({
    id: i,
    date: `${day}-${month}-${year}`,
    code: code,
    employeeName:
      employeeNames[Math.floor(Math.random() * employeeNames.length)],
    designation: designations[Math.floor(Math.random() * designations.length)],
    amount: [200, 400, 500, 1000, 1500, 2000, 2500, 3000, 5000, 7500][
      Math.floor(Math.random() * 10)
    ],
    remarks: remarks[Math.floor(Math.random() * remarks.length)],
    type: i % 2 === 0 ? "loan" : "return",
  });
}

interface ChallanEntry {
  id: number;
  date: string; // DD-Mon-YYYY format
  code: string; // Employee code
  employeeName: string;
  designation: string;
  amount: number;
  remarks: string;
  type: string;
}

interface ExitReentryEntry {
  id: number;
  code: string; // Employee code
  employeeName: string;
  designation: string;
  type: "Exit" | "Entry";
  date: string; // DD-Mon-YYYY format
  remarks: string;
}

const initialChallansData: ChallanEntry[] = [
  {
    id: 1,
    date: "18-Dec-2025",
    code: "60065",
    employeeName: "ISHTIAQ AHMED MUHAMMAD SIDDIQUE",
    designation: "Truck House Driver",
    amount: 113,
    type: "challan",
    remarks: "Traffic Violation",
  },
  {
    id: 2,
    date: "24-Dec-2025",
    code: "60039",
    employeeName: "MUDASSAR IQBAL MAZHAR IQBAL",
    designation: "Truck House Driver",
    amount: 0,
    type: "return",
    remarks: "Traffic Violations Refunded",
  },
  {
    id: 3,
    date: "30-Dec-2025",
    code: "60008",
    employeeName: "WASEEM AKHTAR MUHAMMAD ISMAIL",
    designation: "Mechanic",
    amount: 2925,
    type: "challan",
    remarks: "Traffic Violation",
  },
  {
    id: 4,
    date: "31-Dec-2025",
    code: "60008",
    employeeName: "WASEEM AKHTAR MUHAMMAD ISMAIL",
    designation: "Mechanic",
    amount: 375,
    type: "challan",
    remarks:
      "Violation 3126334315 Date: 2025-12-23 استخدام السائق بيده أي جهاز محمول اثناء سير المركبة",
  },
  {
    id: 5,
    date: "31-Dec-2025",
    code: "60058",
    employeeName: "REHMAT ULLAH SHARIF",
    designation: "Truck House Driver",
    amount: 763,
    type: "challan",
    remarks: "Traffic Violation",
  },
  {
    id: 6,
    date: "31-Dec-2025",
    code: "65029",
    employeeName: "SHAKIR ULLAH",
    designation: "OS, Driver",
    amount: 113,
    type: "challan",
    remarks: "Traffic Violation",
  },
  {
    id: 7,
    date: "31-Dec-2025",
    code: "90020",
    employeeName: "ARSHAD MANDI",
    designation: "OS, Steel Fixer",
    amount: 75,
    type: "challan",
    remarks: "Traffic Violation 2009",
  },
  {
    id: 8,
    date: "31-Dec-2025",
    code: "90020",
    employeeName: "ARSHAD MANDI",
    designation: "OS, Steel Fixer",
    amount: 113,
    type: "challan",
    remarks: "Traffic Violation 3457",
  },
  {
    id: 9,
    date: "31-Dec-2025",
    code: "20007",
    employeeName: "BASHARAT SAIN",
    designation: "Forman",
    amount: 226,
    type: "challan",
    remarks: "Traffic Violation 6193",
  },
  {
    id: 10,
    date: "31-Dec-2025",
    code: "30072",
    employeeName: "IFTIKHAR AHMED MUHAMMAD SHARIF",
    designation: "SF, Labour",
    amount: 188,
    type: "challan",
    remarks: "Traffic Violation 3457",
  },
];

// Generate more entries to reach 21 total (as shown in pagination)
for (let i = 11; i <= 21; i++) {
  const designations = [
    "Truck House Driver",
    "Mechanic",
    "OS, Driver",
    "OS, Steel Fixer",
    "Forman",
    "SF, Labour",
    "Carpenter",
    "Data Operator",
  ];
  const employeeNames = [
    "ISHTIAQ AHMED MUHAMMAD SIDDIQUE",
    "MUDASSAR IQBAL MAZHAR IQBAL",
    "WASEEM AKHTAR MUHAMMAD ISMAIL",
    "REHMAT ULLAH SHARIF",
    "SHAKIR ULLAH",
    "ARSHAD MANDI",
    "BASHARAT SAIN",
    "IFTIKHAR AHMED MUHAMMAD SHARIF",
    "TAIMOOR HASSAN MUHAMMAD WALAYAT",
    "NADEEM ABBAS",
  ];
  const remarks = [
    "Traffic Violation",
    "Traffic Violations Refunded",
    "Traffic Violation 2009",
    "Traffic Violation 3457",
    "Traffic Violation 6193",
    "Violation 3126334315",
    "Speeding violation",
    "Parking violation",
  ];

  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const month = "Dec";
  const year = 2025;
  const code = String(Math.floor(Math.random() * 90000) + 10000);

  const challanAmounts = [0, 75, 113, 188, 226, 375, 763, 2925];
  const types = ["challan", "return"];

  initialChallansData.push({
    id: i,
    date: `${day}-${month}-${year}`,
    code: code,
    employeeName:
      employeeNames[Math.floor(Math.random() * employeeNames.length)],
    designation: designations[Math.floor(Math.random() * designations.length)],
    amount: challanAmounts[Math.floor(Math.random() * challanAmounts.length)],
    type: types[Math.floor(Math.random() * types.length)],
    remarks: remarks[Math.floor(Math.random() * remarks.length)],
  });
}

const initialExitReentryData: ExitReentryEntry[] = [
  {
    id: 1,
    code: "21005",
    employeeName: "AZHAR IQBAL MUHAMMAD INAYAT",
    designation: "Driver",
    type: "Exit",
    date: "15-Jul-2024",
    remarks: "Exit re-entry visa fees",
  },
  {
    id: 2,
    code: "55012",
    employeeName: "BELAL AHMED",
    designation: "BD, Labour",
    type: "Entry",
    date: "11-May-2024",
    remarks: "Return from exit",
  },
  {
    id: 3,
    code: "55025",
    employeeName: "FARUK AHMED CHY",
    designation: "BD, Labour",
    type: "Exit",
    date: "11-May-2024",
    remarks: "Exit re-entry visa fees",
  },
  {
    id: 4,
    code: "55026",
    employeeName: "MOHAMMED FARUK - MIAH",
    designation: "BD, Labour",
    type: "Entry",
    date: "12-May-2024",
    remarks: "Return from exit",
  },
];

interface LedgerEntry {
  id: number;
  date: string; // DD-Mon-YYYY format or empty
  description: string;
  salary: number | null;
  loan: number | null;
  challan: number | null;
  deduction: number | null;
  balance: number;
}

const initialLedgerData: LedgerEntry[] = [
  {
    id: 1,
    date: "",
    description: "Opening Balance",
    salary: null,
    loan: null,
    challan: null,
    deduction: null,
    balance: 0,
  },
  {
    id: 2,
    date: "31-Jul-2022",
    description: "Salary (Jul 22)",
    salary: 3000,
    loan: null,
    challan: null,
    deduction: null,
    balance: 3000,
  },
  {
    id: 3,
    date: "15-Aug-2022",
    description: "Loan (Aug 22)",
    salary: null,
    loan: 500,
    challan: null,
    deduction: null,
    balance: 2500,
  },
  {
    id: 4,
    date: "20-Aug-2022",
    description: "Challan (Aug 22)",
    salary: null,
    loan: null,
    challan: 150,
    deduction: null,
    balance: 2350,
  },
  {
    id: 5,
    date: "31-Aug-2022",
    description: "Salary (Aug 22)",
    salary: 6000,
    loan: null,
    challan: null,
    deduction: null,
    balance: 8350,
  },
  {
    id: 6,
    date: "10-Sep-2022",
    description: "Loan (Sep 22)",
    salary: null,
    loan: 800,
    challan: null,
    deduction: null,
    balance: 7550,
  },
  {
    id: 7,
    date: "25-Sep-2022",
    description: "Challan (Sep 22)",
    salary: null,
    loan: null,
    challan: 200,
    deduction: null,
    balance: 7350,
  },
  {
    id: 8,
    date: "30-Sep-2022",
    description: "Salary (Sep 22)",
    salary: 6000,
    loan: null,
    challan: null,
    deduction: null,
    balance: 13350,
  },
  {
    id: 9,
    date: "12-Oct-2022",
    description: "Loan (Oct 22)",
    salary: null,
    loan: 1000,
    challan: null,
    deduction: null,
    balance: 12350,
  },
  {
    id: 10,
    date: "18-Oct-2022",
    description: "Challan (Oct 22)",
    salary: null,
    loan: null,
    challan: 300,
    deduction: null,
    balance: 12050,
  },
  {
    id: 11,
    date: "31-Oct-2022",
    description: "Salary (Oct 22)",
    salary: 6000,
    loan: null,
    challan: null,
    deduction: null,
    balance: 18050,
  },
];

interface Country {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

interface GosiCity {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

const countriesData: Country[] = [
  {
    id: 1,
    nameEn: "Afghanistan",
    nameAr: "أفغانستان",
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Bangladish",
    nameAr: "بنغلاديش",
    isActive: true,
  },
  {
    id: 3,
    nameEn: "C-Lanka",
    nameAr: "س-لانكا",
    isActive: true,
  },
  {
    id: 4,
    nameEn: "Egypt",
    nameAr: "مصر",
    isActive: true,
  },
  {
    id: 5,
    nameEn: "Hind",
    nameAr: "الهند",
    isActive: true,
  },
  {
    id: 6,
    nameEn: "Pakistan",
    nameAr: "باكستان",
    isActive: true,
  },
  {
    id: 7,
    nameEn: "Palastine",
    nameAr: "فلسطين",
    isActive: true,
  },
  {
    id: 8,
    nameEn: "Saudi",
    nameAr: "السعودية",
    isActive: true,
  },
  {
    id: 9,
    nameEn: "Siria",
    nameAr: "سوريا",
    isActive: true,
  },
  {
    id: 10,
    nameEn: "Sudani",
    nameAr: "السودان",
    isActive: true,
  },
];

const gosiCitiesData: GosiCity[] = [
  {
    id: 1,
    nameEn: "Riyadh",
    nameAr: "الرياض",
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Jeddah",
    nameAr: "جدة",
    isActive: true,
  },
  {
    id: 3,
    nameEn: "Al Barq",
    nameAr: "البرق",
    isActive: true,
  },
];

// Permission types for features
export type PermissionType = "full" | "add" | "edit" | "view";

export interface FeaturePermissions {
  full: boolean;
  add: boolean;
  edit: boolean;
  view: boolean;
}

export interface ReportFilterOption {
  key: string;
  label?: string; // Optional - labels come from REPORT_OPTIONS config, not saved in state
  enabled: boolean;
}

export interface ReportPermissions {
  reportId: string;
  enabled: boolean;
  filters?: ReportFilterOption[];
}

export interface ReportsPrivileges extends FeaturePermissions {
  reports?: ReportPermissions[];
}

export interface UserPrivileges {
  employees?: FeaturePermissions;
  timesheet?: FeaturePermissions;
  projects?: FeaturePermissions;
  loans?: FeaturePermissions;
  trafficChallans?: FeaturePermissions;
  exitReentry?: FeaturePermissions;
  payroll?: FeaturePermissions;
  ledger?: FeaturePermissions;
  usersManagement?: FeaturePermissions;
  reports?: ReportsPrivileges;
  setup?: FeaturePermissions;
  dashboard?: FeaturePermissions;
}

interface UserRole {
  id: number;
  nameEn: string;
  nameAr: string;
  access: string;
  isActive: boolean;
}

/**
 * User Role Access Level Definitions:
 *
 * 1. Admin - Can do anything of all branches (all functionalities)
 * 2. Manager - Can do anything of all branches except user management
 * 3. User with Privileges - Customizable permissions with checkboxes for each feature
 */
const userRolesData: UserRole[] = [
  {
    id: 1,
    nameEn: "Admin",
    nameAr: "مدير",
    access: "Admin",
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Manager",
    nameAr: "مدير",
    access: "Manager",
    isActive: true,
  },
  {
    id: 3,
    nameEn: "Branch Manager",
    nameAr: "مدير فرع",
    access: "Branch Manager",
    isActive: true,
  },
  {
    id: 4,
    nameEn: "User with Privileges",
    nameAr: "مستخدم بصلاحيات",
    access: "User with Privileges",
    isActive: true,
  },
];

interface User {
  id: number;
  nameEn: string;
  nameAr: string;
  email: string;
  userRoleId: number;
  branchId: number | null; // Required for Branch Manager (roleId: 3)
  isActive: boolean;
  privileges?: UserPrivileges; // Only for User with Privileges role
}

const usersData: User[] = [
  {
    id: 1,
    nameEn: "John Admin",
    nameAr: "جون أدمن",
    email: "john.admin@example.com",
    userRoleId: 1,
    branchId: null,
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Sarah Manager",
    nameAr: "سارة مدير",
    email: "sarah.manager@example.com",
    userRoleId: 2,
    branchId: null,
    isActive: true,
  },
  {
    id: 3,
    nameEn: "Ahmed User",
    nameAr: "أحمد مستخدم",
    email: "ahmed.user@example.com",
    userRoleId: 3,
    branchId: 1, // Branch Manager must have a branch
    isActive: true,
    privileges: {
      employees: {
        full: false,
        add: true,
        edit: true,
        view: true,
      },
      timesheet: {
        full: false,
        add: true,
        edit: false,
        view: true,
      },
      reports: {
        full: false,
        add: false,
        edit: false,
        view: true,
      },
    },
  },
];

interface EmployeeStatus {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

const employeeStatusesData: EmployeeStatus[] = [
  {
    id: 1,
    nameEn: "Active",
    nameAr: "نشط",
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Final Exit",
    nameAr: "خروج نهائي",
    isActive: false,
  },
  {
    id: 3,
    nameEn: "Haroob",
    nameAr: "هرووب",
    isActive: false,
  },
  {
    id: 4,
    nameEn: "Inactive",
    nameAr: "غير نشط",
    isActive: false,
  },
  {
    id: 5,
    nameEn: "Resigned",
    nameAr: "استقال",
    isActive: false,
  },
  {
    id: 6,
    nameEn: "Terminated",
    nameAr: "مُنهي",
    isActive: false,
  },
  {
    id: 7,
    nameEn: "Vacation",
    nameAr: "إجازة",
    isActive: true,
  },
];

interface City {
  id: number;
  nameEn: string;
  nameAr: string;
  countryId: number;
  isActive: boolean;
}

const citiesData: City[] = [
  // Afghanistan (id: 1)
  {
    id: 1,
    nameEn: "Kabul",
    nameAr: "كابل",
    countryId: 1,
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Herat",
    nameAr: "هرات",
    countryId: 1,
    isActive: true,
  },
  {
    id: 3,
    nameEn: "Kandahar",
    nameAr: "قندهار",
    countryId: 1,
    isActive: true,
  },
  {
    id: 4,
    nameEn: "Mazar-i-Sharif",
    nameAr: "مزار شريف",
    countryId: 1,
    isActive: true,
  },
  // Bangladish (id: 2)
  {
    id: 5,
    nameEn: "Dhaka",
    nameAr: "داكا",
    countryId: 2,
    isActive: true,
  },
  {
    id: 6,
    nameEn: "Chittagong",
    nameAr: "شيتاغونغ",
    countryId: 2,
    isActive: true,
  },
  {
    id: 7,
    nameEn: "Sylhet",
    nameAr: "سيلهيت",
    countryId: 2,
    isActive: true,
  },
  {
    id: 8,
    nameEn: "Rajshahi",
    nameAr: "راجشاهي",
    countryId: 2,
    isActive: true,
  },
  // C-Lanka (id: 3)
  {
    id: 9,
    nameEn: "Colombo",
    nameAr: "كولومبو",
    countryId: 3,
    isActive: true,
  },
  {
    id: 10,
    nameEn: "Kandy",
    nameAr: "كاندي",
    countryId: 3,
    isActive: true,
  },
  {
    id: 11,
    nameEn: "Galle",
    nameAr: "غالي",
    countryId: 3,
    isActive: true,
  },
  {
    id: 12,
    nameEn: "Jaffna",
    nameAr: "جافنا",
    countryId: 3,
    isActive: true,
  },
  // Egypt (id: 4)
  {
    id: 13,
    nameEn: "Cairo",
    nameAr: "القاهرة",
    countryId: 4,
    isActive: true,
  },
  {
    id: 14,
    nameEn: "Alexandria",
    nameAr: "الإسكندرية",
    countryId: 4,
    isActive: true,
  },
  {
    id: 15,
    nameEn: "Giza",
    nameAr: "الجيزة",
    countryId: 4,
    isActive: true,
  },
  {
    id: 16,
    nameEn: "Luxor",
    nameAr: "الأقصر",
    countryId: 4,
    isActive: true,
  },
  // Hind (id: 5)
  {
    id: 17,
    nameEn: "Delhi",
    nameAr: "دلهي",
    countryId: 5,
    isActive: true,
  },
  {
    id: 18,
    nameEn: "Mumbai",
    nameAr: "مومباي",
    countryId: 5,
    isActive: true,
  },
  {
    id: 19,
    nameEn: "Bangalore",
    nameAr: "بنغالور",
    countryId: 5,
    isActive: true,
  },
  {
    id: 20,
    nameEn: "Kolkata",
    nameAr: "كلكتا",
    countryId: 5,
    isActive: true,
  },
  // Pakistan (id: 6)
  {
    id: 21,
    nameEn: "Karachi",
    nameAr: "كراتشي",
    countryId: 6,
    isActive: true,
  },
  {
    id: 22,
    nameEn: "Lahore",
    nameAr: "لاهور",
    countryId: 6,
    isActive: true,
  },
  {
    id: 23,
    nameEn: "Islamabad",
    nameAr: "إسلام أباد",
    countryId: 6,
    isActive: true,
  },
  {
    id: 24,
    nameEn: "Faisalabad",
    nameAr: "فيصل أباد",
    countryId: 6,
    isActive: true,
  },
  // Palastine (id: 7)
  {
    id: 25,
    nameEn: "Ramallah",
    nameAr: "رام الله",
    countryId: 7,
    isActive: true,
  },
  {
    id: 26,
    nameEn: "Gaza",
    nameAr: "غزة",
    countryId: 7,
    isActive: true,
  },
  {
    id: 27,
    nameEn: "Nablus",
    nameAr: "نابلس",
    countryId: 7,
    isActive: true,
  },
  {
    id: 28,
    nameEn: "Hebron",
    nameAr: "الخليل",
    countryId: 7,
    isActive: true,
  },
  // Saudi (id: 8)
  {
    id: 29,
    nameEn: "Jeddah",
    nameAr: "جدة",
    countryId: 8,
    isActive: true,
  },
  {
    id: 30,
    nameEn: "Riyadh",
    nameAr: "الرياض",
    countryId: 8,
    isActive: true,
  },
  {
    id: 31,
    nameEn: "Dammam",
    nameAr: "الدمام",
    countryId: 8,
    isActive: true,
  },
  {
    id: 32,
    nameEn: "Khobar",
    nameAr: "الخبر",
    countryId: 8,
    isActive: true,
  },
  {
    id: 33,
    nameEn: "Abha",
    nameAr: "أبها",
    countryId: 8,
    isActive: true,
  },
  {
    id: 34,
    nameEn: "Jazan",
    nameAr: "جازان",
    countryId: 8,
    isActive: true,
  },
  {
    id: 35,
    nameEn: "Mecca",
    nameAr: "مكة المكرمة",
    countryId: 8,
    isActive: true,
  },
  {
    id: 36,
    nameEn: "Medina",
    nameAr: "المدينة المنورة",
    countryId: 8,
    isActive: true,
  },
  // Siria (id: 9)
  {
    id: 37,
    nameEn: "Damascus",
    nameAr: "دمشق",
    countryId: 9,
    isActive: true,
  },
  {
    id: 38,
    nameEn: "Aleppo",
    nameAr: "حلب",
    countryId: 9,
    isActive: true,
  },
  {
    id: 39,
    nameEn: "Homs",
    nameAr: "حمص",
    countryId: 9,
    isActive: true,
  },
  {
    id: 40,
    nameEn: "Latakia",
    nameAr: "اللاذقية",
    countryId: 9,
    isActive: true,
  },
  // Sudani (id: 10)
  {
    id: 41,
    nameEn: "Khartoum",
    nameAr: "الخرطوم",
    countryId: 10,
    isActive: true,
  },
  {
    id: 42,
    nameEn: "Port Sudan",
    nameAr: "بورت سودان",
    countryId: 10,
    isActive: true,
  },
  {
    id: 43,
    nameEn: "Omdurman",
    nameAr: "أم درمان",
    countryId: 10,
    isActive: true,
  },
  {
    id: 44,
    nameEn: "Kassala",
    nameAr: "كسلا",
    countryId: 10,
    isActive: true,
  },
];

interface Branch {
  id: number;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

const branchesData: Branch[] = [
  {
    id: 1,
    nameEn: "Jeddah",
    nameAr: "جدة",
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Riyadh",
    nameAr: "الرياض",
    isActive: true,
  },
];

interface Designation {
  id: number;
  nameEn: string;
  nameAr: string;
  hoursPerDay: number;
  displayOrder: number;
  color: string; // hex color
  breakfastAllowance: boolean;
  isActive: boolean;
}

const designationsData: Designation[] = [
  {
    id: 1,
    nameEn: "Engineer",
    nameAr: "مهندس",
    hoursPerDay: 8,
    displayOrder: 1,
    color: "#3B82F6",
    breakfastAllowance: true,
    isActive: true,
  },
  {
    id: 2,
    nameEn: "Manager",
    nameAr: "مدير",
    hoursPerDay: 8,
    displayOrder: 2,
    color: "#10B981",
    breakfastAllowance: true,
    isActive: true,
  },
  {
    id: 3,
    nameEn: "Assistant",
    nameAr: "مساعد",
    hoursPerDay: 8,
    displayOrder: 3,
    color: "#F59E0B",
    breakfastAllowance: false,
    isActive: true,
  },
  {
    id: 4,
    nameEn: "Truck House Driver",
    nameAr: "سائق شاحنة",
    hoursPerDay: 10,
    displayOrder: 4,
    color: "#EF4444",
    breakfastAllowance: true,
    isActive: true,
  },
  {
    id: 5,
    nameEn: "Carpenter",
    nameAr: "نجار",
    hoursPerDay: 8,
    displayOrder: 5,
    color: "#8B5CF6",
    breakfastAllowance: false,
    isActive: true,
  },
  {
    id: 6,
    nameEn: "Data Operator",
    nameAr: "عامل بيانات",
    hoursPerDay: 8,
    displayOrder: 6,
    color: "#06B6D4",
    breakfastAllowance: false,
    isActive: true,
  },
  {
    id: 7,
    nameEn: "Mechanic",
    nameAr: "ميكانيكي",
    hoursPerDay: 8,
    displayOrder: 7,
    color: "#F97316",
    breakfastAllowance: false,
    isActive: true,
  },
  {
    id: 8,
    nameEn: "OS, Driver",
    nameAr: "سائق",
    hoursPerDay: 10,
    displayOrder: 8,
    color: "#EC4899",
    breakfastAllowance: true,
    isActive: true,
  },
];

interface PayrollSection {
  id: number;
  nameEn: string;
  nameAr: string;
  displayOrder: number;
  isActive: boolean;
  designations: number[];
}

const payrollSectionsData: PayrollSection[] = [
  {
    id: 1,
    nameEn: "Office Staff",
    nameAr: "موظفو المكتب",
    displayOrder: 1,
    isActive: true,
    designations: [1, 2, 3], // Engineer, Manager, Assistant
  },
  {
    id: 2,
    nameEn: "Formans (Construction)",
    nameAr: "فورمان (بناء)",
    displayOrder: 3,
    isActive: true,
    designations: [2, 5, 6], // Manager, Carpenter, Data Operator
  },
  {
    id: 3,
    nameEn: "Drivers (Construction)",
    nameAr: "سائقون (بناء)",
    displayOrder: 4,
    isActive: true,
    designations: [4, 8], // Truck House Driver, OS Driver
  },
  {
    id: 4,
    nameEn: "Carpenters (Construction)",
    nameAr: "نجارون (بناء)",
    displayOrder: 7,
    isActive: true,
    designations: [5], // Carpenter
  },
  {
    id: 5,
    nameEn: "Masons (Construction)",
    nameAr: "بناؤون (بناء)",
    displayOrder: 8,
    isActive: true,
    designations: [3, 6], // Assistant, Data Operator
  },
  {
    id: 6,
    nameEn: "Electrician (Construction)",
    nameAr: "كهربائي (بناء)",
    displayOrder: 9,
    isActive: true,
    designations: [1, 7], // Engineer, Mechanic
  },
  {
    id: 7,
    nameEn: "BD, Labour (Construction)",
    nameAr: "عمال BD (بناء)",
    displayOrder: 10,
    isActive: true,
    designations: [3, 6], // Assistant, Data Operator
  },
  {
    id: 8,
    nameEn: "OS, Labour (Construction)",
    nameAr: "عمال OS (بناء)",
    displayOrder: 12,
    isActive: true,
    designations: [8], // OS Driver
  },
  {
    id: 9,
    nameEn: "MEP",
    nameAr: "MEP",
    displayOrder: 13,
    isActive: true,
    designations: [1, 7], // Engineer, Mechanic
  },
  {
    id: 10,
    nameEn: "Final Out Labour",
    nameAr: "عمال النهائي",
    displayOrder: 16,
    isActive: true,
    designations: [3, 6], // Assistant, Data Operator
  },
  {
    id: 11,
    nameEn: "Steel Fixers (Construction)",
    nameAr: "مثبتون فولاذ (بناء)",
    displayOrder: 2,
    isActive: true,
    designations: [5, 7], // Carpenter, Mechanic
  },
  {
    id: 12,
    nameEn: "Plumbers (Construction)",
    nameAr: "سباكون (بناء)",
    displayOrder: 5,
    isActive: true,
    designations: [7], // Mechanic
  },
  {
    id: 13,
    nameEn: "Painters (Construction)",
    nameAr: "رسامون (بناء)",
    displayOrder: 6,
    isActive: true,
    designations: [3, 6], // Assistant, Data Operator
  },
  {
    id: 14,
    nameEn: "Welders (Construction)",
    nameAr: "لحامون (بناء)",
    displayOrder: 11,
    isActive: true,
    designations: [7], // Mechanic
  },
  {
    id: 15,
    nameEn: "Heavy Equipment Operators",
    nameAr: "مشغلو المعدات الثقيلة",
    displayOrder: 14,
    isActive: true,
    designations: [4, 8], // Truck House Driver, OS Driver
  },
  {
    id: 16,
    nameEn: "Supervisors (Construction)",
    nameAr: "مشرفون (بناء)",
    displayOrder: 15,
    isActive: true,
    designations: [2], // Manager
  },
];

export {
  stats,
  projectsData,
  expensesByProject,
  branches,
  projects,
  months,
  employees,
  designationOptions,
  initialTimesheetData,
  initialLoansData,
  initialChallansData,
  initialExitReentryData,
  initialLedgerData,
  initialPayrollData,
  initialPayrollDetailData,
  initialEmployeeReportData,
  countriesData,
  citiesData,
  gosiCitiesData,
  branchesData,
  designationsData,
  payrollSectionsData,
  employeeStatusesData,
  userRolesData,
  usersData,
};
export type {
  ProjectExpense,
  Employee,
  TimesheetEntry,
  LoanEntry,
  ChallanEntry,
  ExitReentryEntry,
  LedgerEntry,
  PayrollEntry,
  PayrollDetailEntry,
  EmployeeReportEntry,
  Country,
  City,
  GosiCity,
  Branch,
  PayrollSection,
  Designation,
  EmployeeStatus,
  UserRole,
  User,
  Project,
};
