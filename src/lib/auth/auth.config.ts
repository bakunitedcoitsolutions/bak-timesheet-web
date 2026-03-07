import { NextAuthConfig } from "next-auth";
import { getUserActiveStatus } from "./security";

/**
 * Edge-Compatible NextAuth Configuration
 * Contains only session, callbacks, and cookies. NO Node.js imports (Prisma, bcrypt).
 * Can be safely imported in middleware.ts.
 */
export const authConfig: NextAuthConfig = {
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

      // Check if user is still active on every request (via fast Redis hit)
      if (token.id) {
        const userId = token.id as number;
        const isActive = await getUserActiveStatus(userId);
        if (!isActive) {
          throw new Error("Account is inactive");
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
  debug: process.env.NODE_ENV === "development",
};
