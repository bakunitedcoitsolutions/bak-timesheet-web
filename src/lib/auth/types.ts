/**
 * NextAuth Type Extensions
 * Extends default NextAuth types with custom user properties
 */

import { DefaultSession } from "next-auth";
import { UserPrivileges } from "@/utils/dummy";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string;
      roleId: number;
      branchId: number | null;
      privileges: UserPrivileges | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    role: string;
    roleId: number;
    branchId: number | null;
    privileges: UserPrivileges | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    roleId: number;
    branchId: number | null;
    privileges: UserPrivileges | null;
  }
}
