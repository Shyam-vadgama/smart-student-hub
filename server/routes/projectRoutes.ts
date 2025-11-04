import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Project from '../models/Project.js';
import IntegrationTokens from '../models/IntegrationTokens.js';
import { GitHubService } from '../services/githubService.js';
import { VercelService } from '../services/vercelService.js';
import { AuthRequest } from '../types.js';

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

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const screenshots = files.screenshots?.map(file => `/uploads/projects/${file.filename}`) || [];

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
      deploymentStatus: deploymentType === 'Portfolio Only' ? 'Not Deployed' : 'Pending'
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Deploy project to GitHub and Vercel
router.post('/deploy/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Get integration tokens
    const tokens = await IntegrationTokens.findOne({ userId: req.user._id });
    if (!tokens || !tokens.githubToken || !tokens.vercelToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please connect GitHub and Vercel accounts first' 
      });
    }

    project.deploymentStatus = 'Pending';
    await project.save();

    // Initialize services
    const githubService = new GitHubService(tokens.getGithubToken()!);
    const vercelService = new VercelService(tokens.getVercelToken()!);

    // Create GitHub repository
    const repoName = project.name.toLowerCase().replace(/\s+/g, '-');
    const githubRepo = await githubService.createRepository(
      repoName,
      project.description,
      false
    );

    project.githubRepoUrl = githubRepo.html_url;
    await project.save();

    // Deploy to Vercel
    const deployment = await vercelService.deployFromGitHub(
      project.name,
      githubRepo.html_url,
      project.frameworks[0]
    );

    project.vercelUrl = `https://${deployment.url}`;
    project.deploymentStatus = 'Deployed';
    project.deploymentHistory.push({
      version: '1.0.0',
      deployedAt: new Date(),
      status: 'Success',
      url: `https://${deployment.url}`
    });
    await project.save();

    res.json({
      success: true,
      message: 'Project deployed successfully',
      project,
      deployment
    });
  } catch (error: any) {
    console.error('Error deploying project:', error);
    
    // Update project status to failed
    try {
      const project = await Project.findById(req.params.projectId);
      if (project) {
        project.deploymentStatus = 'Failed';
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

// Delete project
router.delete('/:projectId', async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Project.findByIdAndDelete(projectId);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
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
