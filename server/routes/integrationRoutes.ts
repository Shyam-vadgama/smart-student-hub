import { Router } from 'express';
import IntegrationTokens from '../models/IntegrationTokens.js';
import { GitHubService } from '../services/githubService.js';
import { VercelService } from '../services/vercelService.js';
import { AuthRequest } from '../types.js';

const router = Router();

// GitHub OAuth callback (simplified - in production use proper OAuth flow)
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

    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });

    if (!tokens || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vercel not connected' 
      });
    }

    const vercelService = new VercelService(tokens.getVercelToken()!);
    const deployment = await vercelService.deployFromGitHub(projectName, githubRepoUrl, framework);

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
