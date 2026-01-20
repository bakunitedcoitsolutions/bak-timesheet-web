/**
 * NextAuth API Route Handler
 */

import { NextRequest } from "next/server";

import * as authHandlers from "@/lib/auth/auth";

export const GET = (req: NextRequest) => {
  return authHandlers.GET(req);
};

export const POST = (req: NextRequest) => {
  return authHandlers.POST(req);
};
