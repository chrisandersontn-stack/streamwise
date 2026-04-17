# Deploy StreamWise to Vercel

## 1) Push this repo to GitHub

Vercel deploys easiest from a GitHub repository.

## 2) Import project in Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**
3. Import your GitHub repo.
4. Framework preset should auto-detect **Next.js**.

## 3) Set environment variables in Vercel

In the Vercel project → **Settings** → **Environment Variables**, add the same keys you use locally:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_AUTH_REDIRECT_URL` (set to your production URL, e.g. `https://your-domain.com`)
- `CATALOG_ADMIN_TOKEN`
- Optional analytics:
  - `POSTHOG_API_KEY`
  - `POSTHOG_HOST`

## 4) Deploy

Click **Deploy**.

## 5) Post-deploy checklist

- Confirm `/` loads.
- Confirm `/api/catalog` returns JSON.
- Send a magic link and confirm redirect URL matches production.
