#!/bin/bash

# Setup Supabase Database Schema and RLS Policies
# This script provides instructions for setting up the database

echo "🚀 MoovyZoo Database Setup"
echo ""

# Check if Docker is running (required for local Supabase)
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. You have two options:"
    echo ""
    echo "🐳 Option 1: Local Development with Docker"
    echo "1. Install and start Docker Desktop"
    echo "2. Install Supabase CLI: npm install -g supabase"
    echo "3. Run this script again"
    echo ""
    echo "☁️  Option 2: Use Supabase Cloud (Recommended for quick start)"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Copy the SQL from supabase/migrations/001_create_profiles_table.sql"
    echo "3. Run it in your Supabase project's SQL Editor"
    echo "4. Update your .env file with your project credentials"
    echo ""
    echo "📄 The migration file is ready at: supabase/migrations/001_create_profiles_table.sql"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "🔧 Initializing Supabase project..."
    supabase init
fi

# Start local Supabase (if not already running)
echo "🔄 Starting local Supabase..."
supabase start

# Apply database migrations
echo "📊 Applying database migrations..."
supabase db reset

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'supabase status' to see your local database credentials"
echo "2. Update your .env file with the local Supabase credentials"
echo "3. Test the setup by running the application"
echo ""
echo "🔗 Local Supabase Studio: http://localhost:54323"