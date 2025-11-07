import { Router, Request, Response } from 'express';
import PublicPortfolio from '../models/PublicPortfolio';
import UserModel from '../models/User';
import { authMiddleware, optionalAuth } from '../middleware/auth';

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

// Get all public portfolios (no auth required, with filters)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { college, department, search, page = 1, limit = 20 } = req.query;

    const query: any = { isPublic: true };

    if (college) {
      query.college = college;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { studentEmail: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const portfolios = await PublicPortfolio.find(query)
      .select('-__v')
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await PublicPortfolio.countDocuments(query);

    res.json({
      portfolios,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching public portfolios:', error);
    res.status(500).json({ message: 'Error fetching public portfolios', error: error.message });
  }
});

// Get a specific public portfolio by student ID (no auth required)
router.get('/student/:studentId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const portfolio = await PublicPortfolio.findOne({ 
      student: req.params.studentId,
      isPublic: true 
    })
      .populate('department', 'name')
      .populate('college', 'name');

    if (!portfolio) {
      return res.status(404).json({ message: 'Public portfolio not found' });
    }

    res.json(portfolio);
  } catch (error: any) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Error fetching public portfolio', error: error.message });
  }
});

// Get public portfolio by email (no auth required)
router.get('/email/:email', optionalAuth, async (req: Request, res: Response) => {
  try {
    const portfolio = await PublicPortfolio.findOne({ 
      studentEmail: req.params.email.toLowerCase(),
      isPublic: true 
    })
      .populate('department', 'name')
      .populate('college', 'name');

    if (!portfolio) {
      return res.status(404).json({ message: 'Public portfolio not found' });
    }

    res.json(portfolio);
  } catch (error: any) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Error fetching public portfolio', error: error.message });
  }
});

// Student: Get their own portfolio (auth required)
router.get('/my-portfolio', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    let portfolio = await PublicPortfolio.findOne({ student: user._id })
      .populate('department', 'name')
      .populate('college', 'name');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found. Upload and get approval for content to create your portfolio.' });
    }

    res.json(portfolio);
  } catch (error: any) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
  }
});

// Student: Update portfolio settings (bio, skills, social links)
router.patch('/my-portfolio/settings', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { bio, skills, interests, socialLinks, isPublic } = req.body;

    let portfolio = await PublicPortfolio.findOne({ student: user._id });

    if (!portfolio) {
      // Create a basic portfolio if it doesn't exist
      const student = await UserModel.findById(user._id)
        .populate('department')
        .populate('college')
        .populate('profile');

      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      portfolio = new PublicPortfolio({
        student: user._id,
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

    // Update fields
    if (bio !== undefined) portfolio.bio = bio;
    if (skills !== undefined) portfolio.skills = skills;
    if (interests !== undefined) portfolio.interests = interests;
    if (socialLinks !== undefined) portfolio.socialLinks = socialLinks;
    if (isPublic !== undefined) portfolio.isPublic = isPublic;

    portfolio.lastUpdated = new Date();
    await portfolio.save();

    res.json(portfolio);
  } catch (error: any) {
    console.error('Error updating portfolio settings:', error);
    res.status(500).json({ message: 'Error updating portfolio settings', error: error.message });
  }
});

// Get portfolio statistics for a college/department
router.get('/stats', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { college, department } = req.query;

    const query: any = { isPublic: true };

    if (college) {
      query.college = college;
    }

    if (department) {
      query.department = department;
    }

    const totalPortfolios = await PublicPortfolio.countDocuments(query);
    
    const portfolios = await PublicPortfolio.find(query);

    const totalProjects = portfolios.reduce((sum, p) => sum + p.totalProjects, 0);
    const totalAchievements = portfolios.reduce((sum, p) => sum + p.totalAchievements, 0);
    
    const portfoliosWithMarks = portfolios.filter(p => p.averageMarks !== undefined);
    const averageMarks = portfoliosWithMarks.length > 0
      ? portfoliosWithMarks.reduce((sum, p) => sum + (p.averageMarks || 0), 0) / portfoliosWithMarks.length
      : 0;

    // Top students by projects
    const topByProjects = portfolios
      .sort((a, b) => b.totalProjects - a.totalProjects)
      .slice(0, 10)
      .map(p => ({
        studentName: p.studentName,
        studentEmail: p.studentEmail,
        totalProjects: p.totalProjects,
        studentId: p.student
      }));

    // Top students by achievements
    const topByAchievements = portfolios
      .sort((a, b) => b.totalAchievements - a.totalAchievements)
      .slice(0, 10)
      .map(p => ({
        studentName: p.studentName,
        studentEmail: p.studentEmail,
        totalAchievements: p.totalAchievements,
        studentId: p.student
      }));

    res.json({
      totalPortfolios,
      totalProjects,
      totalAchievements,
      averageMarks: Math.round(averageMarks * 100) / 100,
      topByProjects,
      topByAchievements
    });
  } catch (error: any) {
    console.error('Error fetching portfolio stats:', error);
    res.status(500).json({ message: 'Error fetching portfolio stats', error: error.message });
  }
});

// Search portfolios by skills
router.get('/search/skills', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { skills, college, department } = req.query;

    if (!skills) {
      return res.status(400).json({ message: 'Skills parameter is required' });
    }

    const skillsArray = (skills as string).split(',').map(s => s.trim());

    const query: any = {
      isPublic: true,
      skills: { $in: skillsArray.map(s => new RegExp(s, 'i')) }
    };

    if (college) {
      query.college = college;
    }

    if (department) {
      query.department = department;
    }

    const portfolios = await PublicPortfolio.find(query)
      .select('studentName studentEmail skills totalProjects totalAchievements student')
      .sort({ totalProjects: -1, totalAchievements: -1 });

    res.json(portfolios);
  } catch (error: any) {
    console.error('Error searching portfolios by skills:', error);
    res.status(500).json({ message: 'Error searching portfolios', error: error.message });
  }
});

export default router;
