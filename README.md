# Expense Splitter

A collaborative expense tracking and splitting application for groups.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Payments:** Polar.sh
- **Deployment:** Vercel

## Local Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_PRODUCT_PRO_MONTHLY_ID=your_product_id
POLAR_PRODUCT_PRO_ANNUAL_ID=your_product_id
POLAR_PRODUCT_BUSINESS_MONTHLY_ID=your_product_id
POLAR_PRODUCT_BUSINESS_ANNUAL_ID=your_product_id
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

Deploy via [Vercel](https://vercel.com). Environment variables must be configured in Vercel dashboard.

## License

MIT
