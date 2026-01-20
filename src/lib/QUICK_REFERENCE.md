# Quick Reference Guide

## Common Operations

### Authentication

```typescript
// Server Component
import { getSession, getCurrentUser, hasRole, hasPermission } from "@/lib/auth";

const session = await getSession();
const user = await getCurrentUser();
const isAdmin = await hasRole("Admin");
const canEdit = await hasPermission("employees", "edit");
```

```typescript
// Client Component
import { useSession, signIn, signOut } from "next-auth/react";

const { data: session, status } = useSession();
await signIn("credentials", { email, password });
await signOut();
```

### Database Operations

```typescript
import { prisma } from "@/lib/db";
import { userService } from "@/lib/db/services";

// Direct Prisma (for simple queries)
const users = await prisma.user.findMany({
  include: { userRole: true },
});

// Service Layer (for business logic)
const user = await userService.create({ ... });
const user = await userService.findById(id);
await userService.update(id, { ... });
const { users, pagination } = await userService.list({ page: 1, limit: 10 });
```

### Caching

```typescript
import { cache } from "@/lib/redis";

// Set cache (with 1 hour expiration)
await cache.set("user:123", userData, 3600);

// Get cache
const userData = await cache.get<User>("user:123");

// Delete cache
await cache.delete("user:123");

// Check existence
const exists = await cache.exists("user:123");
```

### Password Hashing

```typescript
import { hash, compare } from "bcryptjs";

// Hash password
const hashedPassword = await hash("password123", 12);

// Compare password
const isValid = await compare("password123", hashedPassword);
```

## File Structure

```
src/lib/
├── auth/           # Authentication & authorization
├── db/             # Database (Prisma)
│   └── services/   # Business logic services
├── redis/          # Caching (Upstash)
└── index.ts        # Main exports
```

## Environment Variables

```env
DATABASE_URL=...
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Common Patterns

### Protected API Route

```typescript
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Your logic here
  return NextResponse.json({ data: "..." });
}
```

### Protected Page (Server Component)

```typescript
import { getSession, redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Protected Content</div>;
}
```

### Protected Page (Client Component)

```typescript
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  if (status === "loading") return <div>Loading...</div>;
  if (!session) return null;
  
  return <div>Protected Content</div>;
}
```

### Transaction Example

```typescript
import { prisma } from "@/lib/db";

const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: {...} });
  await tx.userProject.createMany({ data: [...] });
  return user;
});
```

## TypeScript Types

```typescript
// User from session
import type { Session } from "next-auth";
const user = session.user; // Has id, role, roleId, branchId, privileges

// Prisma types
import type { User, Employee, Project } from "@prisma/client";

// Custom types
import type { UserPrivileges } from "@/utils/dummy";
```
