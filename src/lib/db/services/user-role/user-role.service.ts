/**
 * User Role Service
 * Business logic for user role operations
 */

import { prisma } from "@/lib/db/prisma";

export interface UserRoleInterface {
  id: number;
  nameEn: string;
  nameAr: string | null;
  access: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * List all active user roles
 */
export const listUserRoles = async (): Promise<UserRoleInterface[]> => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return userRoles;
};
