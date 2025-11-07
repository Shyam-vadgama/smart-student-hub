import express, { Request, Response } from 'express';
import NAACReport from '../models/NAACReport.js';
import { isAuthenticated, hasRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/naac-reports
 * @desc    Get all NAAC reports (filtered by role)
 * @access  HOD, Principal, Admin
 */
router.get('/', isAuthenticated, hasRole(['hod', 'principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const { status, academicYear, department } = req.query;
    const user = req.user!;
    
    let query: any = {};
    
    // Filter based on role
    if (user.role === 'hod') {
      // HOD can only see their department's reports
      query.department = user.department;
    } else if (user.role === 'principal') {
      // Principal can see all reports from their college
      if (user.college) {
        query.college = user.college;
      }
    }
    // shiksan_mantri can see all reports
    
    // Apply additional filters
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;
    if (department) query.department = department;
    
    const reports = await NAACReport.find(query)
      .populate('department', 'name')
      .populate('submittedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error: any) {
    console.error('Error fetching NAAC reports:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/naac-reports/:id
 * @desc    Get a specific NAAC report
 * @access  HOD, Principal, Admin
 */
router.get('/:id', isAuthenticated, hasRole(['hod', 'principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id)
      .populate('department', 'name')
      .populate('college', 'name')
      .populate('submittedBy', 'name email role')
      .populate('verifiedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .populate('comments.user', 'name role');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check access
    const user = req.user!;
    if (user.role === 'hod' && report.department.toString() !== user.department?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(report);
  } catch (error: any) {
    console.error('Error fetching NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports
 * @desc    Create a new NAAC report (HOD only)
 * @access  HOD
 */
router.post('/', isAuthenticated, hasRole(['hod']), async (req, res) => {
  try {
    const user = req.user!;
    
    // Validate user has required fields
    if (!user.department) {
      return res.status(400).json({ message: 'User must be assigned to a department' });
    }
    
    // If user doesn't have college, try to get it from department
    let collegeId = user.college;
    
    if (!collegeId && user.department) {
      // Try to fetch department and get college from it
      const Department = (await import('../models/Department.js')).default;
      const dept = await Department.findById(user.department);
      if (dept && dept.college) {
        collegeId = dept.college as any; // Convert ObjectId to compatible type
      }
    }
    
    const reportData = {
      ...req.body,
      department: user.department,
      college: collegeId || null, // Allow null if still not found
      submittedBy: user._id,
      status: 'draft',
    };
    
    const report = new NAACReport(reportData);
    await report.save();
    
    const populatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email');
    
    res.status(201).json(populatedReport);
  } catch (error: any) {
    console.error('Error creating NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/naac-reports/:id
 * @desc    Update a NAAC report
 * @access  HOD (own reports), Principal (for verification)
 */
router.put('/:id', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const user = req.user!;
    
    // HOD can only update their own department's draft/rejected reports
    if (user.role === 'hod') {
      if (report.department.toString() !== user.department?.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (report.status !== 'draft' && report.status !== 'rejected') {
        return res.status(400).json({ message: 'Can only edit draft or rejected reports' });
      }
    }
    
    // Update fields
    Object.assign(report, req.body);
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email')
      .populate('verifiedBy', 'name email');
    
    res.json(updatedReport);
  } catch (error: any) {
    console.error('Error updating NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports/:id/submit
 * @desc    Submit a NAAC report to Principal (HOD only)
 * @access  HOD
 */
router.post('/:id/submit', isAuthenticated, hasRole(['hod']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const user = req.user!;
    
    if (report.department.toString() !== user.department?.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (report.status !== 'draft' && report.status !== 'rejected') {
      return res.status(400).json({ message: 'Can only submit draft or rejected reports' });
    }
    
    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email');
    
    res.json({ message: 'Report submitted successfully', report: updatedReport });
  } catch (error: any) {
    console.error('Error submitting NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports/:id/verify
 * @desc    Verify a NAAC report (Principal only)
 * @access  Principal
 */
router.post('/:id/verify', isAuthenticated, hasRole(['principal']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (report.status !== 'submitted') {
      return res.status(400).json({ message: 'Can only verify submitted reports' });
    }
    
    const user = req.user!;
    
    report.status = 'verified';
    report.verifiedBy = user._id;
    report.verifiedAt = new Date();
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email')
      .populate('verifiedBy', 'name email');
    
    res.json({ message: 'Report verified successfully', report: updatedReport });
  } catch (error: any) {
    console.error('Error verifying NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports/:id/approve
 * @desc    Approve a NAAC report (Principal only)
 * @access  Principal, Admin
 */
router.post('/:id/approve', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (report.status !== 'verified') {
      return res.status(400).json({ message: 'Can only approve verified reports' });
    }
    
    const user = req.user!;
    
    report.status = 'approved';
    report.approvedBy = user._id;
    report.approvedAt = new Date();
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .populate('approvedBy', 'name email');
    
    res.json({ message: 'Report approved successfully', report: updatedReport });
  } catch (error: any) {
    console.error('Error approving NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports/:id/reject
 * @desc    Reject a NAAC report (Principal only)
 * @access  Principal
 */
router.post('/:id/reject', isAuthenticated, hasRole(['principal']), async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    if (report.status !== 'submitted' && report.status !== 'verified') {
      return res.status(400).json({ message: 'Can only reject submitted or verified reports' });
    }
    
    report.status = 'rejected';
    report.rejectionReason = reason;
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('department', 'name')
      .populate('submittedBy', 'name email');
    
    res.json({ message: 'Report rejected', report: updatedReport });
  } catch (error: any) {
    console.error('Error rejecting NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/naac-reports/:id/comments
 * @desc    Add a comment to a NAAC report
 * @access  HOD, Principal, Admin
 */
router.post('/:id/comments', isAuthenticated, hasRole(['hod', 'principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const { comment } = req.body;
    
    if (!comment) {
      return res.status(400).json({ message: 'Comment is required' });
    }
    
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const user = req.user!;
    
    report.comments.push({
      user: user._id,
      role: user.role,
      comment,
      timestamp: new Date(),
    } as any);
    
    await report.save();
    
    const updatedReport = await NAACReport.findById(report._id)
      .populate('comments.user', 'name role');
    
    res.json({ message: 'Comment added', comments: updatedReport?.comments });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/naac-reports/:id
 * @desc    Delete a NAAC report (HOD can delete draft, Principal can delete any)
 * @access  HOD, Principal
 */
router.delete('/:id', isAuthenticated, hasRole(['hod', 'principal']), async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const user = req.user!;
    
    // HOD can only delete draft reports from their department
    if (user.role === 'hod') {
      if (report.department.toString() !== user.department?.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (report.status !== 'draft') {
        return res.status(400).json({ message: 'Can only delete draft reports' });
      }
    }
    
    await report.deleteOne();
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting NAAC report:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/naac-reports/stats/overview
 * @desc    Get NAAC reports statistics
 * @access  Principal, Admin
 */
router.get('/stats/overview', isAuthenticated, hasRole(['principal', 'shiksan_mantri']), async (req, res) => {
  try {
    const user = req.user!;
    let query: any = {};
    
    if (user.role === 'principal' && user.college) {
      query.college = user.college;
    }
    
    const [
      totalReports,
      draftReports,
      submittedReports,
      verifiedReports,
      approvedReports,
      rejectedReports,
      avgCGPA,
    ] = await Promise.all([
      NAACReport.countDocuments(query),
      NAACReport.countDocuments({ ...query, status: 'draft' }),
      NAACReport.countDocuments({ ...query, status: 'submitted' }),
      NAACReport.countDocuments({ ...query, status: 'verified' }),
      NAACReport.countDocuments({ ...query, status: 'approved' }),
      NAACReport.countDocuments({ ...query, status: 'rejected' }),
      NAACReport.aggregate([
        { $match: query },
        { $group: { _id: null, avgCGPA: { $avg: '$cgpa' } } },
      ]),
    ]);
    
    res.json({
      totalReports,
      draftReports,
      submittedReports,
      verifiedReports,
      approvedReports,
      rejectedReports,
      avgCGPA: avgCGPA[0]?.avgCGPA || 0,
    });
  } catch (error: any) {
    console.error('Error fetching NAAC stats:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/naac-reports/:id/download-pdf
 * @desc    Download NAAC report as PDF
 * @access  HOD (own reports), Principal
 */
router.get('/:id/download-pdf', isAuthenticated, async (req, res) => {
  try {
    const report = await NAACReport.findById(req.params.id)
      .populate('department', 'name')
      .populate('college', 'name')
      .populate('submittedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if report is approved or verified
    if (report.status !== 'approved' && report.status !== 'verified') {
      return res.status(403).json({ message: 'Only approved or verified reports can be downloaded' });
    }
    
    // Generate simple HTML for PDF (you can use a library like puppeteer or pdfkit for better PDFs)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 3px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; color: #2c3e50; }
    .header p { margin: 5px 0; color: #7f8c8d; }
    .section { margin: 30px 0; page-break-inside: avoid; }
    .section h2 { background: #3498db; color: white; padding: 10px; margin: 0 0 15px 0; }
    .section h3 { color: #2c3e50; border-bottom: 2px solid #ecf0f1; padding-bottom: 5px; }
    .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
    .data-item { background: #f8f9fa; padding: 12px; border-left: 4px solid #3498db; }
    .data-item label { font-weight: bold; color: #555; display: block; margin-bottom: 5px; }
    .data-item value { font-size: 1.2em; color: #2c3e50; }
    .category-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 15px 0; }
    .category-item { background: #ecf0f1; padding: 10px; text-align: center; border-radius: 5px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #7f8c8d; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .status-approved { background: #27ae60; color: white; }
    .status-verified { background: #f39c12; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${(report.college as any)?.name || 'College Name'}</h1>
    <h2>NAAC ACCREDITATION REPORT</h2>
    <p>Academic Year: ${report.academicYear}</p>
    <p>Department: ${(report.department as any)?.name || 'Department'}</p>
    <p>Report Type: ${report.reportType.toUpperCase()}</p>
    <p><span class="status-badge status-${report.status}">${report.status.toUpperCase()}</span></p>
  </div>

  <div class="section">
    <h2>1. STUDENT PROFILE & ENROLLMENT</h2>
    <div class="data-grid">
      <div class="data-item">
        <label>Total Admitted Students</label>
        <value>${report.studentData?.totalAdmitted || 0}</value>
      </div>
      <div class="data-item">
        <label>Pass Percentage</label>
        <value>${report.studentData?.passPercentage || 0}%</value>
      </div>
      <div class="data-item">
        <label>Dropout Rate</label>
        <value>${report.studentData?.dropoutRate || 0}%</value>
      </div>
    </div>
    
    <h3>Category-wise Distribution</h3>
    <div class="category-grid">
      <div class="category-item">
        <label>General</label>
        <value>${report.studentData?.categoryWise?.general || 0}</value>
      </div>
      <div class="category-item">
        <label>OBC</label>
        <value>${report.studentData?.categoryWise?.obc || 0}</value>
      </div>
      <div class="category-item">
        <label>SC</label>
        <value>${report.studentData?.categoryWise?.sc || 0}</value>
      </div>
      <div class="category-item">
        <label>ST</label>
        <value>${report.studentData?.categoryWise?.st || 0}</value>
      </div>
      <div class="category-item">
        <label>International</label>
        <value>${report.studentData?.categoryWise?.international || 0}</value>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>2. STUDENT ACHIEVEMENTS</h2>
    <div class="data-grid">
      <div class="data-item">
        <label>Hackathons Participated</label>
        <value>${report.achievements?.hackathons || 0}</value>
      </div>
      <div class="data-item">
        <label>Research Papers Published</label>
        <value>${report.achievements?.researchPapers || 0}</value>
      </div>
      <div class="data-item">
        <label>Startups Founded</label>
        <value>${report.achievements?.startups || 0}</value>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>3. ACADEMIC PERFORMANCE</h2>
    <div class="data-grid">
      <div class="data-item">
        <label>Average Attendance</label>
        <value>${report.academicRecords?.averageAttendance || 0}%</value>
      </div>
      <div class="data-item">
        <label>Pass Rate</label>
        <value>${report.academicRecords?.passRate || 0}%</value>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>4. PLACEMENT & INTERNSHIPS</h2>
    <div class="data-grid">
      <div class="data-item">
        <label>Placement Percentage</label>
        <value>${report.placementData?.placementPercentage || 0}%</value>
      </div>
      <div class="data-item">
        <label>Total Students Placed</label>
        <value>${report.placementData?.totalPlaced || 0}</value>
      </div>
      <div class="data-item">
        <label>Highest Package</label>
        <value>₹${report.placementData?.highestPackage || 0} LPA</value>
      </div>
      <div class="data-item">
        <label>Average Package</label>
        <value>₹${report.placementData?.averagePackage || 0} LPA</value>
      </div>
      <div class="data-item">
        <label>Total Internships</label>
        <value>${report.placementData?.internships || 0}</value>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>5. FACULTY PROFILE</h2>
    <div class="data-grid">
      <div class="data-item">
        <label>Total Faculty</label>
        <value>${report.facultyData?.totalFaculty || 0}</value>
      </div>
      <div class="data-item">
        <label>PhD Holders</label>
        <value>${report.facultyData?.phdHolders || 0}</value>
      </div>
      <div class="data-item">
        <label>MTech Holders</label>
        <value>${report.facultyData?.mtechHolders || 0}</value>
      </div>
      <div class="data-item">
        <label>Student-Teacher Ratio</label>
        <value>${report.facultyData?.studentTeacherRatio || 0}:1</value>
      </div>
    </div>
  </div>

  <div class="footer">
    <p><strong>Report Status:</strong> ${report.status.toUpperCase()}</p>
    <p><strong>Submitted By:</strong> ${(report.submittedBy as any)?.name || 'N/A'}</p>
    <p><strong>Submitted On:</strong> ${report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}</p>
    ${report.approvedBy ? `<p><strong>Approved By:</strong> Principal</p>` : ''}
    ${report.approvedAt ? `<p><strong>Approved On:</strong> ${new Date(report.approvedAt).toLocaleDateString()}</p>` : ''}
    <p style="margin-top: 20px; font-size: 0.9em;">Generated on: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;
    
    // Set headers for PDF download
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="NAAC-Report-${report.academicYear}-${(report.department as any)?.name || 'Report'}.html"`);
    res.send(html);
    
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
