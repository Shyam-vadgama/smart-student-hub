import { Router, Request } from 'express';
import IntegrationTokens from '../models/IntegrationTokens.js';
import { GitHubService } from '../services/githubService.js';
import { VercelService } from '../services/vercelService.js';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/integrations/github/callback';

// Initiate GitHub OAuth flow
router.get('/github/auth', (req: AuthRequest, res) => {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ success: false, message: 'GitHub OAuth not configured' });
  }

  // Store user ID in session for callback
  const state = Buffer.from(JSON.stringify({ userId: req.user._id })).toString('base64');
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_CALLBACK_URL)}&scope=repo,user&state=${state}`;
  
  res.json({ success: true, authUrl: githubAuthUrl });
});

// GitHub OAuth callback
router.get('/github/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?error=no_code`);
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?error=oauth_not_configured`);
    }

    // Decode state to get user ID
    let userId;
    try {
      const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
      userId = stateData.userId;
    } catch (error) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?error=${tokenData.error}`);
    }

    const accessToken = tokenData.access_token;

    // Verify token by fetching user info
    const githubService = new GitHubService(accessToken);
    await githubService.getUserInfo();

    // Store or update tokens
    let tokens = await IntegrationTokens.findOne({ userId });
    
    if (!tokens) {
      tokens = new IntegrationTokens({ userId });
    }

    tokens.setGithubToken(accessToken);
    tokens.githubTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await tokens.save();

    // Redirect back to settings page with success
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?github=connected`);
  } catch (error: any) {
    console.error('Error in GitHub OAuth callback:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?error=callback_failed`);
  }
});

// Legacy endpoint for manual token connection (kept for backward compatibility)
router.post('/github/connect', async (req: AuthRequest, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Access token required' });
    }

    // Verify token by fetching user info
    const githubService = new GitHubService(accessToken);
    const userInfo = await githubService.getUserInfo();

    // Store or update tokens
    let tokens = await IntegrationTokens.findOne({ userId: req.user._id });
    
    if (!tokens) {
      tokens = new IntegrationTokens({ userId: req.user._id });
    }

    tokens.setGithubToken(accessToken);
    tokens.githubTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await tokens.save();

    res.json({
      success: true,
      message: 'GitHub connected successfully',
      user: userInfo
    });
  } catch (error: any) {
    console.error('Error connecting GitHub:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get GitHub repositories
router.get('/github/repos', async (req: AuthRequest, res) => {
  try {
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.githubToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'GitHub not connected. Please connect your GitHub account first.' 
      });
    }

    const githubService = new GitHubService(tokens.getGithubToken()!);
    const repos = await githubService.getRepositories();

    res.json({ success: true, repositories: repos });
  } catch (error: any) {
    console.error('Error fetching GitHub repos:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create GitHub repository
router.post('/github/create-repo', async (req: AuthRequest, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.githubToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'GitHub not connected' 
      });
    }

    const githubService = new GitHubService(tokens.getGithubToken()!);
    const repo = await githubService.createRepository(name, description, isPrivate);

    res.json({ success: true, repository: repo });
  } catch (error: any) {
    console.error('Error creating GitHub repo:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vercel OAuth callback
router.post('/vercel/connect', async (req: AuthRequest, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Access token required' });
    }

    // Verify token
    const vercelService = new VercelService(accessToken);
    const userInfo = await vercelService.getUserInfo();

    // Store or update tokens
    let tokens = await IntegrationTokens.findOne({ userId: req.user._id });
    
    if (!tokens) {
      tokens = new IntegrationTokens({ userId: req.user._id });
    }

    tokens.setVercelToken(accessToken);
    tokens.vercelTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await tokens.save();

    res.json({
      success: true,
      message: 'Vercel connected successfully',
      user: userInfo
    });
  } catch (error: any) {
    console.error('Error connecting Vercel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Vercel projects
router.get('/vercel/projects', async (req: AuthRequest, res) => {
  try {
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vercel not connected' 
      });
    }

    const vercelService = new VercelService(tokens.getVercelToken()!);
    const projects = await vercelService.getProjects();

    res.json({ success: true, projects });
  } catch (error: any) {
    console.error('Error fetching Vercel projects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deploy to Vercel
router.post('/vercel/deploy', async (req: AuthRequest, res) => {
  try {
    const { projectName, githubRepoUrl, framework } = req.body;

    if (!projectName || !githubRepoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Project name and GitHub repository URL are required'
      });
    }

    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vercel not connected' 
      });
    }

    let repoId: number | undefined;

    if (tokens.githubToken) {
      try {
        const githubToken = tokens.getGithubToken();
        if (githubToken) {
          const githubService = new GitHubService(githubToken);
          const normalizedUrl = githubRepoUrl
            .replace('https://github.com/', '')
            .replace('http://github.com/', '')
            .replace(/\.git$/, '')
            .replace(/\/$/, '');
          const [owner, repo] = normalizedUrl.split('/');

          if (owner && repo) {
            const repository = await githubService.getRepository(owner, repo);
            repoId = repository?.id;
          }
        }
      } catch (githubError: any) {
        console.warn('Unable to fetch GitHub repository for repoId:', githubError.message);
      }
    }

    if (!repoId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine GitHub repository ID. Please reconnect GitHub and try again.'
      });
    }

    const vercelService = new VercelService(tokens.getVercelToken()!);
    const deployment = await vercelService.deployFromGitHub(projectName, githubRepoUrl, framework, repoId);

    res.json({ success: true, deployment });
  } catch (error: any) {
    console.error('Error deploying to Vercel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get deployment status
router.get('/vercel/deployment/:deploymentId', async (req: AuthRequest, res) => {
  try {
    const { deploymentId } = req.params;

    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vercel not connected' 
      });
    }

    const vercelService = new VercelService(tokens.getVercelToken()!);
    const status = await vercelService.getDeploymentStatus(deploymentId);

    res.json({ success: true, status });
  } catch (error: any) {
    console.error('Error fetching deployment status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check integration status
router.get('/status', async (req: AuthRequest, res) => {
  try {
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    res.json({
      success: true,
      integrations: {
        github: {
          connected: !!tokens?.githubToken,
          expiry: tokens?.githubTokenExpiry
        },
        vercel: {
          connected: !!tokens?.vercelToken,
          expiry: tokens?.vercelTokenExpiry
        }
      }
    });
  } catch (error: any) {
    console.error('Error checking integration status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disconnect GitHub
router.delete('/github/disconnect', async (req: AuthRequest, res) => {
  try {
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (tokens) {
      tokens.githubToken = undefined;
      tokens.githubRefreshToken = undefined;
      tokens.githubTokenExpiry = undefined;
      await tokens.save();
    }

    res.json({ success: true, message: 'GitHub disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting GitHub:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Disconnect Vercel
router.delete('/vercel/disconnect', async (req: AuthRequest, res) => {
  try {
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (tokens) {
      tokens.vercelToken = undefined;
      tokens.vercelRefreshToken = undefined;
      tokens.vercelTokenExpiry = undefined;
      await tokens.save();
    }

    res.json({ success: true, message: 'Vercel disconnected successfully' });
  } catch (error: any) {
    console.error('Error disconnecting Vercel:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
