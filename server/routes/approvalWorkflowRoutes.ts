import { Router, Request, Response } from 'express';
import ApprovalWorkflow from '../models/ApprovalWorkflow';
import { authMiddleware } from '../middleware/auth';
import { checkRole } from '../middleware/role';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Create a new approval workflow (HOD, Principal, Shiksan Mantri only)
router.post('/', authMiddleware, checkRole(['hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, contentType, stages, department } = req.body;
    const user = req.user;

    if (!name || !description || !contentType || !stages || stages.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate stages
    for (const stage of stages) {
      if (!stage.stageName || stage.stageOrder === undefined || !stage.requiredRoles || stage.requiredRoles.length === 0) {
        return res.status(400).json({ message: 'Invalid stage configuration' });
      }
    }

    // Get college from user or department
    let collegeId = user.college;
    
    if (!collegeId && user.department) {
      // Try to fetch department and get college from it
      const Department = (await import('../models/Department.js')).default;
      const dept = await Department.findById(user.department);
      if (dept && dept.college) {
        collegeId = dept.college as any;
      }
    }

    const workflow = new ApprovalWorkflow({
      name,
      description,
      contentType,
      stages,
      college: collegeId || null,
      department: department || user.department,
      createdBy: user._id,
      isActive: true
    });

    await workflow.save();
    res.status(201).json(workflow);
  } catch (error: any) {
    console.error('Error creating approval workflow:', error);
    res.status(500).json({ message: 'Error creating approval workflow', error: error.message });
  }
});

// Get all workflows for a college/department
router.get('/', authMiddleware, checkRole(['faculty', 'hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { contentType, isActive } = req.query;

    const query: any = {};

    // Filter by college if available, otherwise by creator
    if (user.college) {
      query.college = user.college;
    } else {
      query.createdBy = user._id;
    }

    // Department-specific or college-wide
    if (user.role === 'faculty' || user.role === 'hod') {
      query.$or = [
        { department: user.department },
        { department: null },
        { createdBy: user._id }
      ];
    }

    if (contentType) {
      query.contentType = contentType;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const workflows = await ApprovalWorkflow.find(query)
      .populate('createdBy', 'name email role')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(workflows);
  } catch (error: any) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ message: 'Error fetching workflows', error: error.message });
  }
});

// Get a specific workflow by ID
router.get('/:id', authMiddleware, checkRole(['faculty', 'hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const workflow = await ApprovalWorkflow.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('department', 'name')
      .populate('college', 'name');

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error: any) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ message: 'Error fetching workflow', error: error.message });
  }
});

// Update a workflow
router.put('/:id', authMiddleware, checkRole(['hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, stages, isActive } = req.body;
    const user = req.user;

    const workflow = await ApprovalWorkflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Check permissions
    if (user.role === 'hod' && workflow.department?.toString() !== user.department?.toString()) {
      return res.status(403).json({ message: 'You can only update workflows for your department' });
    }

    if (name) workflow.name = name;
    if (description) workflow.description = description;
    if (stages) workflow.stages = stages;
    if (isActive !== undefined) workflow.isActive = isActive;

    await workflow.save();
    res.json(workflow);
  } catch (error: any) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ message: 'Error updating workflow', error: error.message });
  }
});

// Delete a workflow
router.delete('/:id', authMiddleware, checkRole(['hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const workflow = await ApprovalWorkflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Check permissions
    if (user.role === 'hod' && workflow.department?.toString() !== user.department?.toString()) {
      return res.status(403).json({ message: 'You can only delete workflows for your department' });
    }

    await ApprovalWorkflow.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workflow deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ message: 'Error deleting workflow', error: error.message });
  }
});

// Toggle workflow active status
router.patch('/:id/toggle-active', authMiddleware, checkRole(['hod', 'principal', 'shiksan_mantri']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const workflow = await ApprovalWorkflow.findById(req.params.id);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Check permissions
    if (user.role === 'hod' && workflow.department?.toString() !== user.department?.toString()) {
      return res.status(403).json({ message: 'You can only modify workflows for your department' });
    }

    workflow.isActive = !workflow.isActive;
    await workflow.save();

    res.json(workflow);
  } catch (error: any) {
    console.error('Error toggling workflow status:', error);
    res.status(500).json({ message: 'Error toggling workflow status', error: error.message });
  }
});

export default router;
