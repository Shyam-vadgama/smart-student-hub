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
  vercelUrl?: string;
  deploymentStatus: 'Pending' | 'Deployed' | 'Failed' | 'Not Deployed';
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
  vercelUrl: { type: String },
  deploymentStatus: { 
    type: String, 
    enum: ['Pending', 'Deployed', 'Failed', 'Not Deployed'],
    default: 'Not Deployed'
  },
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
  }]
}, { timestamps: true });

export default model<IProject>('Project', ProjectSchema);
