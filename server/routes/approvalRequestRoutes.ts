import { Router, Request, Response } from 'express';
import ApprovalRequest from '../models/ApprovalRequest';
import ApprovalWorkflow from '../models/ApprovalWorkflow';
import Project from '../models/Project';
import Achievement from '../models/Achievement';
import Resume from '../models/Resume';
import Marks from '../models/Marks';
import PublicPortfolio from '../models/PublicPortfolio';
import UserModel from '../models/User';
import Subject from '../models/Subject';
import Department from '../models/Department';
import College from '../models/College';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Helper function to get content model
function getContentModel(contentType: string) {
  switch (contentType) {
    case 'project':
      return Project;
    case 'achievement':
      return Achievement;
    case 'resume':
      return Resume;
    case 'marks':
      return Marks;
    default:
      return null;
  }
}

// Helper function to update public portfolio
async function updatePublicPortfolio(studentId: string, contentType: string, contentId: string, approved: boolean) {
  try {
    const student = await UserModel.findById(studentId)
      .populate('department')
      .populate('college')
      .populate('profile');

    if (!student) return;

    let portfolio = await PublicPortfolio.findOne({ student: studentId });

    if (!portfolio) {
      // Create new portfolio
      portfolio = new PublicPortfolio({
        student: studentId,
        studentName: student.name,
        studentEmail: student.email,
        department: student.department._id,
        departmentName: student.department.name,
        college: student.college._id,
        collegeName: student.college.name,
        semester: student.semester,
        course: student.profile?.course,
        batch: student.profile?.batch,
        projects: [],
        achievements: [],
        marks: [],
        totalProjects: 0,
        totalAchievements: 0,
        isPublic: true
      });
    }

    if (approved) {
      // Add content to portfolio
      if (contentType === 'project') {
        const project = await Project.findById(contentId);
        if (project) {
          // Remove if already exists
          portfolio.projects = portfolio.projects.filter(p => p.projectId.toString() !== contentId);
          
          portfolio.projects.push({
            projectId: project._id,
            name: project.name,
            description: project.description,
            languages: project.languages,
            frameworks: project.frameworks,
            tags: project.tags,
            projectType: project.projectType,
            screenshots: project.screenshots,
            demoVideoUrl: project.demoVideoUrl,
            githubRepoUrl: project.githubRepoUrl,
            vercelUrl: project.vercelUrl,
            approvedAt: new Date()
          });
          portfolio.totalProjects = portfolio.projects.length;
        }
      } else if (contentType === 'achievement') {
        const achievement = await Achievement.findById(contentId);
        if (achievement) {
          // Remove if already exists
          portfolio.achievements = portfolio.achievements.filter(a => a.achievementId.toString() !== contentId);
          
          portfolio.achievements.push({
            achievementId: achievement._id,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category,
            type: achievement.type,
            certificatePath: achievement.certificatePath,
            media: achievement.media.map(m => ({
              url: m.url,
              type: m.type,
              caption: m.caption
            })),
            approvedAt: new Date()
          });
          portfolio.totalAchievements = portfolio.achievements.length;
        }
      } else if (contentType === 'resume') {
        const resume = await Resume.findById(contentId);
        if (resume) {
          portfolio.resume = {
            resumeId: resume._id,
            template: resume.template,
            data: resume.data,
            approvedAt: new Date()
          };
        }
      } else if (contentType === 'marks') {
        const marks = await Marks.findById(contentId).populate('subject');
        if (marks) {
          // Remove if already exists
          portfolio.marks = portfolio.marks.filter(m => m.subject !== marks.subject.name);
          
          portfolio.marks.push({
            subject: marks.subject.name,
            marks: marks.marks,
            examType: marks.examType,
            semester: student.semester || 0,
            approvedAt: new Date()
          });

          // Calculate average marks
          const totalMarks = portfolio.marks.reduce((sum, m) => sum + m.marks, 0);
          portfolio.averageMarks = totalMarks / portfolio.marks.length;
        }
      }
    } else {
      // Remove content from portfolio if rejected
      if (contentType === 'project') {
        portfolio.projects = portfolio.projects.filter(p => p.projectId.toString() !== contentId);
        portfolio.totalProjects = portfolio.projects.length;
      } else if (contentType === 'achievement') {
        portfolio.achievements = portfolio.achievements.filter(a => a.achievementId.toString() !== contentId);
        portfolio.totalAchievements = portfolio.achievements.length;
      } else if (contentType === 'resume') {
        portfolio.resume = undefined;
      } else if (contentType === 'marks') {
        const marks = await Marks.findById(contentId).populate('subject');
        if (marks) {
          portfolio.marks = portfolio.marks.filter(m => m.subject !== marks.subject.name);
          
          if (portfolio.marks.length > 0) {
            const totalMarks = portfolio.marks.reduce((sum, m) => sum + m.marks, 0);
            portfolio.averageMarks = totalMarks / portfolio.marks.length;
          } else {
            portfolio.averageMarks = undefined;
          }
        }
      }
    }

    portfolio.lastUpdated = new Date();
    await portfolio.save();
  } catch (error) {
    console.error('Error updating public portfolio:', error);
  }
}

// Student: Request approval for content
router.post('/request', authMiddleware, checkRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const { contentType, contentId } = req.body;
    const user = req.user;

    if (!contentType || !contentId) {
      return res.status(400).json({ message: 'Content type and ID are required' });
    }

    // Check if content exists and belongs to student
    const ContentModel = getContentModel(contentType);
    if (!ContentModel) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    const content: any = await ContentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check ownership
    const ownerField = contentType === 'project' ? 'uploadedBy' : contentType === 'resume' ? 'user' : 'student';
    if (content[ownerField].toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only request approval for your own content' });
    }

    // Check if already has an active approval request
    const existingRequest = await ApprovalRequest.findOne({
      contentId,
      contentType,
      overallStatus: { $in: ['pending', 'in_progress'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'An approval request is already in progress for this content' });
    }

    // Find applicable workflow
    const workflow = await ApprovalWorkflow.findOne({
      college: user.college,
      $or: [
        { department: user.department },
        { department: null }
      ],
      contentType: { $in: [contentType, 'all'] },
      isActive: true
    }).sort({ department: -1 }); // Prioritize department-specific workflows

    if (!workflow) {
      return res.status(404).json({ message: 'No active approval workflow found for this content type' });
    }

    // Create approval request
    const approvalRequest = new ApprovalRequest({
      student: user._id,
      contentType,
      contentId,
      workflow: workflow._id,
      currentStage: 0,
      overallStatus: 'pending',
      stages: workflow.stages.map(stage => ({
        stageName: stage.stageName,
        stageOrder: stage.stageOrder,
        status: 'pending',
        requiredRoles: stage.requiredRoles,
        requireAll: stage.requireAll,
        actions: []
      })),
      college: user.college,
      department: user.department
    });

    await approvalRequest.save();

    // Update content approval status
    content.approvalStatus = 'pending';
    content.approvalRequest = approvalRequest._id;
    await content.save();

    res.status(201).json(approvalRequest);
  } catch (error: any) {
    console.error('Error creating approval request:', error);
    res.status(500).json({ message: 'Error creating approval request', error: error.message });
  }
});

// Get approval requests (filtered by role)
router.get('/', authMiddleware, checkRole(['student', 'faculty', 'hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { status, contentType } = req.query;

    let query: any = {};

    if (user.role === 'student') {
      // Students see only their own requests
      query.student = user._id;
    } else {
      // Admins see requests for their college/department
      query.college = user.college;
      
      if (user.role === 'faculty' || user.role === 'hod') {
        query.department = user.department;
      }

      // Filter by requests that need this role's approval
      query['stages.requiredRoles'] = user.role;
      query['stages.status'] = 'pending';
    }

    if (status) {
      query.overallStatus = status;
    }

    if (contentType) {
      query.contentType = contentType;
    }

    const requests = await ApprovalRequest.find(query)
      .populate('student', 'name email')
      .populate('workflow', 'name')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error: any) {
    console.error('Error fetching approval requests:', error);
    res.status(500).json({ message: 'Error fetching approval requests', error: error.message });
  }
});

// Get a specific approval request
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const request = await ApprovalRequest.findById(req.params.id)
      .populate('student', 'name email')
      .populate('workflow')
      .populate('stages.actions.approver', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    // Check permissions
    if (user.role === 'student' && request.student._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only view your own approval requests' });
    }

    res.json(request);
  } catch (error: any) {
    console.error('Error fetching approval request:', error);
    res.status(500).json({ message: 'Error fetching approval request', error: error.message });
  }
});

// Approve/Reject a stage
router.post('/:id/action', authMiddleware, checkRole(['faculty', 'hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const { action, comments } = req.body;
    const user = req.user;

    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approved" or "rejected"' });
    }

    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (request.overallStatus !== 'pending' && request.overallStatus !== 'in_progress') {
      return res.status(400).json({ message: 'This approval request has already been completed' });
    }

    // Get current stage
    const currentStage = request.stages[request.currentStage];

    if (!currentStage) {
      return res.status(400).json({ message: 'Invalid stage' });
    }

    // Check if user's role is required for this stage
    if (!currentStage.requiredRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Your role is not authorized to approve this stage' });
    }

    // Check if user has already acted on this stage
    const existingAction = currentStage.actions.find(a => a.approver.toString() === user._id.toString());
    if (existingAction) {
      return res.status(400).json({ message: 'You have already acted on this stage' });
    }

    // Add action
    currentStage.actions.push({
      approver: user._id,
      approverRole: user.role,
      action,
      comments,
      actionDate: new Date()
    });

    // Check if stage is complete
    let stageComplete = false;

    if (action === 'rejected') {
      // If anyone rejects, the stage is rejected
      currentStage.status = 'rejected';
      request.overallStatus = 'rejected';
      stageComplete = true;
    } else {
      // Check if all required approvals are received
      if (currentStage.requireAll) {
        // All roles must approve
        const approvedRoles = currentStage.actions
          .filter(a => a.action === 'approved')
          .map(a => a.approverRole);
        
        if (currentStage.requiredRoles.every(role => approvedRoles.includes(role))) {
          currentStage.status = 'approved';
          currentStage.completedAt = new Date();
          stageComplete = true;
        }
      } else {
        // Any one role can approve
        currentStage.status = 'approved';
        currentStage.completedAt = new Date();
        stageComplete = true;
      }
    }

    if (stageComplete) {
      if (currentStage.status === 'rejected') {
        // Update content status
        const ContentModel = getContentModel(request.contentType);
        if (ContentModel) {
          await ContentModel.findByIdAndUpdate(request.contentId, {
            approvalStatus: 'rejected',
            isPubliclyVisible: false
          });
        }

        request.completedAt = new Date();
      } else if (request.currentStage < request.stages.length - 1) {
        // Move to next stage
        request.currentStage += 1;
        request.overallStatus = 'in_progress';
      } else {
        // All stages approved
        request.overallStatus = 'approved';
        request.completedAt = new Date();

        // Update content status
        const ContentModel = getContentModel(request.contentType);
        if (ContentModel) {
          await ContentModel.findByIdAndUpdate(request.contentId, {
            approvalStatus: 'approved',
            approvedAt: new Date(),
            approvedBy: user._id,
            isPubliclyVisible: true
          });
        }

        // Update public portfolio
        await updatePublicPortfolio(request.student.toString(), request.contentType, request.contentId.toString(), true);
      }
    }

    await request.save();

    const populatedRequest = await ApprovalRequest.findById(request._id)
      .populate('student', 'name email')
      .populate('workflow')
      .populate('stages.actions.approver', 'name email role');

    res.json(populatedRequest);
  } catch (error: any) {
    console.error('Error processing approval action:', error);
    res.status(500).json({ message: 'Error processing approval action', error: error.message });
  }
});

// Cancel an approval request (student only)
router.delete('/:id', authMiddleware, checkRole(['student']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const request = await ApprovalRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (request.student.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own approval requests' });
    }

    if (request.overallStatus === 'approved' || request.overallStatus === 'rejected') {
      return res.status(400).json({ message: 'Cannot cancel a completed approval request' });
    }

    // Update content status
    const ContentModel = getContentModel(request.contentType);
    if (ContentModel) {
      await ContentModel.findByIdAndUpdate(request.contentId, {
        approvalStatus: 'not_requested',
        approvalRequest: null
      });
    }

    await ApprovalRequest.findByIdAndDelete(req.params.id);

    res.json({ message: 'Approval request cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling approval request:', error);
    res.status(500).json({ message: 'Error cancelling approval request', error: error.message });
  }
});

export default router;
