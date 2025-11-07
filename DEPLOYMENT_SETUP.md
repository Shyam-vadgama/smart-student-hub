# GitHub Integration & Deployment Setup Guide

This guide explains the new GitHub integration features and how to set them up.

## 🚀 New Features

### 1. **GitHub OAuth Authentication**
- No more manual token entry!
- Click "Connect with GitHub" and authorize via OAuth popup
- Secure token storage with encryption

### 2. **Repository Selection**
- **Create New Repository**: Automatically create a new GitHub repo for your project
- **Use Existing Repository**: Select from your existing GitHub repositories
- Private/Public repository options

### 3. **Automatic Code Push**
- Upload your project as a ZIP file
- System automatically extracts and pushes code to GitHub
- Real-time deployment status tracking

### 4. **Deployment Status**
- **Pending**: Deployment in progress
- **Deployed**: Successfully deployed with live URLs
- **Failed**: Deployment failed with error details
- **Not Deployed**: Portfolio-only project

## 📦 Required Dependencies

### Server Dependencies

Install these packages in your server directory:

```bash
cd server
npm install adm-zip
npm install --save-dev @types/adm-zip
```

### Client Dependencies

The client already has all required dependencies from shadcn/ui.

## 🔧 Environment Setup

### 1. Server Environment Variables

Update your `server/.env` file:

```env
# GitHub OAuth (Required for OAuth flow)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/integrations/github/callback

# Client URL (for redirects)
CLIENT_URL=http://localhost:5173

# Encryption Key (for secure token storage)
ENCRYPTION_KEY=your-secure-encryption-key-here
```

### 2. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Smart Student Hub
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/integrations/github/callback`
4. Copy Client ID and Client Secret to your `.env` file

### 3. Create Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Save it securely (you'll add it via the UI)

## 🎯 How to Use

### For Students

#### 1. Connect Integrations

1. Go to **Settings** or **Integrations** tab
2. Click **"Connect with GitHub"**
3. Authorize the app in the GitHub popup
4. Click **"Connect Vercel"** and paste your Vercel token

#### 2. Upload Project

1. Click **"Upload New Project"**
2. Fill in project details
3. Upload project ZIP file (containing your code)
4. Choose deployment option:
   - **Portfolio Only**: Just add to portfolio (no deployment)
   - **Portfolio + Deploy**: Add to portfolio AND deploy to GitHub + Vercel

#### 3. Deploy Project

If you chose "Portfolio Only" initially, you can deploy later:

1. Find your project in the projects list
2. Click **"Deploy"** button
3. Choose repository option:
   - **Create New Repository**: Enter a name for new repo
   - **Use Existing Repository**: Select from your repos
4. Click **"Deploy Project"**

#### 4. Monitor Deployment

Watch the deployment progress:
- ✅ **Checking connections**: Verifying GitHub/Vercel access
- ✅ **Pushing code to GitHub**: Extracting ZIP and pushing files
- ✅ **Deploying to Vercel**: Creating live deployment
- 🎉 **Success**: Get your live URLs!

### Deployment Status Tracking

Each project shows:
- **GitHub URL**: Link to your repository
- **Vercel URL**: Link to live deployment
- **Deployment History**: All deployment attempts with timestamps
- **Status**: Current deployment state

## 🔍 Troubleshooting

### "GitHub OAuth not configured"
- Make sure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env`
- Restart your server after updating environment variables

### "Repository already exists"
- Choose "Use Existing Repository" option instead
- Or use a different repository name

### "Failed to push files to GitHub"
- Check that your ZIP file contains valid project files
- Ensure GitHub token has `repo` permissions
- Verify repository exists and you have write access

### "Vercel deployment failed"
- Check Vercel token is valid
- Ensure your project framework is supported
- Check Vercel logs for detailed errors

### Deployment stuck on "Pending"
- Check server logs for errors
- Verify both GitHub and Vercel are connected
- Try deploying again

## 📊 Deployment History

Each deployment creates a history entry with:
- **Version**: Auto-incremented (v1.0.0, v2.0.0, etc.)
- **Timestamp**: When deployment occurred
- **Status**: Success or failure reason
- **URL**: Live deployment URL (if successful)

## 🔐 Security Notes

- Tokens are encrypted before storage in database
- OAuth tokens are more secure than personal access tokens
- Never commit `.env` file to version control
- Regularly rotate your API keys and tokens
- Use private repositories for sensitive projects

## 🎨 UI Components

### DeploymentDialog
- Repository selection interface
- Real-time deployment progress
- Error handling and status display

### IntegrationSettings
- OAuth connection flow
- Repository list display
- Connection status indicators

### ProjectDashboard
- Deployment status badges
- Quick deploy buttons
- Deployment history view

## 📝 API Endpoints

### GitHub Integration
- `GET /api/integrations/github/auth` - Initiate OAuth flow
- `GET /api/integrations/github/callback` - OAuth callback
- `GET /api/integrations/github/repos` - List repositories
- `DELETE /api/integrations/github/disconnect` - Disconnect GitHub

### Project Deployment
- `POST /api/projects/deploy/:projectId` - Deploy project
  - Body: `{ repositoryOption, repositoryName, existingRepoFullName, isPrivate }`
- `GET /api/projects/user/:userId` - Get user's projects
- `GET /api/projects/:projectId` - Get project details

## 🚦 Deployment Flow

```
1. User clicks "Deploy"
   ↓
2. Select repository (new/existing)
   ↓
3. System checks GitHub/Vercel connections
   ↓
4. Extract project ZIP file
   ↓
5. Create/select GitHub repository
   ↓
6. Push files to GitHub via API
   ↓
7. Trigger Vercel deployment
   ↓
8. Update project status
   ↓
9. Show success with URLs
```

## 💡 Best Practices

1. **Project Structure**: Ensure your ZIP contains a proper project structure
2. **README**: Include a README.md in your project
3. **Dependencies**: Include package.json with all dependencies
4. **Environment**: Don't include .env files in ZIP
5. **Testing**: Test locally before deploying
6. **Naming**: Use descriptive repository names
7. **Documentation**: Document your deployment process

## 🎓 For Faculty/HOD

Faculty can:
- View all student projects
- Verify projects (adds verification badge)
- Monitor deployment success rates
- Track student portfolio growth

## 🔄 Updates & Maintenance

To update a deployed project:
1. Upload new version
2. Deploy again (creates new version in history)
3. Old deployments remain in history
4. Vercel automatically updates live URL

---

**Need Help?** Check the server logs for detailed error messages or contact support.
