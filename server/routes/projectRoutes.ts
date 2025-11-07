import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project.js';
import IntegrationTokens from '../models/IntegrationTokens.js';
import { GitHubService } from '../services/githubService.js';
import { VercelService } from '../services/vercelService.js';
import AdmZip from 'adm-zip';

// Define AuthRequest interface
interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'projects');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.zip', '.jpg', '.jpeg', '.png', '.gif', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create a new project
router.post('/create', upload.fields([
  { name: 'projectFiles', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 }
]), async (req: AuthRequest, res) => {
  try {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.files);

    const {
      name,
      description,
      languages,
      frameworks,
      tags,
      projectType,
      collaborators,
      demoVideoUrl,
      githubRepoUrl,
      deploymentType
    } = req.body;

    // Validate required fields
    if (!name || !description || !projectType || !deploymentType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : undefined,
          description: !description ? 'Description is required' : undefined,
          projectType: !projectType ? 'Project type is required' : undefined,
          deploymentType: !deploymentType ? 'Deployment type is required' : undefined
        }
      });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const screenshots = files?.screenshots?.map(file => `/uploads/projects/${file.filename}`) || [];
    const projectZipFile = files?.projectFiles?.[0];

    const project = new Project({
      name,
      description,
      languages: JSON.parse(languages || '[]'),
      frameworks: JSON.parse(frameworks || '[]'),
      tags: JSON.parse(tags || '[]'),
      projectType,
      collaborators: JSON.parse(collaborators || '[]'),
      screenshots,
      demoVideoUrl,
      githubRepoUrl,
      uploadedBy: req.user._id,
      deploymentType,
      deploymentStatus: deploymentType === 'Portfolio Only' ? 'Not Deployed' : 'Pending',
      projectFilePath: projectZipFile ? projectZipFile.path : undefined
    });

    await project.save();

    // If "Portfolio + Deploy" and has ZIP file, automatically push to GitHub and Vercel
    if (deploymentType === 'Portfolio + Deploy' && projectZipFile) {
      // Trigger automatic deployment in background with real-time status updates
      setImmediate(async () => {
        try {
          const tokens = await IntegrationTokens.findOne({ userId: req.user._id });
          if (!tokens || !tokens.githubToken) {
            throw new Error('GitHub not connected');
          }

          // Step 1: Initialize (10%)
          project.deploymentStep = 'Initializing deployment...';
          project.deploymentProgress = 10;
          await project.save();

          const githubService = new GitHubService(tokens.getGithubToken()!);
          const userInfo = await githubService.getUserInfo();
          const owner = userInfo.login;
          const repoName = project.name.toLowerCase().replace(/\s+/g, '-');
          
          // Step 2: Creating/Finding Repository (25%)
          project.deploymentStep = 'Creating GitHub repository...';
          project.deploymentProgress = 25;
          await project.save();

          let githubRepo = await githubService.getRepository(owner, repoName);
          if (!githubRepo) {
            githubRepo = await githubService.createRepository(
              repoName,
              project.description,
              false
            );
          }
          project.githubRepoId = githubRepo.id;
          
          // Step 3: Extracting Files (40%)
          project.deploymentStep = 'Extracting project files...';
          project.deploymentProgress = 40;
          await project.save();

          const zip = new AdmZip(projectZipFile.path);
          const zipEntries = zip.getEntries();
          const filesToPush: { path: string; content: string }[] = [];
          
          zipEntries.forEach((entry: any) => {
            if (!entry.isDirectory) {
              const content = entry.getData().toString('utf8');
              filesToPush.push({
                path: entry.entryName,
                content
              });
            }
          });
          
          // Step 4: Pushing to GitHub (60%)
          project.deploymentStep = 'Pushing code to GitHub...';
          project.deploymentProgress = 60;
          await project.save();

          if (filesToPush.length > 0) {
            await githubService.pushFilesToRepo(
              owner,
              repoName,
              filesToPush,
              `Initial commit: ${project.name}`
            );
          }
          
          // Update project with GitHub URL
          project.githubRepoUrl = githubRepo.html_url;
          project.githubRepoId = githubRepo.id;
          project.deploymentStep = 'Deployed to GitHub ';
          project.deploymentProgress = 70;
          await project.save();

          // Step 5: Deploy to Vercel (if connected)
          if (tokens.vercelToken) {
            try {
              project.deploymentStep = 'Deploying to Vercel...';
              project.deploymentProgress = 80;
              await project.save();

              const vercelService = new VercelService(tokens.getVercelToken()!);
              const deployment = await vercelService.deployFromGitHub(
                project.name,
                githubRepo.html_url,
                project.frameworks[0] || 'other',
                project.githubRepoId
              );

              project.vercelUrl = `https://${deployment.url}`;
              project.vercelProjectId = deployment.projectId;
              project.vercelSettingsUrl = deployment.settingsUrl;
              project.deploymentStep = 'Deployed to Vercel ';
              project.deploymentProgress = 100;
              project.deploymentStatus = 'Deployed';
              project.deploymentHistory.push({
                version: 'v1.0.0',
                deployedAt: new Date(),
                status: 'Success - GitHub + Vercel',
                url: `https://${deployment.url}`
              });
              await project.save();

              console.log(`✅ Fully deployed: ${githubRepo.html_url} → ${deployment.url}`);
              console.log(`⚙️ Vercel settings: ${deployment.settingsUrl}`);
            } catch (vercelError: any) {
              console.error('Vercel deployment failed:', vercelError);
              project.deploymentStep = 'GitHub deployed, Vercel failed';
              project.deploymentProgress = 70;
              project.deploymentStatus = 'Deployed';
              project.deploymentHistory.push({
                version: 'v1.0.0',
                deployedAt: new Date(),
                status: 'Partial - GitHub only',
                url: undefined
              });
              await project.save();
            }
          } else {
            // GitHub only
            project.deploymentStep = 'Completed (GitHub only)';
            project.deploymentProgress = 100;
            project.deploymentStatus = 'Deployed';
            project.deploymentHistory.push({
              version: 'v1.0.0',
              deployedAt: new Date(),
              status: 'Success - GitHub only',
              url: undefined
            });
            await project.save();
            console.log(`✅ Deployed to GitHub: ${githubRepo.html_url}`);
          }
        } catch (error: any) {
          console.error('Error auto-deploying:', error);
          project.deploymentStatus = 'Failed';
          project.deploymentStep = `Failed: ${error.message}`;
          project.deploymentProgress = 0;
          project.deploymentHistory.push({
            version: 'v1.0.0',
            deployedAt: new Date(),
            status: `Failed - ${error.message}`,
            url: undefined
          });
          await project.save();
        }
      });
    }

    res.status(201).json({
      success: true,
      message: deploymentType === 'Portfolio + Deploy' && projectZipFile 
        ? 'Project created and deployment started! Check back in a moment.'
        : 'Project created successfully',
      project,
      hasProjectFiles: !!projectZipFile,
      autoDeploying: deploymentType === 'Portfolio + Deploy' && !!projectZipFile
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deploy project to GitHub and Vercel with repository selection
router.post('/deploy/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { repositoryOption, repositoryName, existingRepoFullName, isPrivate = false } = req.body;
    
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get integration tokens
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });
    if (!tokens || !tokens.githubToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please connect your GitHub account first' 
      });
    }
    
    const hasVercel = !!tokens.vercelToken;

    project.deploymentStatus = 'Pending';
    await project.save();

    // Initialize services
    const githubService = new GitHubService(tokens.getGithubToken()!);
    const vercelService = new VercelService(tokens.getVercelToken()!);
    const userInfo = await githubService.getUserInfo();
    const owner = userInfo.login;

    let githubRepo: any;
    let repoName: string;

    // Handle repository selection
    if (repositoryOption === 'existing' && existingRepoFullName) {
      // Use existing repository
      const [repoOwner, repo] = existingRepoFullName.split('/');
      githubRepo = await githubService.getRepository(repoOwner, repo);
      
      if (!githubRepo) {
        return res.status(404).json({ 
          success: false, 
          message: 'Selected repository not found' 
        });
      }
      repoName = repo;
      project.githubRepoId = githubRepo.id;
    } else {
      // Create new repository
      repoName = repositoryName || project.name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if repo already exists
      const existingRepo = await githubService.getRepository(owner, repoName);
      if (existingRepo) {
        return res.status(400).json({ 
          success: false, 
          message: `Repository "${repoName}" already exists. Please choose a different name or select the existing repository.` 
        });
      }

      githubRepo = await githubService.createRepository(
        repoName,
        project.description,
        isPrivate
      );
    }

    project.githubRepoUrl = githubRepo.html_url;
    project.githubRepoId = githubRepo.id;
    await project.save();

    // Extract and push project files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const projectZipFile = files?.projectFiles?.[0];

    if (projectZipFile) {
      try {
        // Extract ZIP file
        const zip = new AdmZip(projectZipFile.path);
        const zipEntries = zip.getEntries();
        
        // Prepare files for GitHub
        const filesToPush: { path: string; content: string }[] = [];
        
        zipEntries.forEach((entry: any) => {
          if (!entry.isDirectory) {
            const content = entry.getData().toString('utf8');
            filesToPush.push({
              path: entry.entryName,
              content
            });
          }
        });

        // Push files to GitHub
        if (filesToPush.length > 0) {
          await githubService.pushFilesToRepo(
            owner,
            repoName,
            filesToPush,
            `Deploy ${project.name} - ${new Date().toISOString()}`
          );
        }
      } catch (extractError: any) {
        console.error('Error extracting/pushing files:', extractError);
        project.deploymentStatus = 'Failed';
        await project.save();
        return res.status(500).json({ 
          success: false, 
          message: `Failed to push files to GitHub: ${extractError.message}` 
        });
      }
    }

    // Deploy to Vercel if connected
    if (hasVercel) {
      try {
        // Deploy to Vercel
        const deployment = await vercelService.deployFromGitHub(
          project.name,
          githubRepo.html_url,
          project.frameworks[0] || 'other',
          project.githubRepoId
        );

        project.vercelUrl = `https://${deployment.url}`;
        project.vercelProjectId = deployment.projectId;
        project.vercelSettingsUrl = deployment.settingsUrl;
        project.deploymentStatus = 'Deployed';
        project.deploymentHistory.push({
          version: `v${project.deploymentHistory.length + 1}.0.0`,
          deployedAt: new Date(),
          status: 'Success - GitHub + Vercel',
          url: `https://${deployment.url}`
        });
        await project.save();

        res.json({
          success: true,
          message: 'Project deployed successfully to GitHub and Vercel',
          project,
          deployment,
          githubUrl: githubRepo.html_url,
          vercelUrl: `https://${deployment.url}`
        });
      } catch (vercelError: any) {
        // GitHub push succeeded but Vercel failed
        project.deploymentStatus = 'Deployed';
        project.deploymentHistory.push({
          version: `v${project.deploymentHistory.length + 1}.0.0`,
          deployedAt: new Date(),
          status: 'Partial - GitHub only (Vercel failed)',
          url: undefined
        });
        await project.save();

        res.json({ 
          success: true, 
          message: `Code pushed to GitHub successfully. Vercel deployment failed: ${vercelError.message}`,
          githubUrl: githubRepo.html_url,
          warning: 'Vercel deployment failed but code is on GitHub'
        });
      }
    } else {
      // GitHub only deployment
      project.deploymentStatus = 'Deployed';
      project.deploymentHistory.push({
        version: `v${project.deploymentHistory.length + 1}.0.0`,
        deployedAt: new Date(),
        status: 'Success - GitHub only',
        url: undefined
      });
      await project.save();

      res.json({
        success: true,
        message: 'Project deployed successfully to GitHub',
        project,
        githubUrl: githubRepo.html_url,
        note: 'Connect Vercel for automatic hosting'
      });
    }
  } catch (error: any) {
    console.error('Error deploying project:', error);
    
    // Update project status to failed
    try {
      const project = await Project.findById(req.params.projectId);
      if (project) {
        project.deploymentStatus = 'Failed';
        project.deploymentHistory.push({
          version: `v${project.deploymentHistory.length + 1}.0.0`,
          deployedAt: new Date(),
          status: `Failed - ${error.message}`,
          url: undefined
        });
        await project.save();
      }
    } catch (e) {
      console.error('Error updating project status:', e);
    }

    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's projects
router.get('/user/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    
    const projects = await Project.find({ uploadedBy: userId })
      .populate('collaborators', 'name email')
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single project
router.get('/:projectId', async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('collaborators', 'name email')
      .populate('uploadedBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project
router.put('/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: req.body },
      { new: true }
    ).populate('collaborators', 'name email');

    res.json({ success: true, project: updatedProject });
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manual Deploy to Vercel
router.post('/:projectId/deploy-vercel', async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Check if GitHub repo exists
    if (!project.githubRepoUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project must be deployed to GitHub first' 
      });
    }

    // Get integration tokens
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });
    if (!tokens || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vercel not connected. Please connect Vercel in settings.' 
      });
    }

    // Set status to pending
    project.deploymentStatus = 'Pending';
    project.deploymentStep = 'Starting Vercel deployment...';
    project.deploymentProgress = 10;
    await project.save();

    // Return immediately and deploy in background
    res.json({ 
      success: true, 
      message: 'Vercel deployment started',
      project 
    });

    // Deploy to Vercel in background
    setImmediate(async () => {
      try {
        project.deploymentStep = 'Connecting to Vercel...';
        project.deploymentProgress = 30;
        await project.save();

        // In server/routes/projectRoutes.ts, around line 600
const vercelService = new VercelService(tokens.getVercelToken()!);

// Extract owner and repo from githubRepoUrl
const githubRepoUrl = project.githubRepoUrl;
const [owner, repo] = githubRepoUrl
  .replace('https://github.com/', '')
  .replace('http://github.com/', '')
  .replace(/\.git$/, '')
  .split('/');

if (!owner || !repo) {
  throw new Error('Invalid GitHub repository URL');
}

// Get GitHub repository ID
const githubService = new GitHubService(tokens.getGithubToken()!);
const githubRepo = await githubService.getRepository(owner, repo);

if (!githubRepo || !githubRepo.id) {
  throw new Error('Could not find GitHub repository. Please check the repository URL and permissions.');
}

project.deploymentStep = 'Deploying to Vercel...';
project.deploymentProgress = 60;
await project.save();

// Deploy with the GitHub repo ID
const deployment = await vercelService.deployFromGitHub(
  project.name,
  githubRepoUrl,
  project.frameworks[0],
  githubRepo.id
);

        project.vercelUrl = `https://${deployment.url}`;
        project.vercelProjectId = deployment.projectId;
        project.vercelSettingsUrl = deployment.settingsUrl;
        project.deploymentStep = 'Deployed to Vercel ';
        project.deploymentProgress = 100;
        project.deploymentStatus = 'Deployed';
        project.deploymentHistory.push({
          version: `v${project.deploymentHistory.length + 1}.0.0`,
          deployedAt: new Date(),
          status: 'Success - Vercel Deployment',
          url: `https://${deployment.url}`
        });
        await project.save();

        console.log(` Manually deployed to Vercel: ${deployment.url}`);
        console.log(` Settings: ${deployment.settingsUrl}`);
      } catch (error: any) {
        console.error('Vercel deployment failed:', error);
        project.deploymentStatus = 'Failed';
        project.deploymentStep = `Failed: ${error.message}`;
        project.deploymentProgress = 0;
        project.deploymentHistory.push({
          version: `v${project.deploymentHistory.length + 1}.0.0`,
          deployedAt: new Date(),
          status: `Failed - ${error.message}`,
          url: undefined
        });
        await project.save();
      }
    });
  } catch (error: any) {
    console.error('Error starting Vercel deployment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project
router.delete('/:projectId', async (req: AuthRequest, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify project (Faculty only)
router.post('/:projectId/verify', async (req: AuthRequest, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'hod') {
      return res.status(403).json({ success: false, message: 'Only faculty can verify projects' });
    }

    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.isVerified = true;
    project.verifiedBy = req.user._id;
    await project.save();

    res.json({ success: true, message: 'Project verified successfully', project });
  } catch (error: any) {
    console.error('Error verifying project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
