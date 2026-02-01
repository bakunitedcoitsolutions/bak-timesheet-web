/**
 * Database Seed Script
 * Run with: npm run db:seed
 *
 * This script seeds initial data for:
 * - User Roles
 * - Employee Statuses
 * - Designations
 * - Payroll Sections
 * - Branches
 * - Countries
 * - Cities
 * - GOSI Cities
 */

// import "dotenv/config";
// import { Pool } from "pg";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "./generated/prisma/client";

// console.log("DATABASE_URL", process.env.DATABASE_URL);

// const prisma = new PrismaClient({
//   adapter: new PrismaPg(
//     new Pool({
//       connectionString: process.env.DATABASE_URL,
//     })
//   ),
// });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
});

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed User Roles
  console.log("📝 Seeding User Roles...");
  const userRoles = [
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
      nameEn: "Access-Enabled User",
      nameAr: "مستخدم بصلاحيات",
      access: "Access-Enabled User",
      isActive: true,
    },
  ];

  for (const role of userRoles) {
    await prisma.userRole.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log(`✅ Seeded ${userRoles.length} user roles`);

  // Seed Payment Methods
  console.log("📝 Seeding Payment Methods...");
  const paymentMethods = [
    {
      id: 1,
      nameEn: "Card 1",
      nameAr: "بطاقة 1",
      isActive: true,
    },
    {
      id: 2,
      nameEn: "Card 2",
      nameAr: "بطاقة 2",
      isActive: true,
    },
    {
      id: 3,
      nameEn: "Transfer",
      nameAr: "تحويل",
      isActive: true,
    },
    {
      id: 4,
      nameEn: "Jeddah - Cash",
      nameAr: "جدة - نقد",
      isActive: true,
    },
    {
      id: 5,
      nameEn: "Riyadh - Cash",
      nameAr: "الرياض - نقد",
      isActive: true,
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: method.id },
      update: method,
      create: method,
    });
  }
  console.log(`✅ Seeded ${paymentMethods.length} payment methods`);

  // Seed Payroll Statuses
  console.log("📝 Seeding Payroll Statuses...");
  const payrollStatuses = [
    {
      id: 1,
      nameEn: "Pending",
      nameAr: "قيد الانتظار",
      isActive: true,
    },
    {
      id: 2,
      nameEn: "Done",
      nameAr: "تم",
      isActive: true,
    },
    {
      id: 3,
      nameEn: "Posted",
      nameAr: "مرحل",
      isActive: true,
    },
    {
      id: 4,
      nameEn: "Revision",
      nameAr: "مراجعة",
      isActive: true,
    },
  ];

  for (const status of payrollStatuses) {
    await prisma.payrollStatus.upsert({
      where: { id: status.id },
      update: status,
      create: status,
    });
  }
  console.log(`✅ Seeded ${payrollStatuses.length} payroll statuses`);

  //   // Seed Employee Statuses
  //   console.log("📝 Seeding Employee Statuses...");
  //   const employeeStatuses = [
  //     {
  //       id: 1,
  //       nameEn: "Active",
  //       nameAr: "نشط",
  //       isActive: true,
  //     },
  //     {
  //       id: 2,
  //       nameEn: "Final Exit",
  //       nameAr: "خروج نهائي",
  //       isActive: false,
  //     },
  //     {
  //       id: 3,
  //       nameEn: "Haroob",
  //       nameAr: "هرووب",
  //       isActive: false,
  //     },
  //     {
  //       id: 4,
  //       nameEn: "Inactive",
  //       nameAr: "غير نشط",
  //       isActive: false,
  //     },
  //     {
  //       id: 5,
  //       nameEn: "Resigned",
  //       nameAr: "استقال",
  //       isActive: false,
  //     },
  //     {
  //       id: 6,
  //       nameEn: "Terminated",
  //       nameAr: "مُنهي",
  //       isActive: false,
  //     },
  //     {
  //       id: 7,
  //       nameEn: "Vacation",
  //       nameAr: "إجازة",
  //       isActive: true,
  //     },
  //   ];

  //   for (const status of employeeStatuses) {
  //     await prisma.employeeStatus.upsert({
  //       where: { id: status.id },
  //       update: status,
  //       create: status,
  //     });
  //   }
  //   console.log(`✅ Seeded ${employeeStatuses.length} employee statuses`);

  // Seed Countries
  console.log("📝 Seeding Countries...");
  const countries = [
    {
      id: 1,
      nameEn: "Saudi",
      nameAr: "السعودية",
      isActive: true,
    },
    {
      id: 3,
      nameEn: "Pakistan",
      nameAr: "باكستان",
      isActive: true,
    },
    {
      id: 4,
      nameEn: "UAE",
      nameAr: "الإمارات",
      isActive: true,
    },
    {
      id: 5,
      nameEn: "Afghanistan",
      nameAr: "أفغانستان",
      isActive: true,
    },
    {
      id: 6,
      nameEn: "Bangladish",
      nameAr: "بنغلاديش",
      isActive: true,
    },
    {
      id: 7,
      nameEn: "Egypt",
      nameAr: "مصر",
      isActive: true,
    },
    {
      id: 8,
      nameEn: "Hind",
      nameAr: "الهند",
      isActive: true,
    },
    {
      id: 9,
      nameEn: "Syria",
      nameAr: "الشام",
      isActive: true,
    },
    {
      id: 10,
      nameEn: "Yaman",
      nameAr: "اليمن",
      isActive: true,
    },
    {
      id: 11,
      nameEn: "C-Lanka",
      nameAr: "س-لانكا",
      isActive: true,
    },
    {
      id: 12,
      nameEn: "Sudan",
      nameAr: "السودان",
      isActive: true,
    },
    {
      id: 13,
      nameEn: "Palastine",
      nameAr: "فلسطين",
      isActive: true,
    },
  ];

  for (const country of countries) {
    await prisma.country.upsert({
      where: { id: country.id },
      update: country,
      create: country,
    });
  }
  console.log(`✅ Seeded ${countries.length} countries`);

  // Seed Cities
  console.log("📝 Seeding Cities...");
  const cities = [
    {
      id: 2,
      nameEn: "Jeddah",
      nameAr: "جدة",
      countryId: 1,
      isActive: true,
    },
    {
      id: 3,
      nameEn: "Makkah",
      nameAr: "مكة",
      countryId: 1,
      isActive: true,
    },
    {
      id: 4,
      nameEn: "Madinah",
      nameAr: "المدينة",
      countryId: 1,
      isActive: true,
    },
    {
      id: 5,
      nameEn: "Riyadh",
      nameAr: "الرياض",
      countryId: 1,
      isActive: true,
    },
    {
      id: 6,
      nameEn: "Taif",
      nameAr: "الطائف",
      countryId: 1,
      isActive: true,
    },
    {
      id: 7,
      nameEn: "Dammam",
      nameAr: "الدمام",
      countryId: 1,
      isActive: true,
    },
    {
      id: 8,
      nameEn: "Neom",
      nameAr: "نيوم",
      countryId: 1,
      isActive: true,
    },
    {
      id: 9,
      nameEn: "Sudan",
      nameAr: "السودان",
      countryId: 12,
      isActive: true,
    },
    {
      id: 10,
      nameEn: "Palastine",
      nameAr: "فلسطين",
      countryId: 13, // Corrected from 1 based on user feedback
      isActive: true,
    },
  ];

  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: city,
      create: city,
    });
  }
  console.log(`✅ Seeded ${cities.length} cities`);

  // Seed GOSI Cities
  console.log("📝 Seeding GOSI Cities...");
  const gosiCities = [
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
    {
      id: 3,
      nameEn: "Al Barq",
      nameAr: "البرق",
      isActive: true,
    },
  ];

  for (const gosiCity of gosiCities) {
    await prisma.gosiCity.upsert({
      where: { id: gosiCity.id },
      update: gosiCity,
      create: gosiCity,
    });
  }
  console.log(`✅ Seeded ${gosiCities.length} GOSI cities`);

  // Seed Branches
  console.log("📝 Seeding Branches...");
  const branches = [
    {
      id: 1,
      nameEn: "BAK Construction",
      nameAr: "جدة",
      isActive: true,
    },
    {
      id: 2,
      nameEn: "Al Barq Transport",
      nameAr: "الرياض",
      isActive: true,
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { id: branch.id },
      update: branch,
      create: branch,
    });
  }
  console.log(`✅ Seeded ${branches.length} branches`);

  //   // Seed Designations
  //   console.log("📝 Seeding Designations...");
  //   const designations = [
  //     {
  //       id: 1,
  //       nameEn: "Engineer",
  //       nameAr: "مهندس",
  //       hoursPerDay: 8,
  //       displayOrderKey: 1,
  //       color: "#3B82F6",
  //       breakfastAllowance: 30.0,
  //       isActive: true,
  //     },
  //     {
  //       id: 2,
  //       nameEn: "Manager",
  //       nameAr: "مدير",
  //       hoursPerDay: 8,
  //       displayOrderKey: 2,
  //       color: "#10B981",
  //       breakfastAllowance: 30.0,
  //       isActive: true,
  //     },
  //     {
  //       id: 3,
  //       nameEn: "Assistant",
  //       nameAr: "مساعد",
  //       hoursPerDay: 8,
  //       displayOrderKey: 3,
  //       color: "#F59E0B",
  //       breakfastAllowance: null,
  //       isActive: true,
  //     },
  //     {
  //       id: 4,
  //       nameEn: "Truck House Driver",
  //       nameAr: "سائق شاحنة",
  //       hoursPerDay: 10,
  //       displayOrderKey: 4,
  //       color: "#EF4444",
  //       breakfastAllowance: 30.0,
  //       isActive: true,
  //     },
  //     {
  //       id: 5,
  //       nameEn: "Carpenter",
  //       nameAr: "نجار",
  //       hoursPerDay: 8,
  //       displayOrderKey: 5,
  //       color: "#8B5CF6",
  //       breakfastAllowance: null,
  //       isActive: true,
  //     },
  //     {
  //       id: 6,
  //       nameEn: "Data Operator",
  //       nameAr: "عامل بيانات",
  //       hoursPerDay: 8,
  //       displayOrderKey: 6,
  //       color: "#06B6D4",
  //       breakfastAllowance: null,
  //       isActive: true,
  //     },
  //     {
  //       id: 7,
  //       nameEn: "Mechanic",
  //       nameAr: "ميكانيكي",
  //       hoursPerDay: 8,
  //       displayOrderKey: 7,
  //       color: "#F97316",
  //       breakfastAllowance: null,
  //       isActive: true,
  //     },
  //     {
  //       id: 8,
  //       nameEn: "OS, Driver",
  //       nameAr: "سائق",
  //       hoursPerDay: 10,
  //       displayOrderKey: 8,
  //       color: "#EC4899",
  //       breakfastAllowance: 30.0,
  //       isActive: true,
  //     },
  //   ];

  //   for (const designation of designations) {
  //     await prisma.designation.upsert({
  //       where: { id: designation.id },
  //       update: designation,
  //       create: designation,
  //     });
  //   }
  //   console.log(`✅ Seeded ${designations.length} designations`);

  //   // Seed Payroll Sections
  //   console.log("📝 Seeding Payroll Sections...");
  //   const payrollSections = [
  //     {
  //       id: 1,
  //       nameEn: "Office Staff",
  //       nameAr: "موظفو المكتب",
  //       displayOrderKey: 1,
  //       isActive: true,
  //     },
  //     {
  //       id: 2,
  //       nameEn: "Formans (Construction)",
  //       nameAr: "فورمان (بناء)",
  //       displayOrderKey: 3,
  //       isActive: true,
  //     },
  //     {
  //       id: 3,
  //       nameEn: "Drivers (Construction)",
  //       nameAr: "سائقون (بناء)",
  //       displayOrderKey: 4,
  //       isActive: true,
  //     },
  //     {
  //       id: 4,
  //       nameEn: "Carpenters (Construction)",
  //       nameAr: "نجارون (بناء)",
  //       displayOrderKey: 7,
  //       isActive: true,
  //     },
  //     {
  //       id: 5,
  //       nameEn: "Masons (Construction)",
  //       nameAr: "بناؤون (بناء)",
  //       displayOrderKey: 8,
  //       isActive: true,
  //     },
  //     {
  //       id: 6,
  //       nameEn: "Electrician (Construction)",
  //       nameAr: "كهربائي (بناء)",
  //       displayOrderKey: 9,
  //       isActive: true,
  //     },
  //     {
  //       id: 7,
  //       nameEn: "BD, Labour (Construction)",
  //       nameAr: "عمال BD (بناء)",
  //       displayOrderKey: 10,
  //       isActive: true,
  //     },
  //   ];

  //   for (const section of payrollSections) {
  //     await prisma.payrollSection.upsert({
  //       where: { id: section.id },
  //       update: section,
  //       create: section,
  //     });
  //   }
  //   console.log(`✅ Seeded ${payrollSections.length} payroll sections`);

  console.log("🎉 Database seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
