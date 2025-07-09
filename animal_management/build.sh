#!/bin/bash
# build.sh - Render build script

set -e

echo "🚀 Starting Render build process..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate

# Create cache table (with fallback)
echo "💾 Creating cache table..."
python manage.py createcachetable 2>/dev/null || echo "⚠️ Cache table creation failed, continuing..."

# Auto-setup production (import data + create admin)
echo "🔧 Setting up production..."
python manage.py auto_setup_production

echo "✅ Build complete!"