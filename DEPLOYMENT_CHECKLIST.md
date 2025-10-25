# 🚀 Study Spot AI - Render Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Code committed to Git
- [x] Code pushed to GitHub: https://github.com/waalid2540/StudySpotAi
- [ ] Firebase project created
- [ ] Firebase service account key downloaded
- [ ] Anthropic API key obtained
- [ ] Render account created

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Create Firebase Project (If Not Done)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name: `studyspot-ai-production`
4. Enable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable these sign-in methods:
   - ✅ Email/Password
   - ✅ Google (optional but recommended)
4. Click "Save"

### Step 3: Get Firebase Service Account

1. In Firebase Console, click ⚙️ (Settings) → **Project Settings**
2. Go to **Service Accounts** tab
3. Click "Generate New Private Key"
4. Download the JSON file
5. **Keep this file secure** - you'll upload it to Render later

### Step 4: Get Firebase Config for Frontend

1. In Firebase Console → Project Settings
2. Scroll to **Your apps** section
3. Click web icon (</>) to add web app
4. Register app: `StudySpot AI Web`
5. **Copy these values** - you'll need them:
   ```
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```

---

## 🗄️ Step 5: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `studyspot-ai-db`
   - **Database**: `studyspot_ai_production`
   - **Region**: `Oregon (US West)` or closest to you
   - **PostgreSQL Version**: 15
   - **Plan**: **Free** (for testing) or **Starter $7/mo** (recommended)
4. Click **"Create Database"**
5. Wait ~2-3 minutes for provisioning
6. Once ready, click on the database
7. **Copy the "Internal Database URL"** - looks like:
   ```
   postgresql://studyspot_admin:xxxxx@dpg-xxxxx.oregon-postgres.render.com/studyspot_ai_production
   ```

---

## 🔧 Step 6: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Your project already has `render.yaml` configured
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **"New +"** → **"Blueprint"**
4. Connect your GitHub repository: `waalid2540/StudySpotAi`
5. Render will detect `render.yaml`
6. Click **"Apply"**

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `waalid2540/StudySpotAi`
4. Configure:
   - **Name**: `studyspot-ai-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Free** or **Starter $7/mo**

---

## 🔑 Step 7: Set Backend Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

### Required Variables

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `NODE_ENV` | `production` | Just type it |
| `PORT` | `10000` | Render default |
| `DATABASE_URL` | `postgresql://...` | From Step 5 (Internal DB URL) |
| `JWT_SECRET` | Click "Generate" | Render can auto-generate |
| `JWT_REFRESH_SECRET` | Click "Generate" | Render can auto-generate |
| `JWT_EXPIRES_IN` | `7d` | Just type it |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Just type it |

### Firebase Variables

Upload your Firebase service account JSON file:

1. Click **"Add Secret File"**
2. Filename: `firebase-service-account.json`
3. Upload the JSON file you downloaded
4. Add environment variable:
   - Key: `FIREBASE_SERVICE_ACCOUNT_PATH`
   - Value: `/etc/secrets/firebase-service-account.json`

### AI API Keys (Choose One or Both)

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | [console.anthropic.com](https://console.anthropic.com) |
| `OPENAI_API_KEY` | `sk-...` (optional) | [platform.openai.com](https://platform.openai.com) |

### Stripe Variables (Optional - for payments)

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `STRIPE_SECRET_KEY` | `sk_test_...` | [dashboard.stripe.com](https://dashboard.stripe.com) |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Leave empty for now | Will set up later |

### CORS Configuration

| Variable | Value | Note |
|----------|-------|------|
| `FRONTEND_URL` | Leave empty for now | Will update after frontend deployed |

---

## 🎨 Step 8: Deploy Frontend to Render

1. Click **"New +"** → **"Static Site"**
2. Connect repository: `waalid2540/StudySpotAi`
3. Configure:
   - **Name**: `studyspot-ai-frontend`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: **Free**

### Frontend Environment Variables

Click **"Advanced"** and add:

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `VITE_API_URL` | `https://studyspot-ai-backend.onrender.com/api/v1` | Your backend URL from Step 6 |
| `VITE_FIREBASE_API_KEY` | From Step 4 | Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | From Step 4 | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | From Step 4 | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | From Step 4 | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Step 4 | Firebase Console |
| `VITE_FIREBASE_APP_ID` | From Step 4 | Firebase Console |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (optional) | Stripe Dashboard |

Click **"Create Static Site"**

---

## 🔄 Step 9: Update CORS Configuration

1. Go back to your **backend service** on Render
2. Go to **Environment** tab
3. Update `FRONTEND_URL` variable:
   - Value: Your frontend URL (e.g., `https://studyspot-ai-frontend.onrender.com`)
4. Click **"Save Changes"**
5. Backend will automatically redeploy

---

## ✅ Step 10: Test Your Deployment

### Test Backend Health

Visit: `https://studyspot-ai-backend.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T..."
}
```

### Test API Documentation

Visit: `https://studyspot-ai-backend.onrender.com/api/docs`

Should see Swagger API documentation.

### Test Frontend

1. Visit your frontend URL: `https://studyspot-ai-frontend.onrender.com`
2. Try registering a new account
3. Check if you can log in
4. Test AI chat feature
5. Test homework submission

---

## 🎯 Step 11: Set Up Your First Admin

Since you removed admin registration from the UI, create your first admin via backend shell:

1. Go to **backend service** in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run appoint-admin your-email@example.com
   ```
4. This will promote your account to admin

---

## 📊 Optional: Set Up Stripe for Payments

### Create Stripe Products

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Products → Add Product
3. Create 4 products:
   - Basic Monthly: $9.99/month
   - Basic Yearly: $99.99/year
   - Premium Monthly: $19.99/month
   - Premium Yearly: $199.99/year
4. Copy each Price ID

### Update Stripe Environment Variables

Add to backend:
- `STRIPE_BASIC_MONTHLY_PRICE_ID`
- `STRIPE_BASIC_YEARLY_PRICE_ID`
- `STRIPE_PREMIUM_MONTHLY_PRICE_ID`
- `STRIPE_PREMIUM_YEARLY_PRICE_ID`

### Set Up Stripe Webhook

1. Stripe Dashboard → Webhooks
2. Add endpoint: `https://studyspot-ai-backend.onrender.com/api/v1/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.*`
4. Copy webhook secret
5. Update `STRIPE_WEBHOOK_SECRET` in Render

---

## 🎉 Congratulations!

Your Study Spot AI is now live on Render!

### Your URLs:
- **Frontend**: `https://studyspot-ai-frontend.onrender.com`
- **Backend**: `https://studyspot-ai-backend.onrender.com`
- **API Docs**: `https://studyspot-ai-backend.onrender.com/api/docs`

### Important Notes:

⚠️ **Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after inactivity may take 30-60 seconds
- Database free tier expires after 90 days

💡 **Recommended Upgrades:**
- Backend: Starter plan ($7/mo) for 24/7 uptime
- Database: Starter plan ($7/mo) for persistence
- Total: $14/mo for production-ready setup

---

## 🐛 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify all environment variables are set
- Check DATABASE_URL is correct

### Frontend shows 404 errors
- Verify VITE_API_URL points to backend
- Check backend is running
- Check CORS (FRONTEND_URL) is set correctly

### Authentication not working
- Verify Firebase credentials are correct
- Check Firebase Auth is enabled
- Check service account file is uploaded

### Database connection errors
- Verify DATABASE_URL format
- Check database is in same region
- Ensure SSL is enabled (Render default)

---

## 📞 Need Help?

- Check Render logs for errors
- Review this checklist
- Check Firebase Console for auth issues
- Test API endpoints individually
- Contact support if stuck

**Good luck with your deployment!** 🚀
