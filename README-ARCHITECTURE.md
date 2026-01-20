# Architecture Documentation

## Stack Overview

This application uses a modern, scalable architecture with the following technologies:

- **Next.js 16** - React framework with App Router
- **Prisma** - Type-safe ORM for database operations
- **Supabase** - PostgreSQL database hosting
- **Upstash Redis** - Redis caching and session storage
- **NextAuth.js** - Authentication and session management
- **TypeScript** - Type-safe development

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API route
│   └── (admin)/                       # Protected admin routes
│
├── lib/
│   ├── auth/
│   │   ├── config.ts                 # NextAuth configuration
│   │   ├── helpers.ts                # Auth helper functions
│   │   ├── types.ts                  # TypeScript type extensions
│   │   └── index.ts
│   ├── db/
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── services/
│   │   │   ├── user.service.ts       # User business logic
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── redis/
│   │   ├── upstash.ts                # Upstash Redis client
│   │   └── index.ts
│   └── index.ts
│
├── middleware.ts                      # Next.js middleware for auth
│
prisma/
└── schema.prisma                      # Prisma database schema
```

## Database Architecture (Prisma + Supabase)

### Setup Instructions

1. **Install Prisma CLI** (if not already installed):
   ```bash
   npm install -D prisma
   npm install @prisma/client
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your Supabase database URL:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Run migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Open Prisma Studio** (optional):
   ```bash
   npx prisma studio
   ```

### Key Models

- **User** - User accounts with roles and permissions
- **UserRole** - Role definitions (Admin, Manager, etc.)
- **UserPrivilege** - Custom permissions for "User with Privileges" role
- **Branch** - Branch locations
- **Employee** - Employee records
- **Project** - Project management
- **Timesheet** - Time tracking entries
- **Payroll** - Payroll records
- **Loan** - Employee loans
- **TrafficChallan** - Traffic violation records
- **ExitReentry** - Exit and re-entry tracking
- **Ledger** - Financial ledger entries

## Authentication (NextAuth.js)

### Configuration

NextAuth is configured in `src/lib/auth/config.ts` with:
- **Credentials Provider** - Email/password authentication
- **JWT Strategy** - Stateless session management
- **Prisma Adapter** - Database session storage
- **Custom Callbacks** - Role and privilege injection

### Usage

**Server-side:**
```typescript
import { getSession, getCurrentUser, hasRole, hasPermission } from "@/lib/auth";

// Get current session
const session = await getSession();

// Get current user
const user = await getCurrentUser();

// Check role
const isAdmin = await hasRole("Admin");

// Check permission
const canEdit = await hasPermission("employees", "edit");
```

**Client-side:**
```typescript
import { useSession } from "next-auth/react";

const { data: session, status } = useSession();
```

### Protected Routes

Routes are protected via `middleware.ts`. The middleware:
- Checks authentication for all routes except public ones
- Enforces role-based access control
- Redirects unauthorized users

## Caching (Upstash Redis)

### Setup

1. **Create Upstash Redis instance** at https://upstash.com
2. **Add environment variables**:
   ```
   UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   ```

### Usage

```typescript
import { cache } from "@/lib/redis";

// Set cache
await cache.set("key", value, 3600); // 1 hour expiration

// Get cache
const value = await cache.get<string>("key");

// Delete cache
await cache.delete("key");

// Check existence
const exists = await cache.exists("key");
```

### Use Cases

- Session caching
- API response caching
- Rate limiting
- Temporary data storage

## Service Layer Pattern

Business logic is separated into service files:

```typescript
import { userService } from "@/lib/db/services";

// Create user
const user = await userService.create({
  nameEn: "John Doe",
  email: "john@example.com",
  password: "password123",
  userRoleId: 1,
  // ...
});

// Find user
const user = await userService.findById(userId);

// Update user
await userService.update(userId, { nameEn: "Jane Doe" });

// List users with pagination
const { users, pagination } = await userService.list({
  page: 1,
  limit: 10,
  search: "john",
});
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - Supabase PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Secret key for JWT signing (generate with `openssl rand -base64 32`)
- `UPSTASH_REDIS_REST_URL` - Upstash Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token
- `NODE_ENV` - Environment (development/production)

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Set up database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Best Practices

1. **Always use Prisma Client** from `@/lib/db/prisma` (singleton pattern)
2. **Use service layer** for business logic, not direct Prisma calls in components
3. **Cache expensive operations** using Upstash Redis
4. **Use TypeScript types** from Prisma for type safety
5. **Handle errors gracefully** in service functions
6. **Use transactions** for multi-step operations
7. **Validate input** using Zod schemas before database operations

## Security Considerations

- Passwords are hashed using bcryptjs (12 rounds)
- JWT tokens are signed with a secret key
- Database queries use parameterized statements (Prisma handles this)
- Session data is stored securely
- Role-based access control enforced at middleware level

## Next Steps

1. Install required npm packages (see package.json updates needed)
2. Set up Supabase project and get DATABASE_URL
3. Create Upstash Redis instance
4. Run Prisma migrations
5. Update login page to use NextAuth
6. Add more service files as needed (employee.service.ts, etc.)
