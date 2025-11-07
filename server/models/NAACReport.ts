import mongoose, { Schema, Document } from 'mongoose';

export interface INAACReport extends Document {
  department: mongoose.Types.ObjectId;
  college: mongoose.Types.ObjectId;
  academicYear: string;
  reportType: 'naac' | 'nba' | 'both';
  status: 'draft' | 'submitted' | 'verified' | 'rejected' | 'approved';
  
  // Student Profile & Enrollment Data
  studentData: {
    totalAdmitted: number;
    yearWiseAdmission: Array<{ year: string; count: number }>;
    categoryWise: {
      general: number;
      obc: number;
      sc: number;
      st: number;
      international: number;
    };
    dropoutRate: number;
    passPercentage: number;
  };
  
  // Student Achievements
  achievements: {
    awards: Array<{
      title: string;
      level: 'institute' | 'state' | 'national' | 'international';
      studentName: string;
      date: Date;
    }>;
    hackathons: number;
    researchPapers: number;
    certifications: Array<{
      platform: string; // NPTEL, Coursera, etc.
      count: number;
    }>;
    startups: number;
  };
  
  // Academic Records
  academicRecords: {
    averageAttendance: number;
    passRate: number;
    subjectPerformance: Array<{
      subject: string;
      averageMarks: number;
      passRate: number;
    }>;
  };
  
  // Placement & Internship Data
  placementData: {
    placementPercentage: number;
    totalPlaced: number;
    companies: Array<{
      name: string;
      studentsPlaced: number;
    }>;
    highestPackage: number;
    averagePackage: number;
    internships: number;
    internshipDomains: string[];
  };
  
  // Feedback Reports
  feedbackData: {
    studentFeedback: {
      averageRating: number;
      totalResponses: number;
    };
    alumniFeedback: {
      averageRating: number;
      totalResponses: number;
    };
    employerFeedback: {
      averageRating: number;
      totalResponses: number;
    };
  };
  
  // Extracurricular & Extension Activities
  extracurricular: {
    nssActivities: number;
    nccActivities: number;
    communityServices: number;
    clubsCount: number;
    eventsParticipation: number;
  };
  
  // Teaching-Learning & Faculty Data
  facultyData: {
    totalFaculty: number;
    phdHolders: number;
    mtechHolders: number;
    facultyAchievements: number;
    facultyResearch: number;
    studentTeacherRatio: number;
    mentoringRecords: number;
  };
  
  // NBA Specific Data
  nbaSpecificData?: {
    // PO-CO Mapping
    poCo: {
      programOutcomes: number;
      courseOutcomes: number;
      attainmentMatrix: Array<{
        course: string;
        po: string;
        attainment: number;
      }>;
    };
    
    // Course Files
    courseFiles: {
      syllabusCount: number;
      lecturePlansCount: number;
      assignmentsCount: number;
      attainmentCalculated: boolean;
    };
    
    // Student Performance
    studentPerformance: {
      internalMarksAvg: number;
      finalMarksAvg: number;
      coAttainment: number;
      weakStudentsIdentified: number;
    };
    
    // Industry & Internship
    industryRecords: {
      internshipLogs: number;
      industryVisits: number;
      mous: number;
    };
    
    // Projects & Innovation
    projects: {
      finalYearProjects: number;
      miniProjects: number;
      researchPublications: number;
      patentsFiled: number;
    };
    
    // Professional Bodies
    professionalBodies: {
      ieeeMembers: number;
      isteMembers: number;
      csiMembers: number;
      activities: number;
    };
  };
  
  // NAAC Criteria (7 Criteria)
  criteria1: {
    // Curricular Aspects
    programsOffered: number;
    cbcsImplemented: boolean;
    feedbackMechanism: boolean;
    syllabusRevision: string;
    score: number;
    documents: string[];
  };
  
  criteria2: {
    // Teaching-Learning and Evaluation
    studentEnrollment: number;
    studentTeacherRatio: number;
    passPercentage: number;
    averageMarks: number;
    experientialLearning: boolean;
    score: number;
    documents: string[];
  };
  
  criteria3: {
    // Research, Innovations and Extension
    researchProjects: number;
    researchGrants: number;
    publications: number;
    patents: number;
    consultancy: number;
    extensionActivities: number;
    score: number;
    documents: string[];
  };
  
  criteria4: {
    // Infrastructure and Learning Resources
    classrooms: number;
    laboratories: number;
    libraryBooks: number;
    eResources: number;
    ictFacilities: boolean;
    physicalFacilities: boolean;
    score: number;
    documents: string[];
  };
  
  criteria5: {
    // Student Support and Progression
    scholarships: number;
    placementPercentage: number;
    higherStudies: number;
    studentActivities: number;
    alumniEngagement: boolean;
    score: number;
    documents: string[];
  };
  
  criteria6: {
    // Governance, Leadership and Management
    institutionalVision: boolean;
    decentralization: boolean;
    facultyEmpowerment: boolean;
    financialManagement: boolean;
    iqac: boolean;
    score: number;
    documents: string[];
  };
  
  criteria7: {
    // Institutional Values and Best Practices
    genderEquity: boolean;
    environmentalConsciousness: boolean;
    inclusivePractices: boolean;
    professionalEthics: boolean;
    bestPractices: number;
    score: number;
    documents: string[];
  };
  
  // Overall Scores
  totalScore: number;
  cgpa: number; // Out of 4
  grade: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C' | 'D';
  
  // NBA Specific (if applicable)
  nbaData?: {
    programOutcomes: number;
    courseOutcomes: number;
    attainmentLevel: number;
    industryInteraction: number;
    facultyQualification: number;
    infrastructureScore: number;
    overallScore: number;
  };
  
  // Metadata
  submittedBy: mongoose.Types.ObjectId; // HOD
  submittedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId; // Principal
  verifiedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId; // Principal/Admin
  approvedAt?: Date;
  rejectionReason?: string;
  comments: Array<{
    user: mongoose.Types.ObjectId;
    role: string;
    comment: string;
    timestamp: Date;
  }>;
  
  // Attachments
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const NAACReportSchema: Schema = new Schema(
  {
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true,
    },
    college: {
      type: Schema.Types.ObjectId,
      ref: 'College',
      required: false,
      index: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    reportType: {
      type: String,
      enum: ['naac', 'nba', 'both'],
      default: 'naac',
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'verified', 'rejected', 'approved'],
      default: 'draft',
      index: true,
    },
    
    // Student Profile & Enrollment Data
    studentData: {
      totalAdmitted: { type: Number, default: 0 },
      yearWiseAdmission: [{ year: String, count: Number }],
      categoryWise: {
        general: { type: Number, default: 0 },
        obc: { type: Number, default: 0 },
        sc: { type: Number, default: 0 },
        st: { type: Number, default: 0 },
        international: { type: Number, default: 0 },
      },
      dropoutRate: { type: Number, default: 0 },
      passPercentage: { type: Number, default: 0 },
    },
    
    // Student Achievements
    achievements: {
      awards: [{
        title: String,
        level: { type: String, enum: ['institute', 'state', 'national', 'international'] },
        studentName: String,
        date: Date,
      }],
      hackathons: { type: Number, default: 0 },
      researchPapers: { type: Number, default: 0 },
      certifications: [{
        platform: String,
        count: Number,
      }],
      startups: { type: Number, default: 0 },
    },
    
    // Academic Records
    academicRecords: {
      averageAttendance: { type: Number, default: 0 },
      passRate: { type: Number, default: 0 },
      subjectPerformance: [{
        subject: String,
        averageMarks: Number,
        passRate: Number,
      }],
    },
    
    // Placement & Internship Data
    placementData: {
      placementPercentage: { type: Number, default: 0 },
      totalPlaced: { type: Number, default: 0 },
      companies: [{
        name: String,
        studentsPlaced: Number,
      }],
      highestPackage: { type: Number, default: 0 },
      averagePackage: { type: Number, default: 0 },
      internships: { type: Number, default: 0 },
      internshipDomains: [String],
    },
    
    // Feedback Reports
    feedbackData: {
      studentFeedback: {
        averageRating: { type: Number, default: 0 },
        totalResponses: { type: Number, default: 0 },
      },
      alumniFeedback: {
        averageRating: { type: Number, default: 0 },
        totalResponses: { type: Number, default: 0 },
      },
      employerFeedback: {
        averageRating: { type: Number, default: 0 },
        totalResponses: { type: Number, default: 0 },
      },
    },
    
    // Extracurricular & Extension Activities
    extracurricular: {
      nssActivities: { type: Number, default: 0 },
      nccActivities: { type: Number, default: 0 },
      communityServices: { type: Number, default: 0 },
      clubsCount: { type: Number, default: 0 },
      eventsParticipation: { type: Number, default: 0 },
    },
    
    // Teaching-Learning & Faculty Data
    facultyData: {
      totalFaculty: { type: Number, default: 0 },
      phdHolders: { type: Number, default: 0 },
      mtechHolders: { type: Number, default: 0 },
      facultyAchievements: { type: Number, default: 0 },
      facultyResearch: { type: Number, default: 0 },
      studentTeacherRatio: { type: Number, default: 0 },
      mentoringRecords: { type: Number, default: 0 },
    },
    
    // NBA Specific Data
    nbaSpecificData: {
      poCo: {
        programOutcomes: { type: Number, default: 0 },
        courseOutcomes: { type: Number, default: 0 },
        attainmentMatrix: [{
          course: String,
          po: String,
          attainment: Number,
        }],
      },
      courseFiles: {
        syllabusCount: { type: Number, default: 0 },
        lecturePlansCount: { type: Number, default: 0 },
        assignmentsCount: { type: Number, default: 0 },
        attainmentCalculated: { type: Boolean, default: false },
      },
      studentPerformance: {
        internalMarksAvg: { type: Number, default: 0 },
        finalMarksAvg: { type: Number, default: 0 },
        coAttainment: { type: Number, default: 0 },
        weakStudentsIdentified: { type: Number, default: 0 },
      },
      industryRecords: {
        internshipLogs: { type: Number, default: 0 },
        industryVisits: { type: Number, default: 0 },
        mous: { type: Number, default: 0 },
      },
      projects: {
        finalYearProjects: { type: Number, default: 0 },
        miniProjects: { type: Number, default: 0 },
        researchPublications: { type: Number, default: 0 },
        patentsFiled: { type: Number, default: 0 },
      },
      professionalBodies: {
        ieeeMembers: { type: Number, default: 0 },
        isteMembers: { type: Number, default: 0 },
        csiMembers: { type: Number, default: 0 },
        activities: { type: Number, default: 0 },
      },
    },
    
    // NAAC Criteria
    criteria1: {
      programsOffered: { type: Number, default: 0 },
      cbcsImplemented: { type: Boolean, default: false },
      feedbackMechanism: { type: Boolean, default: false },
      syllabusRevision: { type: String, default: '' },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria2: {
      studentEnrollment: { type: Number, default: 0 },
      studentTeacherRatio: { type: Number, default: 0 },
      passPercentage: { type: Number, default: 0 },
      averageMarks: { type: Number, default: 0 },
      experientialLearning: { type: Boolean, default: false },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria3: {
      researchProjects: { type: Number, default: 0 },
      researchGrants: { type: Number, default: 0 },
      publications: { type: Number, default: 0 },
      patents: { type: Number, default: 0 },
      consultancy: { type: Number, default: 0 },
      extensionActivities: { type: Number, default: 0 },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria4: {
      classrooms: { type: Number, default: 0 },
      laboratories: { type: Number, default: 0 },
      libraryBooks: { type: Number, default: 0 },
      eResources: { type: Number, default: 0 },
      ictFacilities: { type: Boolean, default: false },
      physicalFacilities: { type: Boolean, default: false },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria5: {
      scholarships: { type: Number, default: 0 },
      placementPercentage: { type: Number, default: 0 },
      higherStudies: { type: Number, default: 0 },
      studentActivities: { type: Number, default: 0 },
      alumniEngagement: { type: Boolean, default: false },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria6: {
      institutionalVision: { type: Boolean, default: false },
      decentralization: { type: Boolean, default: false },
      facultyEmpowerment: { type: Boolean, default: false },
      financialManagement: { type: Boolean, default: false },
      iqac: { type: Boolean, default: false },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    criteria7: {
      genderEquity: { type: Boolean, default: false },
      environmentalConsciousness: { type: Boolean, default: false },
      inclusivePractices: { type: Boolean, default: false },
      professionalEthics: { type: Boolean, default: false },
      bestPractices: { type: Number, default: 0 },
      score: { type: Number, default: 0, min: 0, max: 100 },
      documents: [{ type: String }],
    },
    
    totalScore: {
      type: Number,
      default: 0,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
    grade: {
      type: String,
      enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D'],
      default: 'D',
    },
    
    nbaData: {
      programOutcomes: { type: Number, default: 0 },
      courseOutcomes: { type: Number, default: 0 },
      attainmentLevel: { type: Number, default: 0 },
      industryInteraction: { type: Number, default: 0 },
      facultyQualification: { type: Number, default: 0 },
      infrastructureScore: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 },
    },
    
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
        comment: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Calculate CGPA and Grade before saving
NAACReportSchema.pre('save', function (next) {
  const report = this as INAACReport;
  
  // Calculate total score (average of all 7 criteria)
  const scores = [
    report.criteria1.score,
    report.criteria2.score,
    report.criteria3.score,
    report.criteria4.score,
    report.criteria5.score,
    report.criteria6.score,
    report.criteria7.score,
  ];
  
  report.totalScore = scores.reduce((a, b) => a + b, 0) / 7;
  
  // Calculate CGPA (out of 4)
  report.cgpa = (report.totalScore / 100) * 4;
  
  // Assign Grade based on CGPA
  if (report.cgpa >= 3.51) report.grade = 'A++';
  else if (report.cgpa >= 3.26) report.grade = 'A+';
  else if (report.cgpa >= 3.01) report.grade = 'A';
  else if (report.cgpa >= 2.76) report.grade = 'B++';
  else if (report.cgpa >= 2.51) report.grade = 'B+';
  else if (report.cgpa >= 2.01) report.grade = 'B';
  else if (report.cgpa >= 1.51) report.grade = 'C';
  else report.grade = 'D';
  
  next();
});

// Indexes for better query performance
NAACReportSchema.index({ department: 1, academicYear: 1 });
NAACReportSchema.index({ college: 1, status: 1 });
NAACReportSchema.index({ submittedBy: 1 });

export default mongoose.model<INAACReport>('NAACReport', NAACReportSchema);
