"use server";
import { prisma } from "@/lib/db/prisma";
import { serverAction } from "@/lib/zsa/zsa-action";
import { z } from "zod";

export const getGlobalDataAction = serverAction
  .input(z.object({}).optional())
  .handler(async () => {
    const [
      designations,
      employees,
      projects,
      payrollSections,
      payrollStatuses,
      userRoles,
      userPrivileges,
      branches,
      cities,
      countries,
      gosiCities,
      employeeStatuses,
      paymentMethods,
    ] = await Promise.all([
      prisma.designation.findMany({
        select: { id: true, nameEn: true, hoursPerDay: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.employee.findMany({
        select: {
          id: true,
          employeeCode: true,
          nameEn: true,
          designationId: true,
        },
        where: { statusId: 1 }, // Assuming 1 is Active
        orderBy: { employeeCode: "asc" },
      }),
      prisma.project.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.payrollSection.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.payrollStatus.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      }),
      // Additional entities
      prisma.userRole.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      }),
      prisma.userPrivilege.findMany({
        select: { id: true, userId: true, privileges: true },
        // UserPrivilege doesn't have isActive or nameEn usually
      }),
      prisma.branch.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.city.findMany({
        select: { id: true, nameEn: true, countryId: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.country.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.gosiCity.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { nameEn: "asc" },
      }),
      prisma.employeeStatus.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      }),
      prisma.paymentMethod.findMany({
        select: { id: true, nameEn: true },
        where: { isActive: true },
        orderBy: { id: "asc" },
      }),
    ]);

    return {
      designations,
      employees,
      projects,
      payrollSections,
      payrollStatuses,
      userRoles,
      userPrivileges,
      branches,
      cities,
      countries,
      gosiCities,
      employeeStatuses,
      paymentMethods,
    };
  });
