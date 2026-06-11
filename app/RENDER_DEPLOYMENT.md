# Render Deployment Guide

This guide walks you through deploying the Marche POS application on Render.

## Prerequisites

- GitHub account with your repository
- Render account (free tier available at [render.com](https://render.com))
- Google OAuth credentials (optional, for Google login)

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
cd /Users/macbookpro/Desktop/Marche\ POS/app
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Connect GitHub to Render

1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Click **New +** → **Web Service**
4. Click **Connect account** under GitHub
5. Authorize Render to access your repositories
6. Select your **Marche POS** repository

## Step 3: Configure Web Service

Fill in the following:

| Field | Value |
|-------|-------|
| **Name** | `marche-pos` (or your preferred name) |
| **Environment** | `Node` |
| **Region** | Select nearest region |
| **Branch** | `main` |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Starter (free tier) |

## Step 4: Add Environment Variables

Click **Add Environment Variable** and add all variables from `.env.render`:

### Critical Variables (Must Set)
- `NODE_ENV` = `production`
- `APP_ID` = `marche-pos-prod`
- `APP_SECRET` = (use value from `.env.render`)
- `DATA_DIR` = `/var/data`

### Google OAuth (If Using)
- `VITE_GOOGLE_CLIENT_ID` = Your Google Client ID
- `GOOGLE_CLIENT_ID` = Your Google Client ID
- `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
- `GOOGLE_REDIRECT_URI` = `https://your-app-name.onrender.com/api/oauth/callback`

**Note:** Replace `your-app-name` with your actual Render service name.

### Optional Variables
- `VITE_KIMI_AUTH_URL`, `KIMI_AUTH_URL`, `VITE_APP_ID`, etc. (for Kimi auth)
- AWS credentials (if using S3)

## Step 5: Add Persistent Disk

To preserve your JSON data across restarts:

1. Scroll to **Disks** section
2. Click **Add Disk**
3. Set:
   - **Name**: `data`
   - **Mount Path**: `/var/data`
   - **Size**: 1 GB (adjust as needed)

## Step 6: Deploy

1. Click **Create Web Service**
2. Render will build and deploy automatically
3. Monitor the deployment in the **Logs** tab
4. Once deployed, your app will be at `https://marche-pos.onrender.com` (or your custom domain)

## Step 7: Verify Deployment

Test your endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# API root
curl https://your-app-name.onrender.com/

# Frontend
https://your-app-name.onrender.com
```

## Troubleshooting

### Build Failures
- Check the **Logs** tab in Render dashboard
- Ensure `npm run build` works locally: `npm run build`
- Verify all dependencies in `package.json`

### Runtime Errors
- Check the **Runtime logs** in Render
- Ensure environment variables are set correctly
- Verify `DATA_DIR` permissions

### Data Not Persisting
- Ensure the **Disk** is mounted to `/var/data`
- Check that `DATA_DIR=/var/data` is set in environment

### Google OAuth Issues
- Verify `GOOGLE_REDIRECT_URI` matches your Render domain exactly
- Check Google Cloud Console OAuth 2.0 authorized redirect URIs

## Updating Your App

Any push to your GitHub `main` branch will trigger an automatic redeploy (if auto-deploy is enabled).

To manually deploy:
1. Go to your Web Service dashboard
2. Click **Manual Deploy** → **Deploy latest commit**

## Monitoring

- **Logs**: Real-time application output
- **Metrics**: CPU, memory, disk usage
- **Events**: Deployment history

## Next Steps

- Set up a custom domain (Settings → Custom Domain)
- Configure auto-redeploy on GitHub push
- Set up database backups if using persistent data
- Monitor performance and scale as needed

## Support

- Render Docs: [render.com/docs](https://render.com/docs)
- Check GitHub Issues for known deployment problems
