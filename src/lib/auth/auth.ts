/**
 * NextAuth Setup
 * Exports handlers, auth, signIn, signOut for NextAuth v5 beta
 */

import NextAuth from "next-auth";

import { authOptions } from "./config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);
