#!/bin/bash

# ChiSnow Development Environment Setup Script
# This script sets up and runs the ChiSnow development environment

set -e  # Exit on any error

echo "======================================"
echo "ChiSnow - Snowfall Mapping Application"
echo "Initializing Development Environment"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18+ is required"
    echo "Current version: $(node -v)"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Check for package manager
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
    INSTALL_CMD="pnpm install"
    RUN_CMD="pnpm run dev"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
    INSTALL_CMD="npm install"
    RUN_CMD="npm run dev"
else
    echo "❌ Error: No package manager found (npm or pnpm)"
    exit 1
fi

echo "✓ Using $PKG_MANAGER as package manager"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "Creating .env.local from template..."
    echo ""

    cat > .env.local << EOF
# Mapbox API Token
# Get your free token at: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
EOF

    echo "✓ Created .env.local file"
    echo ""
    echo "⚠️  IMPORTANT: You need to add your Mapbox API token to .env.local"
    echo "   1. Go to https://account.mapbox.com/access-tokens/"
    echo "   2. Create a new token or copy your default token"
    echo "   3. Replace 'your_mapbox_token_here' in .env.local with your token"
    echo ""
    read -p "Press Enter after you've added your Mapbox token to continue..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    $INSTALL_CMD
    echo ""
    echo "✓ Dependencies installed successfully"
    echo ""
else
    echo "✓ Dependencies already installed"
    echo ""
fi

# Start development server
echo "======================================"
echo "Starting Development Server"
echo "======================================"
echo ""
echo "The application will be available at:"
echo ""
echo "  Local:   http://localhost:3000"
echo "  Network: http://$(ipconfig getifaddr en0 2>/dev/null || echo "your-ip"):3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "======================================"
echo ""

$RUN_CMD
