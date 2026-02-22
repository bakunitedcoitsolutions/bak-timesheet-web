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
import * as fs from "fs";
import * as path from "path";
import { seedEmployeeLoans } from "./seeds/employee-loans";
import { seedTrafficChallans } from "./seeds/traffic-challans";
import { seedTimesheets } from "./seeds/timesheets";

import { PrismaClient } from "./generated/prisma/client";
import { seedPayrollSummary } from "./seeds/payroll-summary";
import { seedPayrollDetails } from "./seeds/payroll-details";
const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  ),
});

async function main() {
  console.log("🌱 Starting database seed...");

  // // Seed User Roles
  // console.log("📝 Seeding User Roles...");
  // const userRoles = [
  //   {
  //     id: 1,
  //     nameEn: "Admin",
  //     nameAr: "مدير",
  //     access: "Admin",
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Manager",
  //     nameAr: "مدير",
  //     access: "Manager",
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Branch Manager",
  //     nameAr: "مدير فرع",
  //     access: "Branch Manager",
  //     isActive: true,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "Access-Enabled User",
  //     nameAr: "مستخدم بصلاحيات",
  //     access: "Access-Enabled User",
  //     isActive: true,
  //   },
  // ];

  // for (const role of userRoles) {
  //   console.log(`  - Seeding user role: ${role.nameEn} (ID: ${role.id})`);
  //   await prisma.userRole.upsert({
  //     where: { id: role.id },
  //     update: {},
  //     create: role,
  //   });
  // }
  // console.log(`✅ Seeded ${userRoles.length} user roles`);

  // // Seed Payment Methods
  // console.log("📝 Seeding Payment Methods...");
  // const paymentMethods = [
  //   {
  //     id: 1,
  //     nameEn: "Card 1",
  //     nameAr: "بطاقة 1",
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Card 2",
  //     nameAr: "بطاقة 2",
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Transfer",
  //     nameAr: "تحويل",
  //     isActive: true,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "Jeddah - Cash",
  //     nameAr: "جدة - نقد",
  //     isActive: true,
  //   },
  //   {
  //     id: 5,
  //     nameEn: "Riyadh - Cash",
  //     nameAr: "الرياض - نقد",
  //     isActive: true,
  //   },
  // ];

  // for (const method of paymentMethods) {
  //   console.log(
  //     `  - Seeding payment method: ${method.nameEn} (ID: ${method.id})`
  //   );
  //   await prisma.paymentMethod.upsert({
  //     where: { id: method.id },
  //     update: method,
  //     create: method,
  //   });
  // }
  // console.log(`✅ Seeded ${paymentMethods.length} payment methods`);

  // // Seed Payroll Statuses
  // console.log("📝 Seeding Payroll Statuses...");
  // const payrollStatuses = [
  //   {
  //     id: 1,
  //     nameEn: "Pending",
  //     nameAr: "قيد الانتظار",
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Done",
  //     nameAr: "تم",
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Posted",
  //     nameAr: "مرحل",
  //     isActive: true,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "Revision",
  //     nameAr: "مراجعة",
  //     isActive: true,
  //   },
  // ];

  // for (const status of payrollStatuses) {
  //   console.log(
  //     `  - Seeding payroll status: ${status.nameEn} (ID: ${status.id})`
  //   );
  //   await prisma.payrollStatus.upsert({
  //     where: { id: status.id },
  //     update: status,
  //     create: status,
  //   });
  // }
  // console.log(`✅ Seeded ${payrollStatuses.length} payroll statuses`);

  // // Seed Employee Statuses
  // console.log("📝 Seeding Employee Statuses...");
  // const employeeStatuses = [
  //   { id: 1, nameEn: "Active", nameAr: "نشط", isActive: true },
  //   { id: 2, nameEn: "Resigned", nameAr: "مستقيل", isActive: false },
  //   { id: 3, nameEn: "Terminated", nameAr: "منتهي الخدمة", isActive: false },
  //   { id: 4, nameEn: "Vacation", nameAr: "إجازة", isActive: true },
  //   { id: 5, nameEn: "Final Exit", nameAr: "خروج نهائي", isActive: false },
  //   { id: 6, nameEn: "Haroob", nameAr: "هروب", isActive: false },
  //   { id: 7, nameEn: "Inactive", nameAr: "غير نشط", isActive: false },
  // ];

  // for (const status of employeeStatuses) {
  //   console.log(
  //     `  - Seeding employee status: ${status.nameEn} (ID: ${status.id})`
  //   );
  //   await prisma.employeeStatus.upsert({
  //     where: { id: status.id },
  //     update: status,
  //     create: status,
  //   });
  // }
  // console.log(`✅ Seeded ${employeeStatuses.length} employee statuses`);

  // // Seed Countries
  // console.log("📝 Seeding Countries...");
  // const countries = [
  //   {
  //     id: 1,
  //     nameEn: "Saudi",
  //     nameAr: "السعودية",
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Pakistan",
  //     nameAr: "باكستان",
  //     isActive: true,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "UAE",
  //     nameAr: "الإمارات",
  //     isActive: true,
  //   },
  //   {
  //     id: 5,
  //     nameEn: "Afghanistan",
  //     nameAr: "أفغانستان",
  //     isActive: true,
  //   },
  //   {
  //     id: 6,
  //     nameEn: "Bangladish",
  //     nameAr: "بنغلاديش",
  //     isActive: true,
  //   },
  //   {
  //     id: 7,
  //     nameEn: "Egypt",
  //     nameAr: "مصر",
  //     isActive: true,
  //   },
  //   {
  //     id: 8,
  //     nameEn: "Hind",
  //     nameAr: "الهند",
  //     isActive: true,
  //   },
  //   {
  //     id: 9,
  //     nameEn: "Syria",
  //     nameAr: "الشام",
  //     isActive: true,
  //   },
  //   {
  //     id: 10,
  //     nameEn: "Yaman",
  //     nameAr: "اليمن",
  //     isActive: true,
  //   },
  //   {
  //     id: 11,
  //     nameEn: "C-Lanka",
  //     nameAr: "س-لانكا",
  //     isActive: true,
  //   },
  //   {
  //     id: 12,
  //     nameEn: "Sudan",
  //     nameAr: "السودان",
  //     isActive: true,
  //   },
  //   {
  //     id: 13,
  //     nameEn: "Palastine",
  //     nameAr: "فلسطين",
  //     isActive: true,
  //   },
  // ];

  // for (const country of countries) {
  //   console.log(`  - Seeding country: ${country.nameEn} (ID: ${country.id})`);
  //   await prisma.country.upsert({
  //     where: { id: country.id },
  //     update: country,
  //     create: country,
  //   });
  // }
  // console.log(`✅ Seeded ${countries.length} countries`);

  // // Seed Cities
  // console.log("📝 Seeding Cities...");
  // const cities = [
  //   {
  //     id: 2,
  //     nameEn: "Jeddah",
  //     nameAr: "جدة",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Makkah",
  //     nameAr: "مكة",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "Madinah",
  //     nameAr: "المدينة",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 5,
  //     nameEn: "Riyadh",
  //     nameAr: "الرياض",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 6,
  //     nameEn: "Taif",
  //     nameAr: "الطائف",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 7,
  //     nameEn: "Dammam",
  //     nameAr: "الدمام",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 8,
  //     nameEn: "Neom",
  //     nameAr: "نيوم",
  //     countryId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 9,
  //     nameEn: "Sudan",
  //     nameAr: "السودان",
  //     countryId: 12,
  //     isActive: true,
  //   },
  //   {
  //     id: 10,
  //     nameEn: "Palastine",
  //     nameAr: "فلسطين",
  //     countryId: 13, // Corrected from 1 based on user feedback
  //     isActive: true,
  //   },
  // ];

  // for (const city of cities) {
  //   console.log(`  - Seeding city: ${city.nameEn} (ID: ${city.id})`);
  //   await prisma.city.upsert({
  //     where: { id: city.id },
  //     update: city,
  //     create: city,
  //   });
  // }
  // console.log(`✅ Seeded ${cities.length} cities`);

  // // Seed GOSI Cities
  // console.log("📝 Seeding GOSI Cities...");
  // const gosiCities = [
  //   {
  //     id: 1,
  //     nameEn: "Jeddah",
  //     nameAr: "جدة",
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Riyadh",
  //     nameAr: "الرياض",
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Al Barq",
  //     nameAr: "البرق",
  //     isActive: true,
  //   },
  // ];

  // for (const gosiCity of gosiCities) {
  //   console.log(
  //     `  - Seeding GOSI city: ${gosiCity.nameEn} (ID: ${gosiCity.id})`
  //   );
  //   await prisma.gosiCity.upsert({
  //     where: { id: gosiCity.id },
  //     update: gosiCity,
  //     create: gosiCity,
  //   });
  // }
  // console.log(`✅ Seeded ${gosiCities.length} GOSI cities`);

  // // Seed Branches
  // console.log("📝 Seeding Branches...");
  // const branches = [
  //   {
  //     id: 1,
  //     nameEn: "BAK Construction",
  //     nameAr: "جدة",
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Al Barq Transport",
  //     nameAr: "الرياض",
  //     isActive: true,
  //   },
  // ];

  // for (const branch of branches) {
  //   console.log(`  - Seeding branch: ${branch.nameEn} (ID: ${branch.id})`);
  //   await prisma.branch.upsert({
  //     where: { id: branch.id },
  //     update: branch,
  //     create: branch,
  //   });
  // }
  // console.log(`✅ Seeded ${branches.length} branches`);

  // // Seed Designations
  // console.log("📝 Seeding Designations...");
  // const designations = [
  //   {
  //     id: 1,
  //     nameEn: "Driver",
  //     nameAr: "سائق",
  //     displayOrderKey: 13,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Steel Fixer",
  //     nameAr: "حداد حديد",
  //     displayOrderKey: 14,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Forman",
  //     nameAr: "مشرف",
  //     displayOrderKey: 12,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 4,
  //     nameEn: "Carpenter",
  //     nameAr: "نجار",
  //     displayOrderKey: 16,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 5,
  //     nameEn: "BD, Labour",
  //     nameAr: "عامل BD",
  //     displayOrderKey: 20,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 6,
  //     nameEn: "OS, Steel Fixer",
  //     nameAr: "حداد حديد OS",
  //     displayOrderKey: 33,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 7,
  //     nameEn: "OS, Carpenter",
  //     nameAr: "نجار OS",
  //     displayOrderKey: 34,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 8,
  //     nameEn: "BD, Steel Fixer",
  //     nameAr: "حداد حديد BD",
  //     displayOrderKey: 19,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 9,
  //     nameEn: "Mason",
  //     nameAr: "بناء",
  //     displayOrderKey: 18,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 10,
  //     nameEn: "CEO",
  //     nameAr: "الرئيس التنفيذي",
  //     displayOrderKey: 1,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 11,
  //     nameEn: "Director",
  //     nameAr: "مدير",
  //     displayOrderKey: 2,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 12,
  //     nameEn: "General Manager",
  //     nameAr: "المدير العام",
  //     displayOrderKey: 3,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 13,
  //     nameEn: "Engineer",
  //     nameAr: "مهندس",
  //     displayOrderKey: 4,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 14,
  //     nameEn: "Accounts",
  //     nameAr: "محاسب",
  //     displayOrderKey: 5,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 15,
  //     nameEn: "Cashier",
  //     nameAr: "أمين الصندوق",
  //     displayOrderKey: 6,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 16,
  //     nameEn: "Data Operator",
  //     nameAr: "مشغل بيانات",
  //     displayOrderKey: 7,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 17,
  //     nameEn: "Tea Boy",
  //     nameAr: "عامل الشاي",
  //     displayOrderKey: 8,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 18,
  //     nameEn: "Rigger",
  //     nameAr: "عامل رفع",
  //     displayOrderKey: 9,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 19,
  //     nameEn: "Saudi",
  //     nameAr: "سعودي",
  //     displayOrderKey: 10,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 20,
  //     nameEn: "Surveyor",
  //     nameAr: "مساح",
  //     displayOrderKey: 11,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 21,
  //     nameEn: "SF, Labour",
  //     nameAr: "عامل SF",
  //     displayOrderKey: 15,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 22,
  //     nameEn: "CP, Labour",
  //     nameAr: "عامل CP",
  //     displayOrderKey: 17,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 23,
  //     nameEn: "Electrician",
  //     nameAr: "كهربائي",
  //     displayOrderKey: 21,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 24,
  //     nameEn: "Mechanic",
  //     nameAr: "ميكانيكي",
  //     displayOrderKey: 22,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 25,
  //     nameEn: "Truck House Electrician",
  //     nameAr: "كهربائي شاحنة",
  //     displayOrderKey: 23,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 26,
  //     nameEn: "Publish",
  //     nameAr: "نشر",
  //     displayOrderKey: 24,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 27,
  //     nameEn: "Boclain Operator",
  //     nameAr: "مشغل بوكلين",
  //     displayOrderKey: 25,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 28,
  //     nameEn: "Electromechanical",
  //     nameAr: "كهروميكانيكي",
  //     displayOrderKey: 26,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 29,
  //     nameEn: "Personal",
  //     nameAr: "شخصي",
  //     displayOrderKey: 27,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 30,
  //     nameEn: "OS, Engineer",
  //     nameAr: "مهندس OS",
  //     displayOrderKey: 28,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 31,
  //     nameEn: "OS, Surveyor",
  //     nameAr: "مساح OS",
  //     displayOrderKey: 29,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 32,
  //     nameEn: "OS, Forman",
  //     nameAr: "مشرف OS",
  //     displayOrderKey: 30,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 33,
  //     nameEn: "OS, Driver",
  //     nameAr: "سائق OS",
  //     displayOrderKey: 31,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 34,
  //     nameEn: "OS, Electrician",
  //     nameAr: "كهربائي OS",
  //     displayOrderKey: 32,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 35,
  //     nameEn: "Truck House Forman",
  //     nameAr: "مشرف شاحنة",
  //     displayOrderKey: 35,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 36,
  //     nameEn: "OS, Mason",
  //     nameAr: "بناء OS",
  //     displayOrderKey: 36,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 37,
  //     nameEn: "Mason, Labour",
  //     nameAr: "عامل بناء",
  //     displayOrderKey: 38,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 38,
  //     nameEn: "OS, Machinic",
  //     nameAr: "ميكانيكي OS",
  //     displayOrderKey: 37,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 40,
  //     nameEn: "Store Keeper",
  //     nameAr: "أمين مخزن",
  //     displayOrderKey: 39,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 41,
  //     nameEn: "OS, Weldar",
  //     nameAr: "لحام OS",
  //     displayOrderKey: 42,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 42,
  //     nameEn: "OS, Truck House",
  //     nameAr: "شاحنة OS",
  //     displayOrderKey: 41,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 43,
  //     nameEn: "Safety Supervisor",
  //     nameAr: "مشرف السلامة",
  //     displayOrderKey: 40,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 44,
  //     nameEn: "Scaffolder",
  //     nameAr: "عامل سقالات",
  //     displayOrderKey: 43,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 45,
  //     nameEn: "Timekeeper",
  //     nameAr: "مسجل الوقت",
  //     displayOrderKey: 51,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 46,
  //     nameEn: "Manager Admin & Finance",
  //     nameAr: "مدير الإدارة والمالية",
  //     displayOrderKey: 0,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 47,
  //     nameEn: "Sales",
  //     nameAr: "مندوب مبيعات",
  //     displayOrderKey: 44,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 48,
  //     nameEn: "Personnel Clerk",
  //     nameAr: "كاتب شؤون الموظفين",
  //     displayOrderKey: 45,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 49,
  //     nameEn: "Secretary ",
  //     nameAr: "سكرتير",
  //     displayOrderKey: 46,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 50,
  //     nameEn: "Assistant Site Office",
  //     nameAr: "مساعد مكتب الموقع",
  //     displayOrderKey: 47,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 51,
  //     nameEn: "Purchaser",
  //     nameAr: "مشتري",
  //     displayOrderKey: 48,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 52,
  //     nameEn: "Reception at Site",
  //     nameAr: "استقبال في الموقع",
  //     displayOrderKey: 49,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 53,
  //     nameEn: "HR Manager",
  //     nameAr: "مدير الموارد البشرية",
  //     displayOrderKey: 50,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 54,
  //     nameEn: "Office Boy",
  //     nameAr: "عامل مكتب",
  //     displayOrderKey: 52,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 55,
  //     nameEn: "Haris",
  //     nameAr: "حارس",
  //     displayOrderKey: 56,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 56,
  //     nameEn: "New Forman",
  //     nameAr: "مشرف جديد",
  //     displayOrderKey: 53,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 57,
  //     nameEn: "New Carpenter",
  //     nameAr: "نجار جديد",
  //     displayOrderKey: 54,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 58,
  //     nameEn: "New Steel Fixer",
  //     nameAr: "حداد حديد جديد",
  //     displayOrderKey: 55,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 59,
  //     nameEn: "Darftman",
  //     nameAr: "رسام",
  //     displayOrderKey: 57,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 60,
  //     nameEn: "Managing Director",
  //     nameAr: "المدير الإداري",
  //     displayOrderKey: 0,
  //     isActive: true,

  //     hoursPerDay: 8,
  //   },
  //   {
  //     id: 61,
  //     nameEn: "Terminated or Exit Staff",
  //     nameAr: "موظف منتهي الخدمة",
  //     displayOrderKey: 58,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 62,
  //     nameEn: "Welder",
  //     nameAr: "لحام",
  //     displayOrderKey: 59,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 63,
  //     nameEn: "Gate Keeper",
  //     nameAr: "حارس البوابة",
  //     displayOrderKey: 60,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 64,
  //     nameEn: "Supervisor",
  //     nameAr: "مشرف عام",
  //     displayOrderKey: 61,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 65,
  //     nameEn: "Truck House Driver",
  //     nameAr: "سائق شاحنة",
  //     displayOrderKey: 62,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 66,
  //     nameEn: "Shavel Operator",
  //     nameAr: "مشغل جرافة",
  //     displayOrderKey: 63,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 67,
  //     nameEn: "Private Driver",
  //     nameAr: "سائق خاص",
  //     displayOrderKey: 64,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 68,
  //     nameEn: "Tyre  Operater",
  //     nameAr: "عامل إطارات",
  //     displayOrderKey: 65,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  //   {
  //     id: 69,
  //     nameEn: "Dyana Driver",
  //     nameAr: "سائق ديانا",
  //     displayOrderKey: 66,
  //     isActive: true,

  //     hoursPerDay: 10,
  //   },
  // ];

  // for (const designation of designations) {
  //   console.log(
  //     `  - Seeding designation: ${designation.nameEn} (ID: ${designation.id})`
  //   );
  //   await prisma.designation.upsert({
  //     where: { id: designation.id },
  //     update: designation,
  //     create: designation,
  //   });
  // }
  // console.log(`✅ Seeded ${designations.length} designations`);

  // // Seed Payroll Sections
  // console.log("📝 Seeding Payroll Sections...");
  // const payrollSections = [
  //   {
  //     id: 1,
  //     nameEn: "Office Staff",
  //     nameAr: "موظفو المكتب",
  //     displayOrderKey: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 2,
  //     nameEn: "Formans (Construction)",
  //     nameAr: "مشرفون (بناء)",
  //     displayOrderKey: 2,
  //     isActive: true,
  //   },
  //   {
  //     id: 3,
  //     nameEn: "Saudi Employees",
  //     nameAr: "موظفون سعوديون",
  //     displayOrderKey: 3,
  //     isActive: true,
  //   },
  //   { id: 4, nameEn: "MEP", nameAr: "MEP", displayOrderKey: 4, isActive: true },
  //   {
  //     id: 5,
  //     nameEn: "Personal",
  //     nameAr: "شخصي",
  //     displayOrderKey: 5,
  //     isActive: true,
  //   },
  //   {
  //     id: 6,
  //     nameEn: "Truck House",
  //     nameAr: "شاحنة",
  //     displayOrderKey: 6,
  //     isActive: true,
  //   },
  //   {
  //     id: 7,
  //     nameEn: "Drivers (Construction)",
  //     nameAr: "سائقون (بناء)",
  //     displayOrderKey: 7,
  //     isActive: true,
  //   },
  //   {
  //     id: 8,
  //     nameEn: "Steel Fixers (Construction)",
  //     nameAr: "حدادو حديد (بناء)",
  //     displayOrderKey: 8,
  //     isActive: true,
  //   },
  //   {
  //     id: 9,
  //     nameEn: "Carpenters (Construction)",
  //     nameAr: "نجارون (بناء)",
  //     displayOrderKey: 9,
  //     isActive: true,
  //   },
  //   {
  //     id: 10,
  //     nameEn: "BD, Labour (Construction)",
  //     nameAr: "عمال BD (بناء)",
  //     displayOrderKey: 10,
  //     isActive: true,
  //   },
  //   {
  //     id: 11,
  //     nameEn: "OS, Labour (Construction)",
  //     nameAr: "عمال OS (بناء)",
  //     displayOrderKey: 11,
  //     isActive: true,
  //   },
  //   {
  //     id: 12,
  //     nameEn: "Masons (Construction)",
  //     nameAr: "بناؤون (بناء)",
  //     displayOrderKey: 12,
  //     isActive: true,
  //   },
  //   {
  //     id: 13,
  //     nameEn: "Electrician (Construction)",
  //     nameAr: "كهربائيون (بناء)",
  //     displayOrderKey: 13,
  //     isActive: true,
  //   },
  //   {
  //     id: 15,
  //     nameEn: "OS, Truck House",
  //     nameAr: "شاحنة OS",
  //     displayOrderKey: 15,
  //     isActive: true,
  //   },
  //   {
  //     id: 16,
  //     nameEn: "Scaffolder (Construction)",
  //     nameAr: "عمال سقالات (بناء)",
  //     displayOrderKey: 16,
  //     isActive: true,
  //   },
  //   {
  //     id: 17,
  //     nameEn: "Final Out Labour",
  //     nameAr: "عمال خروج نهائي",
  //     displayOrderKey: 17,
  //     isActive: true,
  //   },
  // ];

  // for (const section of payrollSections) {
  //   console.log(
  //     `  - Seeding payroll section: ${section.nameEn} (ID: ${section.id})`
  //   );
  //   await prisma.payrollSection.upsert({
  //     where: { id: section.id },
  //     update: section,
  //     create: section,
  //   });
  // }
  // console.log(`✅ Seeded ${payrollSections.length} payroll sections`);

  // // Seed Projects
  // console.log("📝 Seeding Projects...");
  // const projects = [
  //   {
  //     id: 12,
  //     nameEn: "Novotel Hotel - Madina",
  //     nameAr: "فندق نوفوتيل - المدينة",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 13,
  //     nameEn: "Retaj Building - Makkah",
  //     nameAr: "مبنى رتاج - مكة",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 14,
  //     nameEn: "Retaj Villas - Makkah",
  //     nameAr: "فلل رتاج - مكة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 16,
  //     nameEn: "Jeddah Rose Hotel",
  //     nameAr: "فندق جدة روز",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 17,
  //     nameEn: "Warehouse - Marikh",
  //     nameAr: "مستودع - المريخ",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 18,
  //     nameEn: "Warehouse - Khumrah",
  //     nameAr: "مستودع - الخمرة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 19,
  //     nameEn: "Suleman Villa - Surface",
  //     nameAr: "فيلا سليمان - السطح",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 20,
  //     nameEn: "Head Office",
  //     nameAr: "المكتب الرئيسي",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 21,
  //     nameEn: "SGH - Rehab (IHCC)",
  //     nameAr: "SGH - رحاب (IHCC)",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 22,
  //     nameEn: "Jeddah Schools",
  //     nameAr: "مدارس جدة",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 23,
  //     nameEn: "Abhur Mall",
  //     nameAr: "مول أبحر",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 24,
  //     nameEn: "KSP Zone-B2, MT",
  //     nameAr: "KSP المنطقة-B2، MT",
  //     branchId: 1,
  //     isActive: false,
  //   },
  //   {
  //     id: 25,
  //     nameEn: "Dr Suliman Habib ",
  //     nameAr: "د. سليمان الحبيب",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 26,
  //     nameEn: "Murjan Parking Jed",
  //     nameAr: "موقف مرجان جدة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 27,
  //     nameEn: "KSP Zone-B1, NT",
  //     nameAr: "KSP المنطقة-B1، NT",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 28,
  //     nameEn: "VUE Project (IHCC)",
  //     nameAr: "مشروع VUE (IHCC)",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 29,
  //     nameEn: "Dr. Dua Villa",
  //     nameAr: "داكتر دعا فيلا",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 30,
  //     nameEn: "Almabani - Sports Club",
  //     nameAr: "المباني - نادي رياضي",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 31,
  //     nameEn: "Private Villa - Abhur",
  //     nameAr: "فيلا خاصة - أبحر",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 32,
  //     nameEn: "The Avenues Mall",
  //     nameAr: "مول الأفنيوز",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 33,
  //     nameEn: "AlKhalidia Residence",
  //     nameAr: "مقر الخالدية",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 34,
  //     nameEn: "Al-Waha Boulevards",
  //     nameAr: "شوارع الواحة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 35,
  //     nameEn: "Al-Omran Residence",
  //     nameAr: "مقر العمران",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 36,
  //     nameEn: "J Tower - برج J مشروع",
  //     nameAr: "برج J",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 37,
  //     nameEn: "Awali Medical Center - MK",
  //     nameAr: "العوالي مركز طبي - مكه مكرمه",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 38,
  //     nameEn: "FCMS - Jeddah",
  //     nameAr: "FCMS - جدة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 39,
  //     nameEn: "DSFMC Obhur - Jeddah",
  //     nameAr: "DSFMC أبحر - جدة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 40,
  //     nameEn: "KSP - HUB-02",
  //     nameAr: "KSP - المحور-02",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 41,
  //     nameEn: "Head Quarter",
  //     nameAr: "المقر الرئيسي",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 42,
  //     nameEn: "Joud Square",
  //     nameAr: "ساحة جود",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 43,
  //     nameEn: "Ambulatory Care",
  //     nameAr: "الرعاية المتنقلة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 44,
  //     nameEn: "Nagro Center",
  //     nameAr: "مركز ناجرو",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 45,
  //     nameEn: "Western Tower",
  //     nameAr: "البرج الغربي",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 46,
  //     nameEn: "Darat Makkah",
  //     nameAr: "دارة مكة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 47,
  //     nameEn: "The Avenues - Tower 01",
  //     nameAr: "الأفنيوز - البرج 01",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 48,
  //     nameEn: "Sari St. Rawdah Dist.",
  //     nameAr: "شارع ساري حي الروضة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 49,
  //     nameEn: "Darah Al Fursan 2",
  //     nameAr: "درة الفرسان 2",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 50,
  //     nameEn: "Basateen Parking Story",
  //     nameAr: "موقف البساتين",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 51,
  //     nameEn: "Card Salaries",
  //     nameAr: "رواتب البطاقات",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 52,
  //     nameEn: "1. Jeddah Cash Salaries",
  //     nameAr: "1. رواتب نقدية جدة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 53,
  //     nameEn: "2. Riyadh Cash Salaries",
  //     nameAr: "2. رواتب نقدية الرياض",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 54,
  //     nameEn: "B Hotel Jeddah",
  //     nameAr: "فندق B جدة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 55,
  //     nameEn: "Admin & Com. Center",
  //     nameAr: "مركز الإدارة والاتصالات",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 56,
  //     nameEn: "Truck House - Al-Barq",
  //     nameAr: "شاحنة - البرق",
  //     branchId: 2,
  //     isActive: true,
  //   },
  //   {
  //     id: 57,
  //     nameEn: "Neom City - Al-Barq",
  //     nameAr: "مدينة نيوم - البرق",
  //     branchId: 2,
  //     isActive: true,
  //   },
  //   {
  //     id: 58,
  //     nameEn: "Warehouse - Harazaat",
  //     nameAr: "مستودع - الحرازات",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 59,
  //     nameEn: "IMC - Obhur",
  //     nameAr: "IMC - أبحر",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 60,
  //     nameEn: "Al-Amoudi Center",
  //     nameAr: "مركز العمودي",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 61,
  //     nameEn: "Villa Ameera Noura",
  //     nameAr: "فيلا أميرة نورة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 62,
  //     nameEn: "Al Sheikh Villas - Basatin",
  //     nameAr: "فلل الشيخ - البساتين",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 63,
  //     nameEn: "Al Waroud Dist.",
  //     nameAr: "حي الورود",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 64,
  //     nameEn: "DSFH - Masar Makkah",
  //     nameAr: "DSFH - مسار مكة",
  //     branchId: 1,
  //     isActive: true,
  //   },
  //   {
  //     id: 65,
  //     nameEn: "DSFMC - Al Zahra",
  //     nameAr: "DSFMC - الزهراء",
  //     branchId: 1,
  //     isActive: true,
  //   },
  // ];

  // for (const project of projects) {
  //   console.log(`  - Seeding project: ${project.nameEn} (ID: ${project.id})`);
  //   await prisma.project.upsert({
  //     where: { id: project.id },
  //     update: project,
  //     create: project,
  //   });
  // }
  // console.log(`✅ Seeded ${projects.length} projects`);

  // Seed Employees from JSON file
  // console.log("📝 Seeding Employees from employee-data.json...");
  // const employeeDataPath = path.join(__dirname, "employee-data.json");
  // const employeeDataRaw = fs.readFileSync(employeeDataPath, "utf-8");
  // const employeeData = JSON.parse(employeeDataRaw);

  // // Convert date strings to Date objects
  // const employees = employeeData.map((emp: any) => ({
  //   ...emp,
  //   dob: emp.dob ? new Date(emp.dob) : null,
  //   contractStartDate: emp.contractStartDate
  //     ? new Date(emp.contractStartDate)
  //     : null,
  //   contractEndDate: emp.contractEndDate ? new Date(emp.contractEndDate) : null,
  //   joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : null,
  //   idCardExpiryDate: emp.idCardExpiryDate
  //     ? new Date(emp.idCardExpiryDate)
  //     : null,
  //   passportExpiryDate: emp.passportExpiryDate
  //     ? new Date(emp.passportExpiryDate)
  //     : null,
  //   lastExitDate: emp.lastExitDate ? new Date(emp.lastExitDate) : null,
  //   lastEntryDate: emp.lastEntryDate ? new Date(emp.lastEntryDate) : null,
  // }));

  // for (const employee of employees) {
  //   console.log(
  //     `  - Seeding employee: ${employee.nameEn} (Code: ${employee.employeeCode}, ID: ${employee.id})`
  //   );
  //   await prisma.employee.upsert({
  //     where: { id: employee.id },
  //     update: employee,
  //     create: employee,
  //   });
  // }
  // console.log(
  //   `✅ Seeded ${employees.length} employees from employee-data.json`
  // );

  // // Seed Employee Loans
  // console.log("\n📝 Seeding Employee Loans...");
  // await seedEmployeeLoans(prisma);

  // // Seed Traffic Challans
  // console.log("\n📝 Seeding Traffic Challans...");
  // await seedTrafficChallans(prisma);

  // Seed Timesheets
  // console.log("\n📝 Seeding Timesheets...");
  // await seedTimesheets(prisma);

  // Seed Payroll Summary
  // console.log("\n📝 Seeding Payroll Summary...");
  // await seedPayrollSummary(prisma);

  // Seed Payroll Details
  // console.log("\n📝 Seeding Payroll Details...");
  // await seedPayrollDetails(prisma);

  // Reset Sequences
  await resetSequences();

  console.log("� Database seed completed successfully!");
}

async function resetSequences() {
  console.log("🔄 Resetting database sequences...");
  const tables = [
    "Loan",
    "Ledger",
    "Employee",
    "User",
    "UserRole",
    "UserPrivilege",
    "Branch",
    "City",
    "Country",
    "GosiCity",
    "Designation",
    "EmployeeStatus",
    "Project",
    "Timesheet",
    "PayrollSection",
    "PayrollStatus",
    "PayrollSummary",
    "PaymentMethod",
    "PayrollDetails",
    "TrafficChallan",
    "ExitReentry",
    "AllowanceNotAvailable",
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), COALESCE((SELECT MAX(id) FROM "${table}"), 0) > 0);
      `);
    } catch (error) {
      // Ignore errors for tables that might not exist or don't have sequences
      // console.warn(`Warning: Could not reset sequence for ${table}`);
    }
  }
  console.log("✅ Sequences reset successfully.");
}

main()
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
