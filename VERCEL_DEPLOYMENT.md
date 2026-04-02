# Step-by-Step Vercel Deployment Guide (First Time)

Welcome! This guide will walk you through deploying the Business Card Scanner to Vercel in about 10 minutes. Don't worry if you've never done this before - we'll go through each step carefully.

## Prerequisites (What You Need)

1. A **GitHub account** (free at https://github.com/signup)
2. A **Vercel account** (free at https://vercel.com/signup)
3. An **Anthropic API key** (free tier available at https://console.anthropic.com/api/keys)
4. A **code editor** (VS Code recommended - https://code.visualstudio.com)
5. **Git** installed on your computer (https://git-scm.com/downloads)

## Step 1: Get Your API Keys Ready

### Get Anthropic API Key
1. Go to https://console.anthropic.com/api/keys
2. Click "Create Key" or "Generate API Key"
3. Copy the key (it starts with `sk-ant-`)
4. **Save it somewhere safe** - you'll need it in Step 5
5. ⚠️ **Never share this key publicly**

## Step 2: Create a GitHub Repository

1. Go to https://github.com/new
2. Fill in the form:
   - **Repository name**: `business-card-scanner` (or any name you like)
   - **Description**: "AI-powered business card scanner app"
   - **Visibility**: Select "Public" (required for free Vercel)
   - Leave other options as default
3. Click "Create repository"
4. You'll see instructions on the next page - **don't follow them yet**

## Step 3: Upload Project Files to GitHub

You have two options. **Option A is easier for beginners.**

### Option A: Using GitHub Web Interface (Easiest)

1. On your new repository page, click the green "Code" button
2. Click "Upload files"
3. Open a file explorer on your computer and navigate to the project folder
4. Select all the files and folders (except `node_modules` if it exists):
   - `app/` folder
   - `package.json`
   - `next.config.js`
   - `jsconfig.json`
   - `.gitignore`
   - `README.md`
5. Drag them into the GitHub upload area, or click to browse and select them
6. At the bottom, click "Commit changes"
7. ✅ Your files are now on GitHub!

### Option B: Using Git Command Line (More Control)

If you know Git or want to learn:

```bash
# Navigate to your project folder
cd path/to/business-card-scanner

# Initialize git
git init

# Add all files
git add .

# Commit with a message
git commit -m "Initial commit: business card scanner app"

# Add GitHub as remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git

# Push to GitHub (may prompt for credentials)
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Paste your GitHub repository URL:
   ```
   https://github.com/YOUR-USERNAME/business-card-scanner
   ```
5. Click "Continue"
6. You'll see project settings:
   - **Framework Preset**: Should auto-detect "Next.js" ✓
   - **Root Directory**: Leave as `.` (default)
   - Click "Continue"

## Step 5: Add Environment Variables

This is important! You need to add your Claude API key so the app can work.

1. Scroll down to "Environment Variables"
2. Click "Add New"
3. In the **Name** field, type: `NEXT_PUBLIC_ANTHROPIC_API_KEY`
4. In the **Value** field, paste your Anthropic API key (from Step 1)
5. Make sure "Production" is checked
6. Click "Save"

⚠️ **Important Notes:**
- The `NEXT_PUBLIC_` prefix means this variable is accessible from the browser (that's what we want for a client-side app)
- Never commit your API key to GitHub directly - Vercel stores it securely
- Your API key is only available on Vercel and never exposed to users

## Step 6: Deploy!

1. Click the blue "Deploy" button
2. Wait 2-3 minutes while Vercel builds your app
3. You'll see a "Congratulations!" message
4. Your app is live! 🎉
5. Click "Visit" to open your new app in a browser

## Step 7: Get Your Live URL

1. On the Vercel dashboard, click your project
2. At the top, you'll see a URL like: `business-card-scanner-xyz123.vercel.app`
3. This is your live app! Share this link with anyone
4. You can also add a custom domain (optional)

## Testing Your Deployment

1. Visit your live URL
2. Try uploading a business card image or taking a photo with your camera
3. The app should process it and extract contact information
4. Try exporting to CSV
5. If everything works, you're done! 🚀

## Troubleshooting

### "API key not found" error
- Go back to Vercel dashboard
- Click your project → Settings → Environment Variables
- Make sure `NEXT_PUBLIC_ANTHROPIC_API_KEY` is set with your API key
- Redeploy: Click "Deployments" → Click latest deployment → Click the three dots → "Redeploy"

### Camera not working
- This requires HTTPS (Vercel provides this by default)
- Make sure you allow camera permissions in your browser
- Try uploading an image instead

### "No text found" when scanning
- The image is too blurry or low contrast
- Try a clearer photo with better lighting
- Make sure the business card is fully visible and in focus

### App is slow
- First deployment takes a while, subsequent loads are faster
- Tesseract.js OCR can take 10-30 seconds for first use (it downloads the model)
- This is normal - subsequent scans are faster

## Making Changes After Deployment

If you want to update your app:

1. Edit files on your computer locally
2. Upload to GitHub using git or the web interface
3. Vercel automatically redeploys when you push changes to main
4. Your live URL stays the same!

## Next Steps

- ✅ Add your own custom domain (Vercel settings)
- ✅ Monitor usage in Vercel dashboard
- ✅ Share your live URL with others
- ✅ Customize the app further with CSS/features

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Claude API Docs: https://console.anthropic.com/docs/
- GitHub Help: https://docs.github.com
- Check the app's README.md for more info

---

**Congratulations on deploying your first app!** 🎉
