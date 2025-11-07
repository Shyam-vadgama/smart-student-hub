# Installation Steps for GitHub Integration Features

## 🚀 Quick Start

Follow these steps to get the new GitHub integration features working:

### Step 1: Install Required Dependencies

```bash
# Navigate to server directory
cd server

# Install adm-zip for ZIP file extraction
npm install adm-zip

# Install TypeScript types for adm-zip
npm install --save-dev @types/adm-zip
```

### Step 2: Set Up GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: Smart Student Hub
   Homepage URL: http://localhost:5173
   Authorization callback URL: http://localhost:5000/api/integrations/github/callback
   ```
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it

### Step 3: Update Environment Variables

Create or update `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-student-hub

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Encryption Key (for storing sensitive tokens)
ENCRYPTION_KEY=your-encryption-key-change-this-in-production

# Client URL (IMPORTANT: This should be your React client port)
CLIENT_URL=http://localhost:5173

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_actual_github_client_id_here
GITHUB_CLIENT_SECRET=your_actual_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/integrations/github/callback

# Vercel Configuration (optional)
VERCEL_API_URL=https://api.vercel.com
```

**⚠️ IMPORTANT**: Make sure `CLIENT_URL` is set to `http://localhost:5173` (your React client), NOT `http://localhost:5000`!

### Step 4: Restart Your Server

```bash
# Stop the server if it's running (Ctrl+C)

# Start the server again
npm run dev
```

### Step 5: Test the Integration

1. Open your browser and go to `http://localhost:5173`
2. Navigate to **Settings** or **Integrations** tab
3. Click **"Connect with GitHub"**
4. You should see a popup window asking you to authorize the app
5. After authorization, you'll be redirected back with a success message

## 📋 Verification Checklist

- [ ] `adm-zip` package installed
- [ ] `@types/adm-zip` package installed
- [ ] GitHub OAuth App created
- [ ] `GITHUB_CLIENT_ID` set in `.env`
- [ ] `GITHUB_CLIENT_SECRET` set in `.env`
- [ ] `CLIENT_URL` set to `http://localhost:5173`
- [ ] Server restarted
- [ ] GitHub connection successful
- [ ] Can see repositories in integration settings

## 🎯 What's New

### 1. OAuth-Based GitHub Connection
- No more manual token entry
- Secure OAuth flow with popup window
- Automatic token refresh

### 2. Repository Management
- **Create New Repository**: Automatically create repos for your projects
- **Use Existing Repository**: Select from your existing repos
- Private/Public repository options

### 3. Automatic Code Deployment
- Upload project as ZIP file
- Automatic extraction and push to GitHub
- Real-time deployment status

### 4. Enhanced Project Upload
- GitHub connection check before deployment
- Disabled "Portfolio + Deploy" if not connected
- Clear error messages and guidance

### 5. Deployment Dialog
- Beautiful UI for repository selection
- Real-time progress tracking
- Success/failure notifications with details

## 🔧 Troubleshooting

### Error: "Cannot find module 'adm-zip'"
**Solution**: Run `npm install adm-zip` in the server directory

### Error: "GitHub OAuth not configured"
**Solution**: 
1. Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env`
2. Restart your server
3. Make sure there are no typos in the values

### Error: "Redirects to wrong port"
**Solution**: 
1. Set `CLIENT_URL=http://localhost:5173` in `.env`
2. Restart server

### OAuth popup closes but nothing happens
**Solution**:
1. Check browser console for errors
2. Verify `GITHUB_CALLBACK_URL` matches your OAuth app settings
3. Make sure server is running on port 5000

### "Repository already exists" error
**Solution**: 
1. Choose "Use Existing Repository" option
2. Or use a different repository name

## 📦 Package Dependencies

### Server (package.json)
```json
{
  "dependencies": {
    "adm-zip": "^0.5.10",
    "axios": "^1.6.0",
    "crypto": "built-in",
    "express": "^4.18.0",
    "mongoose": "^8.0.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/adm-zip": "^0.5.5",
    "@types/express": "^4.17.0",
    "@types/multer": "^1.4.11"
  }
}
```

### Client
All required UI components are already included via shadcn/ui.

## 🎨 New UI Components

### DeploymentDialog.tsx
- Repository selection interface
- Deployment progress tracking
- Error handling

### IntegrationSettings.tsx (Updated)
- OAuth connection flow
- Repository list display

### ProjectDashboard.tsx (Updated)
- Deploy button integration
- Status tracking

### ProjectUploadForm.tsx (Updated)
- Integration status check
- Conditional deployment option

## 🚀 Usage Flow

1. **Connect GitHub** (one-time setup)
   - Go to Settings/Integrations
   - Click "Connect with GitHub"
   - Authorize in popup

2. **Upload Project**
   - Click "Upload New Project"
   - Fill details and upload ZIP
   - Choose "Portfolio + Deploy"

3. **Deploy**
   - Select repository option
   - Click "Deploy Project"
   - Watch progress
   - Get live URLs!

## 📝 Notes

- The encryption key is automatically hashed to 32 bytes, so any length string works
- GitHub tokens are encrypted before storage in MongoDB
- OAuth tokens are more secure than personal access tokens
- Deployment history is tracked for each project
- Failed deployments show detailed error messages

## 🎓 For Development

If you're developing or debugging:

1. Check server logs for detailed error messages
2. Use browser DevTools Network tab to see API calls
3. MongoDB Compass to inspect stored tokens (encrypted)
4. GitHub API rate limits: 5000 requests/hour for authenticated users

## ✅ Success Indicators

You'll know everything is working when:
- ✅ GitHub shows "Connected" badge in settings
- ✅ Can see your repositories listed
- ✅ "Portfolio + Deploy" button is enabled
- ✅ Can deploy projects successfully
- ✅ Get GitHub and Vercel URLs after deployment

---

**Ready to deploy!** 🚀 If you encounter any issues, check the troubleshooting section or review server logs.
