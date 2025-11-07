import { Schema, model, Document } from 'mongoose';

export interface IPublicPortfolioProject {
  projectId: Schema.Types.ObjectId;
  name: string;
  description: string;
  languages: string[];
  frameworks: string[];
  tags: string[];
  projectType: string;
  screenshots: string[];
  demoVideoUrl?: string;
  githubRepoUrl?: string;
  vercelUrl?: string;
  approvedAt: Date;
}

export interface IPublicPortfolioAchievement {
  achievementId: Schema.Types.ObjectId;
  title: string;
  description: string;
  category?: string;
  type?: string;
  certificatePath?: string;
  media: Array<{
    url: string;
    type: string;
    caption?: string;
  }>;
  approvedAt: Date;
}

export interface IPublicPortfolioResume {
  resumeId: Schema.Types.ObjectId;
  template: number;
  data: any;
  approvedAt: Date;
}

export interface IPublicPortfolioMarks {
  subject: string;
  marks: number;
  examType: string;
  semester: number;
  approvedAt: Date;
}

export interface IPublicPortfolio extends Document {
  student: Schema.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  department: Schema.Types.ObjectId;
  departmentName: string;
  college: Schema.Types.ObjectId;
  collegeName: string;
  semester?: number;
  course?: string;
  batch?: string;
  
  // Profile information
  bio?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  
  // Approved content
  projects: IPublicPortfolioProject[];
  achievements: IPublicPortfolioAchievement[];
  resume?: IPublicPortfolioResume;
  marks: IPublicPortfolioMarks[];
  
  // Performance metrics
  totalProjects: number;
  totalAchievements: number;
  averageMarks?: number;
  
  // Visibility settings
  isPublic: boolean;
  lastUpdated: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const PublicPortfolioProjectSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  languages: [{ type: String }],
  frameworks: [{ type: String }],
  tags: [{ type: String }],
  projectType: { type: String },
  screenshots: [{ type: String }],
  demoVideoUrl: { type: String },
  githubRepoUrl: { type: String },
  vercelUrl: { type: String },
  approvedAt: { type: Date, required: true }
}, { _id: false });

const PublicPortfolioAchievementSchema = new Schema({
  achievementId: { type: Schema.Types.ObjectId, ref: 'Achievement', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String },
  type: { type: String },
  certificatePath: { type: String },
  media: [{
    url: { type: String, required: true },
    type: { type: String, required: true },
    caption: { type: String }
  }],
  approvedAt: { type: Date, required: true }
}, { _id: false });

const PublicPortfolioResumeSchema = new Schema({
  resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  template: { type: Number, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  approvedAt: { type: Date, required: true }
}, { _id: false });

const PublicPortfolioMarksSchema = new Schema({
  subject: { type: String, required: true },
  marks: { type: Number, required: true },
  examType: { type: String, required: true },
  semester: { type: Number },
  approvedAt: { type: Date, required: true }
}, { _id: false });

const PublicPortfolioSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentName: { type: String, required: true },
  college: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  collegeName: { type: String, required: true },
  semester: { type: Number },
  course: { type: String },
  batch: { type: String },
  
  bio: { type: String },
  skills: [{ type: String }],
  interests: [{ type: String }],
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
    portfolio: { type: String }
  },
  
  projects: [PublicPortfolioProjectSchema],
  achievements: [PublicPortfolioAchievementSchema],
  resume: PublicPortfolioResumeSchema,
  marks: [PublicPortfolioMarksSchema],
  
  totalProjects: { type: Number, default: 0 },
  totalAchievements: { type: Number, default: 0 },
  averageMarks: { type: Number },
  
  isPublic: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for efficient querying
PublicPortfolioSchema.index({ student: 1 });
PublicPortfolioSchema.index({ college: 1, department: 1 });
PublicPortfolioSchema.index({ isPublic: 1 });
PublicPortfolioSchema.index({ studentEmail: 1 });

export default model<IPublicPortfolio>('PublicPortfolio', PublicPortfolioSchema);
