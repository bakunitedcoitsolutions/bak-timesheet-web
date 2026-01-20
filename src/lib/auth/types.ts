/**
 * NextAuth Type Extensions
 * Extends default NextAuth types with custom user properties
 */

import { DefaultSession } from "next-auth";
import { UserPrivileges } from "@/utils/dummy";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roleId: number;
      branchId: number | null;
      privileges: UserPrivileges | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    roleId: number;
    branchId: number | null;
    privileges: UserPrivileges | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    roleId: number;
    branchId: number | null;
    privileges: UserPrivileges | null;
  }
}
