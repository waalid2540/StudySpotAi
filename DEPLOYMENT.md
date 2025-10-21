# Deployment Guide - Render.com

This guide will help you deploy the Learning Platform to Render.com.

## Prerequisites

- GitHub account
- Render.com account (free tier available)
- Git repository with your code

## Step 1: Push Code to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main
```

## Step 2: Deploy to Render

### Option A: Using Blueprint (render.yaml) - RECOMMENDED

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"** to deploy

### Option B: Manual Setup

1. Go to [Render.com](https://render.com) and sign in
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `learning-platform-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **"Create Static Site"**

## Step 3: Configure Environment Variables (Optional)

If you need environment variables:

1. Go to your site's dashboard on Render
2. Click **"Environment"** tab
3. Add variables (e.g., API URLs, Firebase keys)
4. Click **"Save Changes"**

## Step 4: Custom Domain (Optional)

1. Go to **"Settings"** → **"Custom Domain"**
2. Add your domain
3. Update DNS records as instructed by Render

## Automatic Deploys

Render automatically deploys when you push to your GitHub repository:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Build Configuration

The app is configured in `render.yaml`:

```yaml
services:
  - type: web
    name: learning-platform-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## Important Notes

### ✅ What's Included
- All student features (Dashboard, Homework, AI Tutor, Quiz, Gamification)
- All parent features (Dashboard, Children, Messages, Reports, Billing, Settings)
- All admin features (Dashboard, Users, Homework management)
- Authentication (demo mode fallback if Firebase not configured)
- Dark mode
- Responsive design
- Accessibility features

### ⚠️ Demo Mode
The app uses demo mode by default (no real Firebase backend). To enable Firebase:
1. Create a Firebase project
2. Add environment variables to Render
3. Update `src/config/firebase.ts`

### 🔄 Updates
To update your deployment:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically rebuild and deploy.

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### 404 Errors
- Ensure rewrite rules are configured (already in render.yaml)
- Check that `staticPublishPath` is set to `./dist`

### Slow Loading
- Enable CDN in Render settings
- Optimize images and assets
- Check bundle size with `npm run build`

## Support

For issues:
- Check Render logs: Dashboard → Logs
- Review build output
- Check browser console for errors

## Cost

- **Free Tier**:
  - 100 GB bandwidth/month
  - Auto-sleep after 15 min inactivity
  - Free SSL certificate

- **Paid Tier** ($7/month):
  - 100 GB bandwidth
  - No auto-sleep
  - Faster builds

## Production Checklist

Before going live:
- [ ] Update Firebase config for production
- [ ] Set up custom domain
- [ ] Configure environment variables
- [ ] Test all features
- [ ] Enable analytics
- [ ] Set up error monitoring
- [ ] Configure backup strategy

---

**Your app will be live at**: `https://learning-platform-frontend.onrender.com`
(or your custom domain)

🚀 **Ready to deploy!**
