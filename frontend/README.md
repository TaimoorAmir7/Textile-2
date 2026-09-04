# Spark Reliability

Textile asset reliability demo (C3-style Discover → Deploy → Operate → Optimize). Visuals follow the Stitch **Industrial Precision** system. Oil & Gas, Power Generation, and Manufacturing appear on Discover as catalog cards only — they do not open.

## Stack

- **Next.js 15** (App Router) UI + Route Handlers
- **Prisma** + **SQLite** locally; **Neon Postgres** on Vercel for shared persistence
- One Vercel project; set `DATABASE_URL` to Neon after switching the Prisma provider to `postgresql` (see below)

## Local

```bash
cd frontend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/discover`).

Optional: `docker compose up -d` with `provider = "postgresql"` if you prefer Postgres locally.

## Vercel

SQLite will not persist on Vercel’s serverless filesystem. For the demo to share Deploy / Acknowledge / Cases across visitors:

1. Create a [Neon](https://neon.tech) project and copy the pooled connection string.
2. In `prisma/schema.prisma`, set `provider = "postgresql"`.
3. In Vercel, import this repo, **Root Directory** `frontend`.
4. Set `DATABASE_URL` to the Neon URL (`sslmode=require`).
5. Deploy. Empty databases are auto-seeded on first API request.

## Working path

Discover (Textiles **View catalog**) → family → template → **Deploy this template** → Operate dashboard → alert investigation (Acknowledge / Snooze / Create case) → Cases → Optimize (CSV).
