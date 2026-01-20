/**
 * NextAuth Configuration
 * Handles authentication with Supabase and session management
 */

import { compare } from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import { getUserActiveStatus } from "./security";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            userRole: true,
            branch: true,
            privileges: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is inactive");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return entire user object except password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: any;
      user?: any;
      trigger?: "signIn" | "signUp" | "update";
    }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).userRole?.access;
        token.roleId = (user as any).userRoleId;
        token.branchId = (user as any).branchId;
        token.privileges = (user as any).privileges?.privileges || [];
        token.iat = Math.floor(Date.now() / 1000); // Issued at time
      }

      // Check if user is still active on every request
      if (token.id) {
        const userId = token.id as string;

        // Check if user is still active (using Redis cache for performance)
        const isActive = await getUserActiveStatus(userId);
        if (!isActive) {
          // User has been deactivated - force logout
          throw new Error("Account is inactive");
        }
      }

      // Refresh user data on session update (optional)
      if (trigger === "update" && token.id) {
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            userRole: true,
            branch: true,
            privileges: true,
          },
        });

        if (user) {
          token.role = user.userRole.access;
          token.roleId = user.userRoleId;
          token.branchId = user.branchId;
          token.privileges = user.privileges?.privileges || null;
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as number;
        session.user.branchId = token.branchId as number | null;
        session.user.privileges = token.privileges as any;
      }
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
