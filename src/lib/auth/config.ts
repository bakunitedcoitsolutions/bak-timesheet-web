/**
 * NextAuth Configuration
 * Handles authentication with Supabase and session management
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import {
  recordFailedLoginAttempt,
  clearFailedLoginAttempts,
  isAccountLocked,
  isSessionInvalidated,
  getUserActiveStatus,
  updateUserActiveStatusCache,
} from "./security";

export const authOptions: NextAuthOptions = {
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

        // Check if account is locked due to failed attempts
        const locked = await isAccountLocked(credentials.email);
        if (locked) {
          throw new Error(
            "Account temporarily locked due to multiple failed login attempts. Please try again later."
          );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            userRole: true,
            branch: true,
            privileges: true,
          },
        });

        if (!user || !user.password) {
          // Record failed attempt
          await recordFailedLoginAttempt(credentials.email);
          throw new Error("Invalid email or password");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is inactive");
        }

        // Verify password
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Record failed attempt
          await recordFailedLoginAttempt(credentials.email);
          throw new Error("Invalid email or password");
        }

        // Clear failed login attempts on successful login
        await clearFailedLoginAttempts(credentials.email);

        // Return user object (will be available in session)
        return {
          id: user.id,
          email: user.email,
          name: user.nameEn,
          image: user.image,
          role: user.userRole.access,
          roleId: user.userRoleId,
          branchId: user.branchId,
          privileges: user.privileges?.privileges || null,
        };
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
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.branchId = user.branchId;
        token.privileges = user.privileges;
        token.iat = Math.floor(Date.now() / 1000); // Issued at time
      }

      // Check if session is invalidated (e.g., user deactivated)
      if (token.id) {
        const userId = token.id as string;
        
        // Check session invalidation
        const invalidated = await isSessionInvalidated(userId);
        if (invalidated) {
          // Force logout by throwing error
          throw new Error("Session invalidated");
        }
        
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
    async session({ session, token }) {
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
