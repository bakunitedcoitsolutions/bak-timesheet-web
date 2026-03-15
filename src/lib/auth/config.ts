/**
 * NextAuth Configuration (Node.js Only)
 * Contains the Credentials provider which relies on Prisma and bcrypt
 * This file CANNOT be used in Edge runtimes like middleware.ts
 */

import { compare } from "bcryptjs";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import {
  getUserActiveStatus,
  isSessionInvalid,
  clearSessionInvalidation,
} from "./security";

/**
 * Edge-Compatible NextAuth Configuration
 * Contains only session, callbacks, and cookies. NO Node.js imports (Prisma, bcrypt).
 * Can be safely imported in middleware.ts.
 */
const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in config.ts
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.nameEn;
        token.role = user.userRole?.access;
        token.roleId = user.userRoleId;
        token.branchId = user.branchId;
        token.privileges = user.privileges?.privileges || [];
        token.iat = Math.floor(Date.now() / 1000);
      }

      // Check if user is still active or session is invalidated on every request
      if (token.id) {
        const userId = token.id as number;

        // Check active status
        const isActive = await getUserActiveStatus(userId);
        if (!isActive) {
          throw new Error("Account is inactive");
        }

        // Check if session has been invalidated (e.g., password change)
        const isInvalid = await isSessionInvalid(userId);
        if (isInvalid) {
          throw new Error("Session invalidated");
        }
      }

      // Refresh data handling is moved to the Node.js boundary where Prisma is available
      // The edge runtime can't run Prisma.

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as number;
        session.user.branchId = token.branchId as number | null;
        session.user.privileges = token.privileges as any;
      }
      return session;
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
  debug: false,
};

export const authOptions: NextAuthConfig = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      // name: "Credentials",
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

        // Clear session invalidation on successful login
        await clearSessionInvalidation(user.id);

        // Return entire user object except password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as any;
      },
    }),
  ],
};
