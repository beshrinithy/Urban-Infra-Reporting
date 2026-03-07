#!/bin/bash

# Urban Infrastructure Reporting System - Deployment Script

echo "🚀 Urban Infrastructure Reporting System - Deployment"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: Urban Infrastructure Reporting System setup"

echo ""
echo "✅ Repository is ready for GitHub deployment!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Add remote origin:"
echo "   git remote add origin <your-github-repo-url>"
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "4. Deploy to Vercel:"
echo "   - Import repository in Vercel dashboard"
echo "   - Configure environment variables"
echo "   - Deploy both frontend and backend"
echo ""
echo "🎉 Ready to deploy!"
