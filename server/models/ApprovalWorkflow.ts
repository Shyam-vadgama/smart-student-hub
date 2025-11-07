import { Schema, model, Document } from 'mongoose';

export interface IApprovalStage {
  stageName: string;
  stageOrder: number;
  requiredRoles: ('faculty' | 'hod' | 'principal' | 'shiksan_mantri')[];
  requireAll: boolean; // If true, all roles must approve; if false, any one role can approve
  description?: string;
}

export interface IApprovalWorkflow extends Document {
  name: string;
  description: string;
  contentType: 'project' | 'achievement' | 'resume' | 'marks' | 'all';
  stages: IApprovalStage[];
  isActive: boolean;
  college: Schema.Types.ObjectId;
  department?: Schema.Types.ObjectId; // Optional: can be department-specific or college-wide
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalStageSchema = new Schema({
  stageName: { type: String, required: true },
  stageOrder: { type: Number, required: true },
  requiredRoles: [{ 
    type: String, 
    enum: ['faculty', 'hod', 'principal', 'shiksan_mantri'],
    required: true 
  }],
  requireAll: { type: Boolean, default: false },
  description: { type: String }
}, { _id: false });

const ApprovalWorkflowSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  contentType: { 
    type: String, 
    enum: ['project', 'achievement', 'resume', 'marks', 'all'],
    required: true 
  },
  stages: [ApprovalStageSchema],
  isActive: { type: Boolean, default: true },
  college: { type: Schema.Types.ObjectId, ref: 'College', required: false },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Index for efficient querying
ApprovalWorkflowSchema.index({ college: 1, department: 1, contentType: 1, isActive: 1 });

export default model<IApprovalWorkflow>('ApprovalWorkflow', ApprovalWorkflowSchema);
