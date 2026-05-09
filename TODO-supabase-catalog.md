# Supabase catalog cleanup (deferred)

Production is currently bypassing Supabase via env var
`STREAMWISE_USE_DEFAULT_CATALOG=1` on Vercel. Until that var is removed:

- `/admin/pricing` saves to Supabase but has NO effect on the live site.
- The repo's `app/streamwise-data.ts` is the source of truth for prices.

## To restore Supabase as the source of truth

The Supabase `catalog_snapshots.options` JSON needs these two rows updated:

1. `prime_membership_video`
   - monthly: 8.99
   - effectiveMonthly: 0
   - name: "Prime Video included with Amazon Prime"
   - sourceUrl: "https://www.amazon.com/amazonprime"
   - requires: ["amazon_prime"]
   - includedWith: "amazon_prime"
   - mutuallyExclusiveGroup: "prime_video_access"

2. `apple_one_individual`
   - monthly: 12.99
   - effectiveMonthly: 0
   - name: "Apple TV+ included with Apple One"
   - sourceUrl: "https://www.apple.com/apple-one/"
   - requires: ["apple_one"]
   - includedWith: "apple_one"
   - mutuallyExclusiveGroup: "apple_tv_access"

After Supabase is updated:
1. Verify on a Vercel Preview deployment that has `STREAMWISE_USE_DEFAULT_CATALOG`
   unset (so it reads Supabase).
2. Remove `STREAMWISE_USE_DEFAULT_CATALOG` from Production env vars.
3. Redeploy.
4. Re-test the four-checkbox scenarios on production.
