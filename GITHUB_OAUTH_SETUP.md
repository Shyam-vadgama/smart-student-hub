# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth for the Smart Student Hub application.

## Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button
4. Fill in the application details:
   - **Application name**: Smart Student Hub (or your preferred name)
   - **Homepage URL**: `http://localhost:5173` (for development)
   - **Application description**: (optional) Portfolio and project management for students
   - **Authorization callback URL**: `http://localhost:5000/api/integrations/github/callback`
5. Click **"Register application"**

## Step 2: Get Your OAuth Credentials

After creating the app, you'll see:
- **Client ID**: Copy this value
- **Client Secret**: Click "Generate a new client secret" and copy the value

⚠️ **Important**: Save the Client Secret immediately - you won't be able to see it again!

## Step 3: Configure Your Application

1. Copy the `.env.example` file to `.env` in the server directory:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Open the `.env` file and update the following values:
   ```env
   GITHUB_CLIENT_ID=your_actual_client_id_here
   GITHUB_CLIENT_SECRET=your_actual_client_secret_here
   GITHUB_CALLBACK_URL=http://localhost:5000/api/integrations/github/callback
   CLIENT_URL=http://localhost:5173
   ```

3. Also set a secure encryption key (used to encrypt tokens in the database):
   ```env
   ENCRYPTION_KEY=your-random-secure-key-here
   ```

## Step 4: Test the Integration

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. Start your client:
   ```bash
   cd client
   npm run dev
   ```

3. Navigate to the Settings page in your application
4. Click "Connect with GitHub"
5. You should be redirected to GitHub to authorize the application
6. After authorization, you'll be redirected back to your app with GitHub connected!

## Production Setup

For production deployment:

1. Update your GitHub OAuth App settings:
   - **Homepage URL**: Your production domain (e.g., `https://yourdomain.com`)
   - **Authorization callback URL**: Your production callback URL (e.g., `https://yourdomain.com/api/integrations/github/callback`)

2. Update your production environment variables:
   ```env
   GITHUB_CALLBACK_URL=https://yourdomain.com/api/integrations/github/callback
   CLIENT_URL=https://yourdomain.com
   ```

## Troubleshooting

### Error: "GitHub OAuth not configured"
- Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in your `.env` file
- Restart your server after updating environment variables

### Error: "invalid_state"
- This usually means the OAuth flow was interrupted
- Try connecting again

### Error: "callback_failed"
- Check your server logs for detailed error messages
- Verify that your callback URL matches exactly what's configured in GitHub

### Connection closes but nothing happens
- Check browser console for errors
- Make sure your CLIENT_URL environment variable is correct
- Verify that the callback URL in GitHub matches your GITHUB_CALLBACK_URL

## Security Notes

- Never commit your `.env` file to version control
- Use strong, random values for `ENCRYPTION_KEY` and `JWT_SECRET`
- In production, use HTTPS for all URLs
- Regularly rotate your GitHub OAuth credentials
- Consider using environment-specific OAuth apps (separate for dev/staging/prod)
