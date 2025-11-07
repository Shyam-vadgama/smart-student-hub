import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  languages: string[];
  frameworks: string[];
  tags: string[];
  projectType: 'Web' | 'App' | 'AI' | 'IOT' | 'Research';
  collaborators: Schema.Types.ObjectId[];
  screenshots: string[];
  demoVideoUrl?: string;
  githubRepoUrl?: string;
  githubRepoId?: number;
  vercelUrl?: string;
  vercelProjectId?: string;
  vercelSettingsUrl?: string;
  projectFilePath?: string;
  deploymentStatus: 'Pending' | 'Deployed' | 'Failed' | 'Not Deployed';
  deploymentStep?: string;
  deploymentProgress?: number;
  uploadedBy: Schema.Types.ObjectId;
  deploymentType: 'Portfolio Only' | 'Portfolio + Deploy';
  isVerified: boolean;
  verifiedBy?: Schema.Types.ObjectId;
  deploymentHistory: {
    version: string;
    deployedAt: Date;
    status: string;
    url?: string;
  }[];
  // Public portfolio approval fields
  approvalStatus: 'not_requested' | 'pending' | 'approved' | 'rejected';
  approvalRequest?: Schema.Types.ObjectId;
  approvedAt?: Date;
  approvedBy?: Schema.Types.ObjectId;
  isPubliclyVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  languages: [{ type: String }],
  frameworks: [{ type: String }],
  tags: [{ type: String }],
  projectType: { 
    type: String, 
    enum: ['Web', 'App', 'AI', 'IOT', 'Research'],
    required: true 
  },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  screenshots: [{ type: String }],
  demoVideoUrl: { type: String },
  githubRepoUrl: { type: String },
  githubRepoId: { type: Number },
  vercelUrl: { type: String },
  vercelProjectId: { type: String },
  vercelSettingsUrl: { type: String },
  projectFilePath: { type: String },
  deploymentStatus: { 
    type: String, 
    enum: ['Pending', 'Deployed', 'Failed', 'Not Deployed'],
    default: 'Not Deployed'
  },
  deploymentStep: { type: String },
  deploymentProgress: { type: Number, default: 0 },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deploymentType: { 
    type: String, 
    enum: ['Portfolio Only', 'Portfolio + Deploy'],
    required: true 
  },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deploymentHistory: [{
    version: String,
    deployedAt: Date,
    status: String,
    url: String
  }],
  // Public portfolio approval fields
  approvalStatus: { 
    type: String, 
    enum: ['not_requested', 'pending', 'approved', 'rejected'],
    default: 'not_requested'
  },
  approvalRequest: { type: Schema.Types.ObjectId, ref: 'ApprovalRequest' },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  isPubliclyVisible: { type: Boolean, default: false }
}, { timestamps: true });

export default model<IProject>('Project', ProjectSchema);
