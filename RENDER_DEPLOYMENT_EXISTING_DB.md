# 🚀 Deploy Study Spot AI to Render (Using Existing PostgreSQL)

Since you already have a PostgreSQL database on Render, this guide shows you how to deploy Study Spot AI using it.

---

## 📋 Prerequisites Checklist

- [x] GitHub repository: https://github.com/waalid2540/StudySpotAi
- [x] Existing Render PostgreSQL database
- [ ] Firebase project (for authentication)
- [ ] Anthropic API key (for AI features)
- [ ] Render account

---

## Step 1: Prepare Your Existing Database

### Option A: Create Separate Database (Recommended)

Keep your projects separated by creating a new database:

1. **Go to Render Dashboard** → Your PostgreSQL database
2. **Click "Shell" tab**
3. **Run this command:**

```sql
CREATE DATABASE studyspot_ai_production;
```

4. **Get your new connection string:**
   - Original: `postgresql://user:pass@dpg-xxxxx.render.com/your_original_db`
   - New: `postgresql://user:pass@dpg-xxxxx.render.com/studyspot_ai_production`
   - Just change the database name at the end!

5. **Save this connection string** - you'll use it as `DATABASE_URL`

### Option B: Use Same Database (Simpler)

If you prefer, you can use your existing database. Study Spot AI tables won't conflict with your other projects.

1. **Get your existing `DATABASE_URL`** from Render
2. You're done! Study Spot AI will create its own tables automatically.

---

## Step 2: Initialize Database Schema

You have two options:

### Option A: Manual Schema Setup (Recommended)

1. **Go to your database Shell** in Render
2. **Copy the entire contents** of `database_schema.sql` file
3. **Paste and run** in the shell

OR

### Option B: Automatic Schema Setup

Your backend will automatically create tables when it first connects (using TypeORM).

---

## Step 3: Get Firebase Credentials (15 minutes)

### Create Firebase Project

1. **Go to** [Firebase Console](https://console.firebase.google.com/)
2. **Click "Add Project"**
3. **Name:** `studyspot-ai-production`
4. **Disable Google Analytics** (optional)
5. **Click "Create Project"**

### Enable Authentication

1. **Click "Authentication"** → "Get Started"
2. **Enable "Email/Password"**
3. **Click "Save"**

### Get Frontend Credentials

1. **Project Settings** (⚙️ icon)
2. **Scroll to "Your apps"**
3. **Click web icon** (</>)
4. **Register app:** `StudySpot AI Web`
5. **Copy these values:**

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=studyspot-ai-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studyspot-ai-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=studyspot-ai-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

### Get Backend Credentials

1. **Project Settings** → **Service Accounts**
2. **Click "Generate New Private Key"**
3. **Download the JSON file**
4. **Keep it safe** - you'll upload to Render

---

## Step 4: Get Anthropic API Key (5 minutes)

1. **Go to** [Anthropic Console](https://console.anthropic.com/)
2. **Sign up/Login**
3. **Go to API Keys**
4. **Create New Key**
5. **Copy the key:** `sk-ant-api03-xxxxx`

---

## Step 5: Deploy Backend to Render

### Create Web Service

1. **Render Dashboard** → **New +** → **Web Service**
2. **Connect:** `waalid2540/StudySpotAi` repository
3. **Configure:**
   - **Name:** `studyspot-ai-backend`
   - **Region:** Same as your database! (Important for speed)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter for 24/7 uptime)

### Add Environment Variables

Click **"Advanced"** and add these:

#### Required - Basic Settings
```env
NODE_ENV=production
PORT=10000
```

#### Required - Database (Use Your Existing DB!)
```env
DATABASE_URL=postgresql://user:pass@dpg-xxxxx.render.com/studyspot_ai_production
```
👆 **Replace with your actual database URL from Step 1**

#### Required - JWT Secrets
Click "Generate" for these:
```env
JWT_SECRET=[Click Generate Button]
JWT_REFRESH_SECRET=[Click Generate Button]
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

#### Required - Firebase Backend
1. **Add Secret File:**
   - Filename: `firebase-service-account.json`
   - Upload the JSON file you downloaded
2. **Add Variable:**
```env
FIREBASE_SERVICE_ACCOUNT_PATH=/etc/secrets/firebase-service-account.json
```

#### Required - AI API Key
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```
👆 **Replace with your actual Anthropic key**

#### Optional - Stripe (Skip for now)
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

#### CORS - Leave Empty for Now
```env
FRONTEND_URL=
```
We'll update this after deploying frontend.

### Deploy!

4. **Click "Create Web Service"**
5. **Wait 3-5 minutes** for deployment
6. **Copy your backend URL:** `https://studyspot-ai-backend.onrender.com`

---

## Step 6: Deploy Frontend to Render

### Create Static Site

1. **Render Dashboard** → **New +** → **Static Site**
2. **Connect:** `waalid2540/StudySpotAi` repository
3. **Configure:**
   - **Name:** `studyspot-ai-frontend`
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Free

### Add Frontend Environment Variables

Click **"Advanced"** and add:

```env
VITE_API_URL=https://studyspot-ai-backend.onrender.com/api/v1
```
👆 **Replace with YOUR backend URL from Step 5**

**Add Firebase credentials from Step 3:**
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=studyspot-ai-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=studyspot-ai-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=studyspot-ai-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

**Optional - Stripe:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Deploy!

4. **Click "Create Static Site"**
5. **Wait 2-3 minutes** for deployment
6. **Copy your frontend URL:** `https://studyspot-ai-frontend.onrender.com`

---

## Step 7: Update CORS

Now that you have your frontend URL:

1. **Go back to Backend service** in Render
2. **Environment tab**
3. **Update `FRONTEND_URL`:**
   ```env
   FRONTEND_URL=https://studyspot-ai-frontend.onrender.com
   ```
4. **Save Changes**
5. Backend will automatically redeploy

---

## Step 8: Test Everything! 🎉

### Test Backend

Visit: `https://studyspot-ai-backend.onrender.com/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23..."
}
```

### Test API Docs

Visit: `https://studyspot-ai-backend.onrender.com/api/docs`

Should see Swagger documentation.

### Test Frontend

1. **Visit:** `https://studyspot-ai-frontend.onrender.com`
2. **Register** a new account
3. **Check email** for verification (if Firebase email verification is enabled)
4. **Login** with your account
5. **Test features:**
   - ✅ AI Chat
   - ✅ Homework submission
   - ✅ Dashboard

---

## Step 9: Create Your First Admin

1. **Register a regular account** through the web interface
2. **Go to Backend service** in Render
3. **Click "Shell" tab**
4. **Run:**
   ```bash
   npm run appoint-admin your-email@example.com
   ```
5. **Logout and login again** to see admin features

---

## ✅ Deployment Complete!

### Your URLs:
- **Frontend:** `https://studyspot-ai-frontend.onrender.com`
- **Backend:** `https://studyspot-ai-backend.onrender.com`
- **API Docs:** `https://studyspot-ai-backend.onrender.com/api/docs`
- **Database:** Your existing Render PostgreSQL

---

## 💰 Cost Breakdown

Using your existing database:

- **PostgreSQL:** $0 (already paying for it)
- **Backend (Free tier):** $0
- **Frontend (Free tier):** $0
- **Firebase:** $0 (10K users/month free)
- **Anthropic:** Pay-as-you-go (starts free)

**Total: $0/month** 🎉

### Recommended Upgrades (Optional):
- **Backend Starter:** $7/mo (24/7 uptime, no cold starts)
- **Total with upgrade:** $7/mo

---

## 🐛 Common Issues & Fixes

### "Database connection failed"
- ✅ Check `DATABASE_URL` is correct
- ✅ Ensure database exists (run `CREATE DATABASE` command)
- ✅ Check backend and database are in same region

### "Firebase authentication failed"
- ✅ Verify service account JSON file is uploaded
- ✅ Check `FIREBASE_SERVICE_ACCOUNT_PATH` is correct
- ✅ Ensure Email/Password auth is enabled in Firebase

### "CORS error"
- ✅ Make sure `FRONTEND_URL` matches your actual frontend URL
- ✅ No trailing slash in the URL
- ✅ Wait for backend to redeploy after changing env vars

### "Tables not found"
- ✅ Run `database_schema.sql` in your database shell
- ✅ Or wait for TypeORM to auto-create tables on first request

---

## 🎯 Next Steps

1. **Custom Domain** - Add your own domain to frontend
2. **Email Service** - Set up SendGrid for email notifications
3. **Monitoring** - Add error tracking with Sentry
4. **Stripe** - Set up payment processing
5. **Backups** - Configure database backups

---

## 📞 Need Help?

- Check Render logs for errors
- Verify all environment variables are set
- Test backend endpoints individually
- Check Firebase Console for auth issues

**Your Study Spot AI is now LIVE!** 🚀
