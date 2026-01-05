#!/bin/bash

# QuickPrep - Quick Start Script for Multi-User Website Setup

echo "======================================"
echo "QuickPrep - Website Setup Assistant"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null
then
    echo "❌ npm not found. Please install npm"
    exit 1
fi
echo "✅ npm $(npm -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install additional packages
echo ""
echo "📦 Installing authentication packages..."
npm install mongoose bcryptjs jsonwebtoken

# Create environment file if doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "⚠️  .env.local not found. Creating template..."
    cat > .env.local << 'EOF'
# Google Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# MongoDB (get this from mongodb.com)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quickprep?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOF
    echo "✅ Created .env.local"
    echo "⚠️  Remember to update MONGODB_URI with your MongoDB credentials!"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📖 Next steps:"
echo "1. Get MongoDB: https://mongodb.com"
echo "2. Get Gemini API: https://aistudio.google.com/app/apikey"
echo "3. Update .env.local with your credentials"
echo "4. Run: npm run dev"
echo "5. Visit: http://localhost:3000"
echo ""
echo "📚 Read COMPLETE_WEBSITE_GUIDE.md for detailed instructions"
echo ""
