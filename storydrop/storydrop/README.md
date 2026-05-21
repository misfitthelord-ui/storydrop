# StoryDrop 🎮

AI-powered interactive story game with subscription monetization.
Built with Next.js, Claude API, Supabase auth, and Stripe payments.

---

## Launch in 4 steps

### Step 1 — Get your API keys

| Service | Where to get it | Cost |
|---|---|---|
| Anthropic API | console.anthropic.com | $5 free credit |
| Stripe | dashboard.stripe.com | Free (2.9% per transaction) |
| Supabase | supabase.com | Free tier |
| Vercel | vercel.com | Free tier |

### Step 2 — Set up Supabase

1. Create a new project at supabase.com
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Authentication → URL Configuration** → add your domain to "Site URL"
4. Copy your Project URL and anon key from **Settings → API**

### Step 3 — Set up Stripe

1. Create a product: **Products → Add product**
   - Name: "StoryDrop Pro"
   - Price: $4.99 / month / recurring
   - Copy the **Price ID** (starts with `price_`)
2. Get your **Publishable key** and **Secret key** from Developers → API keys
3. Set up webhook: **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy the **Webhook signing secret**

### Step 4 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Clone and deploy
cd storydrop
npm install
vercel

# Add environment variables in Vercel dashboard
# or via CLI:
vercel env add ANTHROPIC_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

---

## Project structure

```
storydrop/
├── app/
│   ├── page.js              # Landing page
│   ├── layout.js            # Root layout
│   ├── login/page.js        # Magic link auth
│   ├── play/page.js         # Main game
│   ├── pricing/page.js      # Pricing page
│   └── api/
│       ├── generate-story/  # Claude API calls
│       ├── create-checkout/ # Stripe checkout
│       └── webhook/         # Stripe webhooks
├── lib/
│   ├── supabase.js          # Supabase client
│   └── stripe.js            # Stripe client
├── supabase-schema.sql      # Database setup
└── .env.example             # Environment variables template
```

---

## Economics

| Metric | Free user | Pro user ($4.99/mo) |
|---|---|---|
| Stories/month | 3 | Unlimited |
| API cost (avg 10 stories) | ~$0.03 | ~$0.10 |
| Your revenue | $0 | $4.89 after Stripe fee |
| Margin | — | 98% |

**Break-even**: 0 users (API costs are pay-as-you-go)
**$1K MRR**: ~200 pro subscribers
**$5K MRR**: ~1,000 pro subscribers

---

## Growth ideas

- Add a daily story challenge (viral loop)
- Let users share their story endings on X/TikTok
- Add 8 more genres (romance, western, fantasy, thriller...)
- Weekly leaderboard by story points
- Referral program: invite a friend = 1 free month

---

## Reset free story count monthly

Add a Supabase cron job (or use pg_cron):
```sql
select cron.schedule('reset-stories', '0 0 1 * *',
  'UPDATE public.profiles SET stories_this_month = 0'
);
```
