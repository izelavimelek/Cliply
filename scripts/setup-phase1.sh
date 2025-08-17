#!/bin/bash

echo "🚀 Setting up Cliply MVP Phase 1: Infrastructure & Database"

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values:"
    echo "   - Supabase URL and keys"
    echo "   - YouTube API key"
    echo "   - Stripe keys (optional for local dev)"
    echo "   - Sentry DSN (optional for local dev)"
    echo "   - Vercel cron secret"
    echo ""
    echo "Press Enter when you've updated .env.local..."
    read
else
    echo "✅ .env.local already exists"
fi

# Initialize Supabase (if not already done)
if [ ! -f supabase/config.toml ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
else
    echo "✅ Supabase already initialized"
fi

echo ""
echo "📋 Next steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Get your project URL and keys from Settings > API"
echo "3. Update .env.local with your Supabase credentials"
echo "4. Run: supabase link --project-ref YOUR_PROJECT_REF"
echo "5. Run: supabase db push"
echo "6. Run: supabase db seed"
echo ""
echo "7. Start development: npm run dev"
echo ""
echo "🎯 Phase 1 setup complete! Your database schema and RLS policies are ready."
echo "   Next: Phase 2 - Auth & Onboarding"
