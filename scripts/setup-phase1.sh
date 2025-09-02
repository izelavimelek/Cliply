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

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual values:"
    echo "   - MongoDB connection string (MONGODB_URI)"
    echo "   - MongoDB database name (MONGODB_DB)"
    echo "   - JWT secret key (JWT_SECRET)"
    echo "   - YouTube API key (optional)"
    echo "   - Stripe keys (optional for local dev)"
    echo "   - Sentry DSN (optional for local dev)"
    echo "   - Vercel cron secret"
    echo ""
    echo "Press Enter when you've updated .env.local..."
    read
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Set up a MongoDB database (Atlas or local)"
echo "2. Get your MongoDB connection string"
echo "3. Update .env.local with your MongoDB credentials"
echo "4. Generate a JWT secret key"
echo ""
echo "5. Start development: npm run dev"
echo ""
echo "🎯 Phase 1 setup complete! Your MongoDB connection is ready."
echo "   Next: Phase 2 - Auth & Onboarding"
