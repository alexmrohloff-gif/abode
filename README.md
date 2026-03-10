# Abode

Abode is a property tech platform whose first wedge is automated rent-splitting and collection for flatmates, powered by Open Banking.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **PostgreSQL** (Supabase on production).

---

## Environment variables

Set these in your local `.env` and in **Vercel** (Project → Settings → Environment Variables). For **Supabase**, use the connection string from Project Settings → Database.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string. **Supabase**: use the **Connection pooling** URI (port `6543`) for serverless. Example: `postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `AUTH_SECRET` | Yes | Secret for Auth.js (next-auth) session encryption. Generate with `npx auth secret` and set the same value in Vercel. |
| `GOOGLE_CLIENT_ID` | If using Google sign-in | OAuth client ID from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | If using Google sign-in | OAuth client secret. |
| `NEXTAUTH_URL` | Production | Full URL of your app (e.g. `https://your-app.vercel.app`). Auth.js can infer from `VERCEL_URL`; set explicitly if you use a custom domain. |
| `PAYMENT_PROVIDER` | No | `mock` (default) or `production` for `lib/payments/paymentService`. |
| `OPEN_BANKING_*` | Future | Placeholders for Open Banking; set when integrating a provider. |

### Local setup

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL (local Postgres or Supabase), AUTH_SECRET (npx auth secret)
```

### Vercel + Supabase

1. In **Supabase**: create a project, then **Project Settings → Database**.
2. Copy the **Connection string** (URI). Use the **Session mode** pooler (port `6543`) for serverless.
3. Replace `[YOUR-PASSWORD]` with your database password.
4. In **Vercel**: Project → **Settings → Environment Variables**. Add:
   - `DATABASE_URL` = your Supabase connection string (all environments).
   - `AUTH_SECRET` = output of `npx auth secret` (all environments).
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` if using Google (all environments).
5. Redeploy so the new variables are applied.

---

## Getting started (local)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set at least `DATABASE_URL` and `AUTH_SECRET` (see table above).

3. **Database (Supabase or local Postgres)**

   ```bash
   npm run prisma:migrate
   ```

   This applies migrations and runs `prisma generate`. On Vercel, `prisma generate` runs in `postinstall` and `build`.

4. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push the repo to **GitHub** and connect it to **Vercel** (Import Project).
2. Add the environment variables above in Vercel (Production, Preview, Development as needed).
3. Vercel will run `npm run build` (which runs `prisma generate && next build`). Ensure migrations have been applied to your Supabase database (run `prisma migrate deploy` once from your machine or from a CI step).
4. Optional: in **Supabase → Database → Extensions**, enable `pg_crypto` if you use UUID or encryption.

Ensure `package-lock.json` is committed so the GitHub Actions workflow can run `npm ci`.

For **first-time DB setup in production**, run migrations against the Supabase URL once:

```bash
DATABASE_URL="your-supabase-connection-string" npx prisma migrate deploy
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server. |
| `npm run build` | Generate Prisma client and build Next.js (used by Vercel). |
| `npm run start` | Start production server. |
| `npm run lint` | Run ESLint. |
| `npm run prisma:migrate` | Apply migrations (dev). |
| `npm run prisma:generate` | Generate Prisma client. |
| `npm run prisma:studio` | Open Prisma Studio. |

---

## Tech stack & architecture

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **Prisma** + **PostgreSQL** (Supabase in production)
- **Auth.js (next-auth v5)** for Google OAuth and credentials
- Clean architecture: `app/` (UI), `src/application/` (use-cases), `src/domain/` (entities, interfaces), `src/infrastructure/` (Prisma, payment providers)

See the rest of the repo for directory layout and clean-architecture rules.
