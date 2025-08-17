# Cliply MVP

A marketplace connecting brands and creators with trackable, fair payouts.

## Phase 1: Infrastructure & Database Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (local installation or Atlas account)
- Vercel account (optional for local dev)
- Stripe account (optional for local dev)

### Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables:
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cliply
MONGODB_DB=cliply

# YouTube API (for verification)
YOUTUBE_API_KEY=your_youtube_api_key

# Stripe (optional for local dev)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Sentry (optional for local dev)
SENTRY_DSN=your_sentry_dsn

# Vercel
VERCEL_ANALYTICS=1
VERCEL_CRON_SECRET=your_cron_secret
```

### MongoDB Setup
1. **Local MongoDB Installation:**
   ```bash
   # macOS
   brew install mongodb-community
   brew services start mongodb-community
   
   # Windows/Linux
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Or use MongoDB Atlas (Cloud):**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   # You should see the MongoDB shell
   ```

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed setup instructions.

### Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (legal)/          # Legal pages
│   ├── admin/            # Admin dashboard
│   ├── api/              # API routes
│   ├── auth/             # Authentication
│   ├── brand/            # Brand dashboard
│   ├── creator/          # Creator dashboard
│   └── onboarding/       # User onboarding
├── components/            # Reusable components
│   ├── app/              # App shell components
│   ├── providers/        # Context providers
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities and configurations
    ├── mongodb/          # MongoDB connection and schemas
    └── validators.ts     # Zod schemas
```

### Dark Mode System
Cliply includes a comprehensive dark/light mode system:
- **Theme Toggle**: Available on all pages (top right)
- **System Detection**: Automatically follows OS preference
- **Persistent**: Theme choice saved across sessions
- **Accessible**: WCAG compliant color contrasts
- **Brand Colors**: Custom color palette optimized for both themes

See [DARK_MODE_DESIGN_GUIDE.md](./DARK_MODE_DESIGN_GUIDE.md) for detailed implementation guidelines.
See [BRAND_COLORS.md](./BRAND_COLORS.md) for the complete color palette reference.

### Database Schema
- **profiles**: User profiles with roles (creator/brand/admin)
- **brands**: Brand organizations
- **campaigns**: Marketing campaigns with caption codes
- **submissions**: Creator submissions to campaigns
- **snapshots**: Metrics tracking over time
- **payouts**: Payment calculations and status
- **webhooks**: External service webhooks
- **audit_logs**: Admin action logging

### Row Level Security (RLS)
- Users can only access their own data
- Brands can manage their campaigns and view submissions
- Creators can manage their submissions
- Admins have full access
- Public campaigns are readable by all

### Next Steps
After Phase 1 is complete:
1. Test database connections and RLS policies
2. Verify environment variables are working
3. Test basic API endpoints
4. Move to Phase 2: Auth & Onboarding
