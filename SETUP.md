# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for PostgreSQL database)
- Upstash account (for Redis)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- NextAuth.js
- Prisma
- Upstash Redis
- bcryptjs
- And all other dependencies

### 2. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **Settings** → **Database**
4. Copy the **Connection string** (URI format)
5. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. Set Up Upstash Redis

1. Go to [Upstash](https://upstash.com) and create an account
2. Create a new Redis database
3. Copy the **REST URL** and **REST Token**
4. These will be used in your `.env` file

### 4. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:

   ```env
   # Database Configuration (Supabase PostgreSQL)
   DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-random-secret-key-here"

   # Upstash Redis Configuration
   UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token-here"

   # Application Environment
   NODE_ENV="development"
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and use it as your `NEXTAUTH_SECRET`

### 5. Set Up Prisma Database

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push schema to database** (creates tables):
   ```bash
   npm run db:push
   ```

   Or use migrations (recommended for production):
   ```bash
   npm run db:migrate
   ```

3. **Verify database** (optional):
   ```bash
   npm run db:studio
   ```
   This opens Prisma Studio where you can view and edit your database.

### 6. Create Initial Data (Optional)

You may want to create seed data for:
- User Roles (Admin, Manager, etc.)
- Default Admin User
- Other initial setup data

Create a `prisma/seed.ts` file and run:
```bash
npm run db:seed
```

### 7. Run Development Server

```bash
npm run dev
```

Your application should now be running at `http://localhost:3000`

## Verification Checklist

- [ ] Dependencies installed
- [ ] `.env` file created with all required variables
- [ ] Supabase database connected
- [ ] Upstash Redis configured
- [ ] Prisma schema pushed to database
- [ ] Development server running
- [ ] Can access `/login` page
- [ ] Database tables created (check with Prisma Studio)

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check if your Supabase project is active
- Ensure your IP is allowed in Supabase (if using IP restrictions)
- Try using the connection pooler URL if direct connection fails

### NextAuth Issues

- Ensure `NEXTAUTH_SECRET` is set and not empty
- Verify `NEXTAUTH_URL` matches your application URL
- Check that Prisma adapter tables (Account, Session, User) exist

### Redis Connection Issues

- Verify Upstash credentials are correct
- Check if your Upstash database is active
- Ensure network connectivity to Upstash

### Prisma Issues

- Run `npm run db:generate` after schema changes
- Clear `.next` folder and restart dev server
- Check Prisma version compatibility

## Next Steps

1. **Create your first admin user** (via Prisma Studio or seed script)
2. **Test authentication** by logging in
3. **Set up production environment** variables
4. **Configure production database** (use connection pooler for Supabase)
5. **Set up CI/CD** if needed

## Production Deployment

For production:

1. Use Supabase **Connection Pooler** URL (better for serverless)
2. Set `NODE_ENV=production`
3. Use a strong `NEXTAUTH_SECRET` (different from development)
4. Update `NEXTAUTH_URL` to your production domain
5. Run migrations: `npm run db:migrate`
6. Build: `npm run build`
7. Start: `npm start`

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Supabase Documentation](https://supabase.com/docs)
