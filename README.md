# Timesheet Management System

A modern timesheet management application built with Next.js 16, Prisma, Supabase, and NextAuth.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Prisma 7** - Type-safe ORM
- **Supabase** - PostgreSQL database
- **Upstash Redis** - Caching and session management
- **NextAuth.js v5** - Authentication
- **TypeScript** - Type safety

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXT_AUTH_SECRET="generate-with: openssl rand -base64 32"

# Redis
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── lib/
│   ├── auth/        # NextAuth configuration and helpers
│   ├── db/          # Prisma client and services
│   └── redis/       # Upstash Redis client
├── components/      # React components
└── utils/           # Utility functions and helpers
```

## Key Features

- **Role-Based Access Control** - Admin, Manager, Branch Manager, Access-Enabled User
- **User Management** - Create, update, and manage users with granular permissions
- **Session Management** - JWT-based authentication with Redis caching
- **Audit Trail** - Track who created/updated records (`createdBy`, `updatedBy`)

## Database Commands

```bash
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

## Authentication

- Credentials-based login (email/password)
- JWT session strategy
- Active user status validation on every request
- Session invalidation support

## Environment Variables

See `.env.example` for all required variables.
