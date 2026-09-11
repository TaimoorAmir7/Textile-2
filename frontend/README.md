# Spark Production Reliability

Textile production-quality reliability demo (C3-style Discover → Deploy → Operate → Optimize). The textile vertical follows Woven and Knit / Hosiery lots through six fabrication stages. Visuals follow the Stitch **Industrial Precision** system. Oil & Gas, Power Generation, and Manufacturing appear on Discover as catalog cards only — they do not open.

## Stack

- **Next.js 15** (App Router) UI
- Hardcoded mill catalog in `src/lib/mill-data.ts` — no database and no HTTP API
- Deploy / Acknowledge / Cases stay in the browser session only

## Local

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/discover`).

## Railway / Vercel

Set the service **Root Directory** to `frontend`. No `DATABASE_URL` or Prisma step is required.

## Working path

Discover (Textiles **View catalog**) → Woven or Knit / Hosiery → stage → stage alert → global alert investigation (Acknowledge / Snooze / Create quality case) → Cases → Optimize (CSV).
